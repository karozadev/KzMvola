const THOUSANDS_FORMATTER = new Intl.NumberFormat('fr-FR');

/** Formate un nombre avec des espaces comme séparateurs de milliers, ex: 265000 -> "265 000". */
export function formatNumber(value: number): string {
  return THOUSANDS_FORMATTER.format(value).replace(/\s/g, ' ');
}

/** Formate un montant en Ariary, ex: 265000 -> "265 000 Ar". */
export function formatAriary(value: number): string {
  return `${formatNumber(value)} Ar`;
}

/** Extrait la valeur numérique d'une saisie utilisateur potentiellement formatée ("265 000 Ar"). */
export function parseAmountInput(raw: string): number {
  const digitsOnly = raw.replace(/[^\d]/g, '');
  return digitsOnly === '' ? 0 : Number.parseInt(digitsOnly, 10);
}

/** Nombre de chiffres présents dans `str` avant l'index `index`. */
export function countDigitsBeforeIndex(str: string, index: number): number {
  return (str.slice(0, index).match(/\d/g) || []).length;
}

/** Position (index) à placer juste après le `digitCount`-ième chiffre de `formatted`. */
export function cursorPositionAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}
