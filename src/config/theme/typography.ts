export type FontSizeKey = 'small' | 'medium' | 'large' | 'xlarge';

export const FontSizeScale: Record<FontSizeKey, { body: number; heading: number; caption: number }> = {
  small: { body: 13, heading: 20, caption: 11 },
  medium: { body: 16, heading: 24, caption: 13 },
  large: { body: 19, heading: 28, caption: 15 },
  xlarge: { body: 22, heading: 32, caption: 17 },
};

export const FontSizeOptions: FontSizeKey[] = ['small', 'medium', 'large', 'xlarge'];
