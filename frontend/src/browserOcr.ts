import Tesseract from 'tesseract.js'

const OCR_LANGUAGES = 'eng+hin'

export function createBrowserOcrWorker(onProgress: (status: string, progress: number) => void) {
  return Tesseract.createWorker(OCR_LANGUAGES, Tesseract.OEM.LSTM_ONLY, {
    logger: (message) => onProgress(message.status, message.progress),
  })
}
