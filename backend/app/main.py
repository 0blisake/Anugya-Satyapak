from __future__ import annotations

import io
import json
import os
import re
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

from app.ai_review import ai_configuration, analyze_with_ai

MAX_FILE_BYTES = 12 * 1024 * 1024
MAX_BATCH_BYTES = 30 * 1024 * 1024
MAX_BATCH_FILES = 10
MAX_TEXT_CHARS = 250_000
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
SUPPORTED_SUFFIXES = IMAGE_SUFFIXES | {".pdf", ".txt", ".md"}

app = FastAPI(
    title="Anugya Satyapak prototype API",
    version="0.2.0",
    description="A cautious contract-review prototype with evidence-validated AI and rule-based modes.",
)
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ANUGYA_SATYAPAK_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def load_sources() -> dict[str, dict[str, Any]]:
    source_path = ROOT / "data" / "legal_sources.json"
    with source_path.open("r", encoding="utf-8") as handle:
        return {item["id"]: item for item in json.load(handle)}


SOURCES = load_sources()

RULES = [
    {
        "category": "Renewal & cancellation",
        "title": "Renewal or cancellation wording found",
        "pattern": re.compile(r"auto(?:matic(?:ally)?)?[- ]?renew|renewal|cancel(?:lation)?|notice period|terminate", re.I),
        "plain": "This passage discusses renewal, cancellation, or termination. Check the deadline and steps the contract requires.",
        "why": "A missed deadline or required notice method could affect when you can leave or stop paying.",
    },
    {
        "category": "Additional charges",
        "title": "A fee or extra charge is mentioned",
        "pattern": re.compile(r"additional fee|service charge|processing fee|late fee|penalty|charge of|surcharge|non-refundable", re.I),
        "plain": "This passage mentions a fee, penalty, or payment restriction. Check when it applies and how the amount is calculated.",
        "why": "The amount you pay may be higher than the headline price or harder to recover.",
    },
    {
        "category": "Refunds & termination",
        "title": "Refund or early-exit wording found",
        "pattern": re.compile(r"refund|non-refundable|early termination|lock[- ]?in|minimum term|remaining subscription", re.I),
        "plain": "This passage describes a refund, minimum term, or early-exit condition.",
        "why": "These conditions can affect the cost of ending the service or recovering payments.",
    },
    {
        "category": "Changes to terms",
        "title": "The provider may change terms",
        "pattern": re.compile(r"we may (?:change|modify|revise|update)|at our (?:sole )?discretion|continued use.*(?:accept|agree)", re.I),
        "plain": "The provider appears to reserve a right to change terms or treat continued use as acceptance.",
        "why": "Check how you will be notified, when changes take effect, and whether you can cancel.",
    },
    {
        "category": "Disputes",
        "title": "A dispute-resolution process is specified",
        "pattern": re.compile(r"arbitrat(?:ion|or)|exclusive jurisdiction|courts? of|class action|dispute resolution", re.I),
        "plain": "This passage sets out where or how disputes must be handled.",
        "why": "The location and process may affect how practical it is to raise a dispute.",
    },
    {
        "category": "Liability",
        "title": "A liability limit or exclusion is mentioned",
        "pattern": re.compile(r"liabilit(?:y|ies)|indirect damages|consequential damages|maximum extent permitted|not be responsible", re.I),
        "plain": "The provider appears to limit its responsibility for certain losses or claims.",
        "why": "Check which claims are covered and whether exceptions are listed elsewhere.",
    },
]


def make_citations(paragraph: str) -> list[dict[str, str]]:
    selected: list[dict[str, str]] = []
    if re.search(r"penalt|early termination|cancellation charge|cancel(?:lation)? fee", paragraph, re.I):
        selected.append(SOURCES["cp-act-2-46-ii"])
    if re.search(r"additional fee|service charge|processing fee|late fee|surcharge|charge of", paragraph, re.I):
        selected.append(SOURCES["cp-act-2-46-vi"])
    return [
        {key: str(value) for key, value in source.items() if key in {"id", "title", "section", "description", "relevance", "url"}}
        for source in selected
    ]


