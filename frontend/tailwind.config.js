export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2E365A', plum: '#6C5E82', mauve: '#AD93A7',
        coral: '#E8737F', sky: '#96A4C5', brand: '#3F5B8B',
        surface: '#F6F5FA', line: '#E4E1EC',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};