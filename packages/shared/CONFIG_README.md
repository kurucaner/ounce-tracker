# Shared Configuration Files

This directory contains shared configuration files used across all apps in the OunceTracker monorepo.

## 📦 What's Included

### Tailwind CSS Preset (`tailwind.preset.ts`)

A shared Tailwind CSS preset that includes:
- Consistent color tokens (border, input, ring, background, etc.)
- Unified theme configuration
- Standard border radius values
- Dark mode support

**Usage in apps:**

```typescript
import type { Config } from 'tailwindcss';
import sharedPreset from '../../packages/shared/tailwind.preset';

const config: Config = {
  presets: [sharedPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### PostCSS Config (`postcss.config.mjs`)

Standard PostCSS configuration with:
- Tailwind CSS plugin
- Autoprefixer plugin

**Usage in apps:**

Copy this file to your app's root directory or reference it directly.

## 🎨 Benefits

1. **Consistency**: All apps share the same design tokens and styling configuration
2. **DRY Principle**: No need to duplicate theme configurations
3. **Easy Updates**: Change the theme once, update everywhere
4. **Type Safety**: Full TypeScript support for Tailwind configuration

## 🔧 Adding New Apps

When creating a new app that needs Tailwind CSS:

1. Install Tailwind dependencies in your app:
   ```bash
   bun add -d tailwindcss autoprefixer postcss tailwindcss-animate
   ```

2. Create `tailwind.config.ts` that extends the shared preset:
   ```typescript
   import type { Config } from 'tailwindcss';
   import sharedPreset from '../../packages/shared/tailwind.preset';

   const config: Config = {
     presets: [sharedPreset],
     content: [
       './src/**/*.{js,ts,jsx,tsx,mdx}',
       '../../packages/shared/src/components/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     plugins: [require('tailwindcss-animate')],
   };

   export default config;
   ```

3. Copy the `postcss.config.mjs` to your app's root

4. Import the global styles from `@shared` or create your own with the CSS variables

## 📝 Customization

If an app needs custom theme values, you can extend the preset:

```typescript
const config: Config = {
  presets: [sharedPreset],
  theme: {
    extend: {
      colors: {
        brand: '#FF6B6B',
      },
    },
  },
  // ... rest of config
};
```

## 🚀 Current Apps Using Shared Config

- ✅ `apps/web`
- ✅ `apps/admin`