def scan_text(text: str) -> list[dict[str, Any]]:
    page_marker = re.compile(r"(?m)^\[Page (\d+)\]\s*$")
    markers = list(page_marker.finditer(text))
    page_paragraphs: list[tuple[int | None, str]] = []
    if markers:
        for index, marker in enumerate(markers):
            end = markers[index + 1].start() if index + 1 < len(markers) else len(text)
            page_text = text[marker.end():end]
            page_paragraphs.extend((int(marker.group(1)), part.strip()) for part in re.split(r"\n+|(?<=[.!?;])\s+(?=[A-Z])", page_text) if part.strip())
    else:
        page_paragraphs = [(None, part.strip()) for part in re.split(r"\n+|(?<=[.!?;])\s+(?=[A-Z])", text) if part.strip()]
    findings: list[dict[str, Any]] = []
    for rule in RULES:
        for page_number, paragraph in page_paragraphs:
            if not rule["pattern"].search(paragraph):
                continue
            findings.append(
                {
                    "id": f"finding-{len(findings) + 1}",
                    "category": rule["category"],
                    "title": rule["title"],
                    "risk": "Review",
                    "confidence": 0.58,
                    "page": page_number,
                    "original_clause": paragraph,
                    "plain_language": rule["plain"],
                    "why_it_matters": rule["why"],
                    "suggested_action": "Read the surrounding section and check any related definitions, exceptions, and notice terms.",
                    "citations": make_citations(paragraph),
                }
            )
            break
    return findings


@lru_cache(maxsize=1)
def ocr_runtime_status() -> dict[str, Any]:
    """Report OCR readiness without exposing local executable paths."""
    try:
        import pytesseract
    except ImportError:
        return {"available": False, "message": "The Python OCR package is not installed."}

    try:
        pytesseract.get_tesseract_version()
    except pytesseract.TesseractNotFoundError:
        return {"available": False, "message": "The Tesseract OCR application is not installed or is not available on the API server's PATH."}
    except Exception:
        return {"available": False, "message": "Tesseract is installed but could not be started by the API."}

    try:
        if "eng" not in pytesseract.get_languages(config=""):
            return {"available": False, "message": "Tesseract is installed, but its English language data is missing on the API server."}
    except Exception:
        return {"available": False, "message": "Tesseract is installed, but its language data could not be checked by the API."}

    try:
        from PIL import Image  # noqa: F401
    except ImportError:
        return {"available": False, "message": "Pillow, required to prepare images for OCR, is not installed."}

    return {"available": True, "message": "OCR is ready for English text."}


def ocr_image(image: Any) -> str:
    status = ocr_runtime_status()
    if not status["available"]:
        raise HTTPException(status_code=503, detail=status["message"])

    import pytesseract

    try:
        return pytesseract.image_to_string(image, lang="eng").strip()
    except pytesseract.TesseractError as exc:
        message = str(exc).lower()
        if "error opening data file" in message or "failed loading language" in message:
            raise HTTPException(status_code=503, detail="Tesseract is available, but its English language data is missing on the API server.") from exc
        raise HTTPException(status_code=422, detail="Tesseract could not read this image. Try a clearer, upright image or correct the extracted text manually.") from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail="OCR failed while reading this image. Try a clearer, upright image or correct the extracted text manually.") from exc


def format_pdf_pages(pages: list[str]) -> str:
    return "\n\n".join(f"[Page {number}]\n{text}" for number, text in enumerate(pages, start=1)).strip()


def extract_pdf(raw: bytes) -> tuple[str, bool, int, list[str]]:
    try:
        import fitz
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="PDF extraction is unavailable. Install the backend requirements and restart the API.") from exc

    try:
        document = fitz.open(stream=raw, filetype="pdf")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="This PDF could not be opened. Try a different copy or paste its text.") from exc

    pages: list[str] = []
    warnings: list[str] = []
    used_ocr = False
    for page_index, page in enumerate(document, start=1):
        page_text = page.get_text("text").strip()
        if len(page_text) < 35:
            ocr_status = ocr_runtime_status()
            if not ocr_status["available"]:
                if page_text:
                    warnings.append(f"Page {page_index} has little selectable text. OCR could not check the rest of this page: {ocr_status['message']}")
                    pages.append(page_text)
                    continue
                document.close()
                raise HTTPException(status_code=503, detail=f"Page {page_index} appears to need OCR, but OCR is unavailable: {ocr_status['message']}")
            try:
                pixmap = page.get_pixmap(dpi=180, alpha=False)
            except Exception as exc:
                document.close()
                raise HTTPException(status_code=422, detail=f"Page {page_index} could not be rendered for OCR. Try another PDF copy.") from exc

            try:
                from PIL import Image, ImageOps
            except ImportError as exc:
                document.close()
                raise HTTPException(status_code=503, detail="Scanned PDF OCR requires Pillow. Install the backend requirements and restart the API.") from exc

            try:
                with Image.open(io.BytesIO(pixmap.tobytes("png"))) as image:
                    page_text = ocr_image(ImageOps.exif_transpose(image).convert("RGB"))
                used_ocr = True
                if len(page_text) < 40:
                    warnings.append(f"Page {page_index} produced very little OCR text. Check and correct this page before reviewing it.")
            except HTTPException as exc:
                document.close()
                raise HTTPException(status_code=exc.status_code, detail=f"Page {page_index}: {exc.detail}") from exc
            except Exception as exc:
                document.close()
                raise HTTPException(status_code=422, detail=f"Page {page_index} could not be rendered for OCR. Try another PDF copy.") from exc
        if not page_text:
            warnings.append(f"No readable text was found on page {page_index}.")
        pages.append(page_text)
    document.close()
    if not any(pages):
        raise HTTPException(status_code=422, detail="No readable text was found in this PDF. It may be blank, image-only, or too unclear to extract.")
    return format_pdf_pages(pages), used_ocr, len(pages), warnings


