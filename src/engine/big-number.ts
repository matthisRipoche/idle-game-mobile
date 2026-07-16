export interface BigNumber {
  mantissa: number;
  exponent: number;
}

export const ZERO: BigNumber = { mantissa: 0, exponent: 0 };

function normalize(mantissa: number, exponent: number): BigNumber {
  if (mantissa === 0) {
    return ZERO;
  }

  const shift = Math.floor(Math.log10(Math.abs(mantissa)));
  return {
    mantissa: mantissa / Math.pow(10, shift),
    exponent: exponent + shift,
  };
}

export function fromNumber(value: number): BigNumber {
  return normalize(value, 0);
}

export function fromLog10(log10Value: number): BigNumber {
  const exponent = Math.floor(log10Value);
  return {
    mantissa: Math.pow(10, log10Value - exponent),
    exponent,
  };
}

export function add(a: BigNumber, b: BigNumber): BigNumber {
  if (a.mantissa === 0) return b;
  if (b.mantissa === 0) return a;

  const [big, small] = a.exponent >= b.exponent ? [a, b] : [b, a];
  const diff = big.exponent - small.exponent;

  if (diff > 15) {
    return big;
  }

  return normalize(big.mantissa + small.mantissa / Math.pow(10, diff), big.exponent);
}

export function subtract(a: BigNumber, b: BigNumber): BigNumber {
  if (b.mantissa === 0) return a;

  const diff = a.exponent - b.exponent;
  if (diff > 15) {
    return a;
  }

  return normalize(a.mantissa - b.mantissa / Math.pow(10, diff), a.exponent);
}

export function multiply(a: BigNumber, scalar: number): BigNumber {
  if (scalar === 0 || a.mantissa === 0) {
    return ZERO;
  }

  return normalize(a.mantissa * scalar, a.exponent);
}

export function compare(a: BigNumber, b: BigNumber): number {
  if (a.exponent !== b.exponent) {
    return a.exponent > b.exponent ? 1 : -1;
  }
  if (a.mantissa === b.mantissa) {
    return 0;
  }
  return a.mantissa > b.mantissa ? 1 : -1;
}

const SUFFIX_TIERS: { maxExponent: number; base: number; suffix: string }[] = [
  { maxExponent: 6, base: 3, suffix: 'K' },
  { maxExponent: 9, base: 6, suffix: 'M' },
];

export function format(value: BigNumber): string {
  if (value.exponent < 3) {
    return Math.round(value.mantissa * Math.pow(10, value.exponent)).toString();
  }

  for (const tier of SUFFIX_TIERS) {
    if (value.exponent < tier.maxExponent) {
      const scaled = value.mantissa * Math.pow(10, value.exponent - tier.base);
      return `${scaled.toFixed(1)}${tier.suffix}`;
    }
  }

  if (value.exponent < 1000) {
    return `${value.mantissa.toFixed(2)}e${value.exponent}`;
  }

  return `10^${value.exponent.toExponential(2)}`;
}
