import type { Config } from 'tailwindcss';
import sharedPreset from '../../packages/shared/tailwind.preset';
import animate from 'tailwindcss-animate';

const config: Config = {
  presets: [sharedPreset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [animate],
};

export default config;
