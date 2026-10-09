const CHECKS = [
  {
    category: 'Renewal & cancellation',
    title: 'Renewal or cancellation wording found',
    pattern: /auto(?:matic(?:ally)?)?[- ]?renew|renewal|cancel(?:lation)?|notice period|terminate/i,
    plain: 'This passage discusses renewal, cancellation, or termination. Check the deadline and steps the contract requires.',
    why: 'A missed deadline or required notice method could affect when you can leave or stop paying.',
  },
  {
    category: 'Additional charges',
    title: 'A fee or extra charge is mentioned',
    pattern: /additional fee|service charge|processing fee|late fee|penalty|charge of|surcharge|non-refundable/i,
    plain: 'This passage mentions a fee, penalty, or payment restriction. Check when it applies and how the amount is calculated.',
    why: 'The amount you pay may be higher than the headline price or harder to recover.',
  },
  {
    category: 'Refunds & termination',
    title: 'Refund or early-exit wording found',
    pattern: /refund|non-refundable|early termination|lock[- ]?in|minimum term|remaining subscription/i,
    plain: 'This passage describes a refund, minimum term, or early-exit condition.',
    why: 'These conditions can affect the cost of ending the service or recovering payments.',
  },
  {
    category: 'Changes to terms',
    title: 'The provider may change terms',
    pattern: /we may (?:change|modify|revise|update)|at our (?:sole )?discretion|continued use.*(?:accept|agree)/i,
    plain: 'The provider appears to reserve a right to change terms or treat continued use as acceptance.',
    why: 'Check how you will be notified, when changes take effect, and whether you can cancel.',
  },
  {
    category: 'Disputes',
    title: 'A dispute-resolution process is specified',
    pattern: /arbitrat(?:ion|or)|exclusive jurisdiction|courts? of|class action|dispute resolution/i,
    plain: 'This passage sets out where or how disputes must be handled.',
    why: 'The location and process may affect how practical it is to raise a dispute.',
  },
  {
    category: 'Liability',
    title: 'A liability limit or exclusion is mentioned',
    pattern: /liabilit(?:y|ies)|indirect damages|consequential damages|maximum extent permitted|not be responsible/i,
    plain: 'The provider appears to limit its responsibility for certain losses or claims.',
    why: 'Check which claims are covered and whether exceptions are listed elsewhere.',
  },
]

const NEXT_STEP = 'Read the surrounding section and check any related definitions, exceptions, and notice terms.'

function splitIntoPassages(text) {
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function scanContractText(text) {
  const passages = splitIntoPassages(text)
  const findings = []

  for (const check of CHECKS) {
    const match = passages.find((passage) => check.pattern.test(passage))
    if (!match) continue
    findings.push({
      id: `quick-${findings.length + 1}`,
      category: check.category,
      title: check.title,
      risk: 'Review',
      original_clause: match,
      plain_language: check.plain,
      why_it_matters: check.why,
      suggested_action: NEXT_STEP,
    })
  }

  return {
    analysis_mode: 'rules-prototype',
    contract_summary: findings.length
      ? `The local pattern scan surfaced ${findings.length} wording area${findings.length === 1 ? '' : 's'} to read more closely.`
      : 'The local pattern scan did not find wording from its limited set of English checks.',
    findings,
  }
}
