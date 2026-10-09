from __future__ import annotations

import io
import json
import os
import re
import uuid
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parents[1]
MAX_FILE_BYTES = 12 * 1024 * 1024

app = FastAPI(
    title="Anugya Satyapak prototype API",
    version="0.1.0",
    description="A transparent, pattern-based contract scan for the Anugya Satyapak hackathon prototype.",
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


def extract_pdf(raw: bytes) -> tuple[str, bool]:
    try:
        import fitz
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="PDF extraction is unavailable. Install the backend requirements and restart the API.") from exc

    try:
        document = fitz.open(stream=raw, filetype="pdf")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="This PDF could not be opened. Try a different copy or paste its text.") from exc

    pages: list[str] = []
    used_ocr = False
    for page_index, page in enumerate(document, start=1):
        page_text = page.get_text("text").strip()
        if len(page_text) < 35:
            try:
                import pytesseract
                from PIL import Image
            except ImportError as exc:
                raise HTTPException(status_code=503, detail="This looks like a scanned PDF. Install the backend requirements and Tesseract OCR, or paste the text instead.") from exc
            try:
                pixmap = page.get_pixmap(dpi=180, alpha=False)
                image = Image.open(io.BytesIO(pixmap.tobytes("png")))
                page_text = pytesseract.image_to_string(image, lang="eng").strip()
                used_ocr = True
            except Exception as exc:
                raise HTTPException(status_code=422, detail=f"OCR could not read page {page_index}. Try a clearer scan or paste the text.") from exc
        pages.append(f"[Page {page_index}]\n{page_text}" if page_text else f"[Page {page_index}]\n")
    document.close()
    return "\n\n".join(pages).strip(), used_ocr


def extract_image(raw: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="Image OCR is unavailable. Install the backend requirements and Tesseract OCR, or paste the text instead.") from exc
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
        text = pytesseract.image_to_string(image, lang="eng").strip()
    except Exception as exc:
        raise HTTPException(status_code=422, detail="This image could not be read. Try a clearer photo or paste the text.") from exc
    if len(text) < 20:
        raise HTTPException(status_code=422, detail="Very little text was detected in this photo. Try a sharper image or paste the text.")
    return text


async def get_contract_text(text: str | None, file: UploadFile | None) -> tuple[str, str, str | None]:
    if file is None:
        content = (text or "").strip()
        if not content:
            raise HTTPException(status_code=422, detail="Add contract text or choose a file to review.")
        if len(content) > 80_000:
            raise HTTPException(status_code=413, detail="Pasted text must be 80,000 characters or fewer.")
        return content, "Pasted contract text", None

    raw = await file.read(MAX_FILE_BYTES + 1)
    if len(raw) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Files must be 12 MB or smaller.")
    filename = Path(file.filename or "contract").name
    suffix = Path(filename).suffix.lower()
    warning: str | None = None
    if suffix in {".txt", ".md"}:
        try:
            content = raw.decode("utf-8-sig").strip()
        except UnicodeDecodeError as exc:
            raise HTTPException(status_code=422, detail="This text file is not UTF-8 encoded. Save it as UTF-8 or paste the text.") from exc
    elif suffix == ".pdf":
        content, used_ocr = extract_pdf(raw)
        if used_ocr:
            warning = "Some pages were read with OCR. Check the quoted text against the original scan."
    elif suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        content = extract_image(raw)
        warning = "This image was read with OCR. Check the quoted text against the original photo."
    else:
        raise HTTPException(status_code=415, detail="Use a PDF, PNG, JPG, WEBP, TXT, or MD file.")
    if not content:
        raise HTTPException(status_code=422, detail="No readable text was found. Try a clearer scan or paste the text.")
    return content, filename, warning


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "rules-prototype"}


@app.post("/api/analyze")
async def analyze(
    text: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    jurisdiction: str = Form(default="India · Central"),
    language: str = Form(default="English"),
) -> dict[str, Any]:
    contract_text, document_name, extraction_warning = await get_contract_text(text, file)
    findings = scan_text(contract_text)
    citations_by_id = {citation["id"]: citation for finding in findings for citation in finding["citations"]}
    if findings:
        summary = f"This pattern-based scan surfaced {len(findings)} passage(s) across {len({item['category'] for item in findings})} categories for a closer read. It does not determine whether a term is fair, enforceable, or unlawful."
    else:
        summary = "This prototype scan did not find wording that matches its current patterns. That does not confirm the contract has no important or legally relevant terms."
    return {
        "report_id": str(uuid.uuid4()),
        "document_name": document_name,
        "jurisdiction": jurisdiction,
        "language": language,
        "analysis_mode": "backend",
        "contract_summary": summary,
        "findings": findings,
        "citations": list(citations_by_id.values()),
        "extraction_warning": extraction_warning,
    }