def extract_image(raw: bytes) -> tuple[str, list[str]]:
    try:
        from PIL import Image, ImageOps
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Image preparation is unavailable. Install the backend image/OCR requirements and restart the API.") from exc

    try:
        with Image.open(io.BytesIO(raw)) as image:
            prepared = ImageOps.exif_transpose(image).convert("RGB")
            text = ocr_image(prepared)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=422, detail="This image could not be opened. Try a clear PNG, JPG, or WEBP image in the correct orientation.") from exc
    if not text:
        raise HTTPException(status_code=422, detail="No readable text was detected in this image. Try a sharper, well-lit image or enter the text manually.")
    warnings = []
    if len(text) < 40:
        warnings.append("This image produced very little OCR text. Check and correct the extracted text before reviewing it.")
    return text, warnings


def safe_filename(upload: UploadFile) -> str:
    return Path((upload.filename or "contract").replace("\\", "/")).name or "contract"


def resolve_uploads(file: UploadFile | None, files: list[UploadFile] | None) -> list[UploadFile]:
    if file is not None and files:
        raise HTTPException(status_code=422, detail="Send either the legacy single-file field or the multiple-files field, not both.")
    uploads = files or ([file] if file is not None else [])
    if not uploads:
        raise HTTPException(status_code=422, detail="Choose a PDF, image, or text file to extract.")
    if len(uploads) > MAX_BATCH_FILES:
        raise HTTPException(status_code=413, detail=f"Choose {MAX_BATCH_FILES} files or fewer in one batch.")
    if len(uploads) > 1 and not all(Path(safe_filename(upload)).suffix.lower() in IMAGE_SUFFIXES for upload in uploads):
        raise HTTPException(status_code=415, detail="A multi-file batch must contain screenshots only. Upload a PDF or text document by itself.")
    return uploads


async def extract_uploads(uploads: list[UploadFile]) -> dict[str, Any]:
    extracted_parts: list[str] = []
    warnings: list[str] = []
    source_files: list[str] = []
    total_bytes = 0
    next_page = 1

    for upload in uploads:
        filename = safe_filename(upload)
        source_files.append(filename)
        suffix = Path(filename).suffix.lower()
        if suffix not in SUPPORTED_SUFFIXES:
            raise HTTPException(status_code=415, detail=f"{filename}: use PDF, PNG, JPG, WEBP, TXT, or MD.")

        raw = await upload.read(MAX_FILE_BYTES + 1)
        if len(raw) > MAX_FILE_BYTES:
            raise HTTPException(status_code=413, detail=f"{filename}: files must be 12 MB or smaller.")
        total_bytes += len(raw)
        if total_bytes > MAX_BATCH_BYTES:
            raise HTTPException(status_code=413, detail="The selected files total more than 30 MB. Remove some files or choose smaller images.")
        if not raw:
            raise HTTPException(status_code=422, detail=f"{filename}: the file is empty.")

        try:
            if suffix in {".txt", ".md"}:
                try:
                    content = raw.decode("utf-8-sig").strip()
                except UnicodeDecodeError as exc:
                    raise HTTPException(status_code=422, detail="This text file is not UTF-8 encoded. Save it as UTF-8 or paste the text.") from exc
                page_count = 1
                file_warnings: list[str] = []
            elif suffix == ".pdf":
                content, used_ocr, page_count, file_warnings = extract_pdf(raw)
                if used_ocr:
                    file_warnings.insert(0, "One or more PDF pages were read with OCR. Check the extracted text against the original pages.")
            else:
                content, file_warnings = extract_image(raw)
                page_count = 1
                content = f"[Page {next_page}]\n{content}"
                next_page += 1

            if not content.strip():
                raise HTTPException(status_code=422, detail="No readable text was found in this file.")
            extracted_parts.append(content)
            warnings.extend(f"{filename}: {warning}" for warning in file_warnings)
            if suffix == ".pdf":
                next_page += page_count
        except HTTPException as exc:
            detail = str(exc.detail)
            if detail.startswith(f"{filename}:"):
                raise
            raise HTTPException(status_code=exc.status_code, detail=f"{filename}: {detail}") from exc

    extracted_text = "\n\n".join(part for part in extracted_parts if part.strip()).strip()
    if not extracted_text:
        raise HTTPException(status_code=422, detail="No readable text was extracted from the selected files.")
    if len(extracted_text) > MAX_TEXT_CHARS:
        raise HTTPException(status_code=413, detail=f"The extracted text is longer than {MAX_TEXT_CHARS:,} characters. Split the contract into smaller parts.")

    if len(source_files) == 1:
        document_name = source_files[0]
    else:
        document_name = f"{len(source_files)} screenshots"
    return {
        "document_name": document_name,
        "source_files": source_files,
        "extracted_text": extracted_text,
        "page_count": next_page - 1,
        "warnings": warnings,
    }


