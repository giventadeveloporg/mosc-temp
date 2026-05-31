/**
 * Malayalam liturgy text helpers.
 *
 * Strapi imports from Panjangom PDFs sometimes store ML-TT / legacy font keystrokes
 * (ASCII-like text) instead of Unicode Malayalam (U+0D00–U+0D7F). Those strings
 * cannot be fixed in CSS — they must be re-imported as proper Unicode in Strapi.
 */

/** True when the string contains Malayalam Unicode script. */
export function hasMalayalamScript(text: string): boolean {
  return /[\u0D00-\u0D7F]/.test(text);
}

/**
 * Heuristic for legacy font encoding stored in Strapi (not UTF-8 corruption).
 * Example: "...o_ms∏-cp-∂m-fn-\\p-tijw H∂mw Rmb-¿. (\\ndw 1)"
 */
export function isLegacyEncodedMalayalamPlaceholder(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (hasMalayalamScript(t)) return false;
  return (
    /\\[a-z]{1,4}/i.test(t) ||
    /[∏∂¿]/.test(t) ||
    /_ms|_fn|\\p-|\\ndw/i.test(t)
  );
}

/**
 * Pick text to show for Malayalam UI: use Unicode ML when valid, else English.
 */
export function resolveMalayalamDisplayText(
  ml: string,
  en: string,
): { text: string; usedEnglishFallback: boolean } {
  const mlTrim = ml.trim();
  const enTrim = en.trim();

  if (!mlTrim) {
    return { text: enTrim, usedEnglishFallback: Boolean(enTrim) };
  }
  if (hasMalayalamScript(mlTrim)) {
    return { text: mlTrim, usedEnglishFallback: false };
  }
  if (isLegacyEncodedMalayalamPlaceholder(mlTrim) && enTrim) {
    return { text: enTrim, usedEnglishFallback: true };
  }
  return { text: mlTrim, usedEnglishFallback: false };
}

/** Any Malayalam field on a liturgy day lacks Unicode script. */
export function liturgyDayNeedsMalayalamReimport(day: {
  dayHeadingMalylm: string;
  seasonNameMalylm: string;
  readings?: Array<{
    liturgyHeadingMalylm: string;
    contentPlaceMalylm: string;
  }>;
}): boolean {
  const fields = [
    day.dayHeadingMalylm,
    day.seasonNameMalylm,
    ...(day.readings ?? []).flatMap((r) => [r.liturgyHeadingMalylm, r.contentPlaceMalylm]),
  ];
  return fields.some(
    (f) => f.trim().length > 0 && !hasMalayalamScript(f) && isLegacyEncodedMalayalamPlaceholder(f),
  );
}
