export const THEME_COOKIE = 'luxe_theme';

export const themes = ['light', 'dark'] as const;

export type Theme = (typeof themes)[number];

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}
