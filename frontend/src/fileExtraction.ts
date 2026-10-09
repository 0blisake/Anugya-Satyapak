import type * as pdfjsTypes from 'pdfjs-dist'
import type { ExtractionResult } from './types'

const MAX_PDF_PAGES = 30
const MAX_IMAGE_EDGE = 2600

export type ExtractionProgress = (message: string) => void

async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  return pdfjs
}

function canvasForImage(file: File) {
  return createImageBitmap(file).then((bitmap) => {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      throw new Error('This browser could not prepare the image for text recognition.')
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas
  })
}

function canvasForPdfPage(page: pdfjsTypes.PDFPageProxy) {
  const initialViewport = page.getViewport({ scale: 1.8 })
  const scale = Math.min(1.8, MAX_IMAGE_EDGE / Math.max(initialViewport.width, initialViewport.height))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(viewport.width))
  canvas.height = Math.max(1, Math.ceil(viewport.height))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not render a PDF page for text recognition.')
  return page.render({ canvas, canvasContext: context, viewport }).promise.then(() => canvas)
}

type PdfTextItems = Awaited<ReturnType<pdfjsTypes.PDFPageProxy['getTextContent']>>['items']

function selectableText(items: PdfTextItems) {
  return items.map((item) => {
    if (!('str' in item)) return ''
    return `${item.str}${item.hasEOL ? '\n' : ' '}`
  }).join('').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

export async function extractFilesInBrowser(files: File[], onProgress: ExtractionProgress): Promise<ExtractionResult> {
  const warnings: string[] = []
  const extractedParts: string[] = []
  let pageCount = 0
  type OcrWorker = Awaited<ReturnType<typeof import('./browserOcr').createBrowserOcrWorker>>
  let ocrWorker: OcrWorker | null = null
  let ocrRequested = false
  let currentOcrLabel = 'Loading OCR engine'

  const getOcrWorker = async () => {
    if (ocrWorker) return ocrWorker
    ocrRequested = true
    onProgress('Downloading the OCR engine and English + Hindi language data…')
    const { createBrowserOcrWorker } = await import('./browserOcr')
    ocrWorker = await createBrowserOcrWorker((status, progress) => {
      if (status === 'recognizing text' || status === 'loading language traineddata' || status === 'initializing tesseract') {
        onProgress(`${currentOcrLabel} · ${status} ${Math.round(progress * 100)}%`)
      }
    })
    await ocrWorker.setParameters({ preserve_interword_spaces: '1' })
    return ocrWorker
  }

  const recognize = async (image: HTMLCanvasElement, label: string) => {
    currentOcrLabel = label
    const worker = await getOcrWorker()
    onProgress(`${label} · recognizing text…`)
    const result = await worker.recognize(image)
    image.width = 0
    image.height = 0
    return result.data.text.trim()
  }

  try {
    for (const [fileIndex, file] of files.entries()) {
      const fileLabel = `${file.name} (${fileIndex + 1}/${files.length})`
      onProgress(`Reading ${fileLabel}…`)

      if (/\.(txt|md)$/i.test(file.name)) {
        const text = (await file.text()).trim()
        if (text) {
          extractedParts.push(text)
          pageCount += 1
        }
        continue
      }

      if (/\.(png|jpe?g|webp)$/i.test(file.name)) {
        const canvas = await canvasForImage(file)
        const text = await recognize(canvas, `Screenshot ${fileIndex + 1}/${files.length}`)
        if (text) extractedParts.push(`[Page ${fileIndex + 1}]\n${text}`)
        else warnings.push(`${file.name}: no readable text was detected.`)
        pageCount += 1
        continue
      }

      if (/\.pdf$/i.test(file.name)) {
        onProgress(`Opening ${file.name}…`)
        const pdfjs = await loadPdfJs()
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
        try {
          const pdf = await loadingTask.promise
          const pagesToRead = Math.min(pdf.numPages, MAX_PDF_PAGES)
          if (pdf.numPages > pagesToRead) warnings.push(`${file.name}: this prototype processed the first ${MAX_PDF_PAGES} of ${pdf.numPages} pages.`)
          for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber += 1) {
            onProgress(`Reading ${file.name} · page ${pageNumber}/${pagesToRead}…`)
            const page = await pdf.getPage(pageNumber)
            const textContent = await page.getTextContent()
            let text = selectableText(textContent.items)
            if (text.replace(/\s/g, '').length < 24) {
              const canvas = await canvasForPdfPage(page)
              const scannedText = await recognize(canvas, `${file.name} · page ${pageNumber}/${pagesToRead}`)
              if (scannedText.length > text.length) text = scannedText
              if (!text) warnings.push(`${file.name}, page ${pageNumber}: no readable text was detected.`)
            }
            if (text) extractedParts.push(`[Page ${pageNumber}]\n${text}`)
            page.cleanup()
            pageCount += 1
          }
        } finally {
          await loadingTask.destroy()
        }
        continue
      }

      throw new Error(`${file.name}: this file type is not supported.`)
    }
  } catch (error) {
    if (ocrRequested && error instanceof Error && /fetch|network|traineddata|worker|wasm|language/i.test(error.message)) {
      throw new Error(`Browser OCR could not load. Check your internet connection and retry. Your contract file stays in this browser; OCR resources are downloaded from public CDNs. (${error.message})`)
    }
    throw error
  } finally {
    await (ocrWorker as OcrWorker | null)?.terminate()
  }

  const extractedText = extractedParts.join('\n\n').trim()
  if (!extractedText) throw new Error('No readable text was found. Try a clearer scan or paste the contract text instead.')
  return {
    document_name: files.length === 1 ? files[0].name : `${files.length} screenshots`,
    source_files: files.map((file) => file.name),
    extracted_text: extractedText,
    page_count: pageCount,
    warnings,
  }
}
