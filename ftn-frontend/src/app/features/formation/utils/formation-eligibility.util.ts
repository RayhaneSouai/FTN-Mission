export interface EligibilityResult {
  eligible: boolean;
  message: string;
  error?: boolean;
}

export interface ParsedEligibilityMessage {
  explanation: string;
  recommendation: string | null;
  /** Plain text when the message is not structured (e.g. service not configured). */
  fallback: string;
}

/** Strip markdown and split Gemini responses into readable sections. */
export function parseEligibilityMessage(message: string): ParsedEligibilityMessage {
  if (!message?.trim()) {
    return { explanation: '', recommendation: null, fallback: '' };
  }

  let text = message.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  text = text.replace(/^D[ÉE]CISION\s*:\s*(NON\s*)?[ÉE]LIGIBLE\s*/i, '').trim();

  let explanation = '';
  let recommendation: string | null = null;

  const recMatch = text.match(/\bRecommandation\s*:\s*([\s\S]*)/i);
  if (recMatch) {
    recommendation = recMatch[1].trim();
    text = text.slice(0, recMatch.index).trim();
  }

  const explMatch = text.match(/\bExplication\s*:\s*([\s\S]*)/i);
  if (explMatch) {
    explanation = explMatch[1].trim();
  }

  const hasStructure = !!explMatch || !!recMatch;
  if (hasStructure) {
    return { explanation, recommendation, fallback: '' };
  }

  return {
    explanation: '',
    recommendation: null,
    fallback: message.replace(/\*\*/g, '').trim()
  };
}
