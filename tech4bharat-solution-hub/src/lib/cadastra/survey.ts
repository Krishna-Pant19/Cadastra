// Survey numbers come as "Sy. No. 112/3", "112 / 3", "112/3A", "45/1 A".
export function normalizeSurveyNo(input: string): string {
  return input
    .toUpperCase()
    .replace(/SY\.?\s*NO\.?|SURVEY\s*(NO\.?|NUMBER)?|S\.?\s*NO\.?/g, "")
    .replace(/\s+/g, "")
    .replace(/[-\\]/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

export function sameSurveyNo(a: string, b: string): boolean {
  return normalizeSurveyNo(a) === normalizeSurveyNo(b);
}
