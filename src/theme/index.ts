// ─── Colour palette ──────────────────────────────────────────
// Dark-mode first.  Every value is consumed by the component layer;
// nothing is hard-coded in StyleSheets.

export const Colors = {
  // ── Surfaces ──
  bg: '#0A0A0F',
  bgElevated: '#141419',

  // ── Glass-morphism ──
  glassBg: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // ── Gradient pairs  (consumed by expo-linear-gradient) ──
  gradientPrimary: ['#7C3AED', '#6366F1'] as [string, string],
  gradientPink: ['#EC4899', '#A855F7'] as [string, string],
  gradientSuccess: ['#10B981', '#059669'] as [string, string],
  gradientWarning: ['#F59E0B', '#D97706'] as [string, string],
  gradientSunrise: ['#F97316', '#EC4899'] as [string, string],
  gradientDeep: ['#7C3AED', '#5B21B6'] as [string, string],

  // ── Typography ──
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textTertiary: 'rgba(255, 255, 255, 0.30)',

  // ── Semantic ──
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
  card: 20,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Font = {
  // sizes
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 40,
  hero: 54,

  // weights (kept as string – RN requirement)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};
