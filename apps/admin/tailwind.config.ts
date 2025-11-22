import type { Config } from 'tailwindcss';
import sharedPreset from '../../packages/shared/tailwind.preset';

const config: Config = {
  presets: [sharedPreset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require('tailwindcss-animate')],
};

export default config;
