export type Citation = {
  id: string
  title: string
  section: string
  description: string
  relevance: string
  url: string
}

export type Finding = {
  id: string
  category: string
  title: string
  risk: 'Review' | 'Moderate' | 'Informational'
  confidence: number | 'low' | 'medium' | 'high'
  page: number | null
  original_clause: string
  plain_language: string
  plain_language_hi?: string
  why_it_matters: string
  why_it_matters_hi?: string
  suggested_action: string
  uncertainties?: string[]
  citations: Citation[]
}

export type Report = {
  report_id: string
  document_name: string
  jurisdiction: string
  language: string
  analysis_mode: 'demo' | 'rules-prototype' | 'backend' | 'ai-assisted-prototype'
  contract_summary: string
  contract_summary_hi?: string
  findings: Finding[]
  citations: Citation[]
  extraction_warning?: string | null
  analysis_warning?: string | null
}

export type ExtractionResult = {
  document_name: string
  source_files: string[]
  extracted_text: string
  page_count: number
  warnings: string[]
}

export type ApiHealth = {
  status: string
  mode: string
  ai_available: boolean
  ai_message: string
  ocr_available: boolean
  ocr_message: string
  limits: {
    file_bytes: number
    batch_bytes: number
    batch_files: number
    text_characters: number
  }
}
