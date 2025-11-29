const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Palette = {
  cream: '#FDFCF4',
  warmBeige: '#F5F0E6',
  darkCharcoal: '#1A1A1A',
  softGrey: '#E0E0E0',
  accentOrange: '#FF8C69', // Approx from gradient
  accentPeach: '#FFCBA4', // Approx from gradient
  softYellow: '#F7EDC8',
};

export default {
  light: {
    text: Palette.darkCharcoal,
    background: Palette.cream,
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
  palette: Palette,
};
