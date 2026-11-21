/** Shared spacing and corner radii so screens line up with each other. */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;

export const Radius = {
  button: 14,
  card: 18,
  pill: 999,
} as const;

/** Soft drop shadow for white cards on the off-white background. */
export const cardShadow = '0 1px 2px rgba(43,43,43,0.06), 0 4px 12px rgba(43,43,43,0.05)';
