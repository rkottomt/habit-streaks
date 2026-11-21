/**
 * App palette. The four brand colors come from SPEC.md → Design; the rest are tints and
 * pressed shades derived from them so every screen stays on-palette.
 */
export const AppColors = {
  // Spec colors
  background: '#F7F7F2',
  accent: '#FF7A45',
  text: '#2B2B2B',
  danger: '#D64545',

  // Surfaces
  card: '#FFFFFF',
  cardPressed: '#F1F1EA',
  border: '#E4E4DC',

  // Supporting text
  textMuted: '#6B6B6B',

  // Accent variations
  accentPressed: '#EB6430',
  accentSoft: '#FFEDE3',
  /**
   * Text/icons drawn on orange. White on #FF7A45 is only ~2.6:1 contrast (hard to read),
   * while the spec's dark gray is ~6.8:1, so orange surfaces use dark text.
   */
  onAccent: '#2B2B2B',

  // Danger variations
  dangerPressed: '#B93636',
  onDanger: '#FFFFFF',
} as const;
