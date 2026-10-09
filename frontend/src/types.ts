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
  confidence: number
  page: number | null
  original_clause: string
  plain_language: string
  plain_language_hi?: string
  why_it_matters: string
  why_it_matters_hi?: string
  suggested_action: string
  citations: Citation[]
}

export type Report = {
  report_id: string
  document_name: string
  jurisdiction: string
  language: string
  analysis_mode: 'demo' | 'rules-prototype' | 'backend'
  contract_summary: string
  contract_summary_hi?: string
  findings: Finding[]
  citations: Citation[]
  extraction_warning?: string | null
}
