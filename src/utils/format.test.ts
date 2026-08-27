import { describe, expect, it } from 'vitest';
import {
  countDigitsBeforeIndex,
  cursorPositionAfterDigits,
  formatAriary,
  formatNumber,
  parseAmountInput,
} from './format';

// `formatNumber` normalise le séparateur de milliers en espace insécable
// (U+00A0) pour éviter que « 265 000 Ar » ne se coupe en fin de ligne.
const NBSP = ' ';

describe('formatNumber', () => {
  it('sépare les milliers par une espace insécable', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1_000)).toBe(`1${NBSP}000`);
    expect(formatNumber(265_000)).toBe(`265${NBSP}000`);
    expect(formatNumber(20_000_000)).toBe(`20${NBSP}000${NBSP}000`);
  });

  it('ne contient jamais d\'espace sécable', () => {
    expect(formatNumber(1_234_567)).not.toMatch(/ /);
  });
});

describe('formatAriary', () => {
  it('ajoute le suffixe Ar', () => {
    expect(formatAriary(265_000)).toBe(`265${NBSP}000${NBSP}Ar`);
  });
});

describe('parseAmountInput', () => {
  it('extrait les chiffres, quel que soit le formatage', () => {
    expect(parseAmountInput('265 000 Ar')).toBe(265_000);
    expect(parseAmountInput('1.234.567')).toBe(1_234_567);
    expect(parseAmountInput('  42 000  ')).toBe(42_000);
  });

  it('renvoie 0 pour une saisie sans chiffre', () => {
    expect(parseAmountInput('')).toBe(0);
    expect(parseAmountInput('Ar')).toBe(0);
  });
});

describe('countDigitsBeforeIndex', () => {
  it('compte les chiffres situés avant la position du curseur', () => {
    expect(countDigitsBeforeIndex('265 000', 0)).toBe(0);
    expect(countDigitsBeforeIndex('265 000', 3)).toBe(3);
    expect(countDigitsBeforeIndex('265 000', 7)).toBe(6);
  });
});

describe('cursorPositionAfterDigits', () => {
  it('replace le curseur juste après le n-ième chiffre du texte formaté', () => {
    expect(cursorPositionAfterDigits('265 000', 0)).toBe(0);
    expect(cursorPositionAfterDigits('265 000', 3)).toBe(3);
    expect(cursorPositionAfterDigits('265 000', 6)).toBe(7);
  });

  it('reste dans les bornes quand on demande plus de chiffres que disponible', () => {
    expect(cursorPositionAfterDigits('265 000', 99)).toBe('265 000'.length);
  });

  it('conserve le nombre de chiffres à gauche du curseur après reformatage', () => {
    const before = '2650';
    const digitsLeft = countDigitsBeforeIndex(before, 3); // "265|0" -> 3 chiffres
    const after = formatNumber(parseAmountInput(before)); // "2 650"
    const pos = cursorPositionAfterDigits(after, digitsLeft);
    expect(countDigitsBeforeIndex(after, pos)).toBe(digitsLeft);
  });
});