async def get_analysis_input(
    text: str | None,
    document_name: str | None,
    file: UploadFile | None,
    files: list[UploadFile] | None,
) -> tuple[str, str, str | None]:
    uploads = resolve_uploads(file, files) if file is not None or files else []
    content = (text or "").strip()
    if content and uploads:
        raise HTTPException(status_code=422, detail="Send pasted/extracted text or file uploads, not both in the same request.")
    if uploads:
        result = await extract_uploads(uploads)
        warning = " ".join(result["warnings"]) or None
        return result["extracted_text"], result["document_name"], warning
    if not content:
        raise HTTPException(status_code=422, detail="Add contract text or choose a file to review.")
    if len(content) > MAX_TEXT_CHARS:
        raise HTTPException(status_code=413, detail=f"Text must be {MAX_TEXT_CHARS:,} characters or fewer.")
    return content, (document_name or "Pasted contract text").strip() or "Pasted contract text", None


@app.get("/api/health")
def health() -> dict[str, Any]:
    ocr = ocr_runtime_status()
    ai = ai_configuration()
    return {
        "status": "ok",
        "mode": "ai-assisted-prototype" if ai["available"] else "rules-prototype",
        "ai_available": ai["available"],
        "ai_message": ai["message"],
        "ocr_available": ocr["available"],
        "ocr_message": ocr["message"],
        "limits": {
            "file_bytes": MAX_FILE_BYTES,
            "batch_bytes": MAX_BATCH_BYTES,
            "batch_files": MAX_BATCH_FILES,
            "text_characters": MAX_TEXT_CHARS,
        },
    }


@app.post("/api/extract")
async def extract(
    file: UploadFile | None = File(default=None),
    files: list[UploadFile] | None = File(default=None),
) -> dict[str, Any]:
    uploads = resolve_uploads(file, files)
    return await extract_uploads(uploads)


@app.post("/api/analyze")
async def analyze(
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    files: list[UploadFile] | None = File(default=None),
    document_name: str | None = Form(default=None),
    jurisdiction: str = Form(default="India · Central"),
    language: str = Form(default="English"),
    ai_consent: bool = Form(default=False),
) -> dict[str, Any]:
    contract_text, resolved_document_name, extraction_warning = await get_analysis_input(text, document_name, file, files)
    ai = ai_configuration()
    if ai["available"]:
        if not ai_consent:
            raise HTTPException(status_code=422, detail="Confirm the AI processing notice before starting this review.")
        ai_result = await analyze_with_ai(contract_text, jurisdiction, language, SOURCES)
        findings = ai_result["findings"]
        summary = ai_result["contract_summary"]
        citations = ai_result["citations"]
        analysis_mode = ai_result["analysis_mode"]
        analysis_warning = ai_result["analysis_warning"]
    else:
        findings = scan_text(contract_text)
        citations_by_id = {citation["id"]: citation for finding in findings for citation in finding["citations"]}
        if findings:
            summary = f"This pattern-based scan surfaced {len(findings)} passage(s) across {len({item['category'] for item in findings})} categories for a closer read. It does not determine whether a term is fair, enforceable, or unlawful."
        else:
            summary = "This prototype scan did not find wording that matches its current patterns. That does not confirm the contract has no important or legally relevant terms."
        citations = list(citations_by_id.values())
        analysis_mode = "rules-prototype"
        analysis_warning = None
    return {
        "report_id": str(uuid.uuid4()),
        "document_name": resolved_document_name,
        "jurisdiction": jurisdiction,
        "language": language,
        "analysis_mode": analysis_mode,
        "contract_summary": summary,
        "findings": findings,
        "citations": citations,
        "extraction_warning": extraction_warning,
        "analysis_warning": analysis_warning,
    }
