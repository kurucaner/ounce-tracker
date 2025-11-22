# Shared Package Configuration Fix

## Problem
The web app was experiencing webpack errors: `__webpack_modules__[moduleId] is not a function`

## Root Cause
**DUPLICATE DEPENDENCIES!** The web app had duplicate packages that were also in `@shared`:
- `@radix-ui/react-*` packages
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `tailwind-merge`
- `tailwindcss-animate`

When Next.js transpiled `@shared`, it created module conflicts because the same packages existed in both places. The admin app didn't have these duplicates, which is why it worked fine.

## Solution

### 1. **Removed Duplicate Dependencies from `apps/web/package.json`**

**BEFORE:**
```json
"dependencies": {
  "@radix-ui/react-dialog": "^1.1.2",
  "@radix-ui/react-dropdown-menu": "^2.1.2",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-select": "^2.1.2",
  "@radix-ui/react-slot": "^1.1.0",
  "@shared": "workspace:*",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "lucide-react": "^0.453.0",
  "tailwind-merge": "^2.5.4",
  "tailwindcss-animate": "^1.0.7"
}
```

**AFTER:**
```json
"dependencies": {
  "@shared": "workspace:*",
  "@supabase/supabase-js": "^2.83.0",
  "date-fns": "^4.1.0",
  "next": "^15.0.3",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

**Why:** All UI dependencies come from `@shared` via `transpilePackages`. Having them in both places causes webpack to load duplicate modules, breaking module resolution.

### 2. **Changed Package Exports to Source Files**
**File**: `packages/shared/package.json`

```json
"main": "./src/index.ts",
"types": "./src/index.ts",
"exports": {
  ".": {
    "types": "./src/index.ts",
    "default": "./src/index.ts"
  }
}
```

This allows Next.js's `transpilePackages: ['@shared']` configuration to work correctly by transpiling the TypeScript source files directly.

### 3. **Added 'use client' Directives**
All UI components now have the `'use client'` directive at the top:

- `packages/shared/src/components/ui/button.tsx`
- `packages/shared/src/components/ui/card.tsx`
- `packages/shared/src/components/ui/input.tsx`
- `packages/shared/src/components/ui/label.tsx`
- `packages/shared/src/components/ui/select.tsx`
- `packages/shared/src/components/ui/table.tsx`

This ensures Next.js knows these are client components that should only run in the browser.

## Testing

### Apply the fix:

```bash
# 1. Clean install dependencies
cd apps/web
rm -rf node_modules
cd ../..
bun install

# 2. Restart the dev server
bun run dev:web
```

The webpack error should be resolved and the app should load correctly.

### Debugging Steps (if still having issues)

Use the test file at `apps/web/src/app/page.test-simple.tsx`:

1. **Test baseline** (no imports) - should work
2. **Test type imports** - should work
3. **Test utility imports** - should work
4. **Test individual components** - should work now

Replace your `page.tsx` with each test one by one to isolate which import causes issues.

## Why Admin App Wasn't Affected

The admin app's `package.json` only has:
```json
"dependencies": {
  "@shared": "workspace:*",
  "next": "^15.0.3",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@supabase/supabase-js": "^2.83.0",
  "react-hook-form": "^7.53.2",
  // ... no duplicate UI dependencies
}
```

No duplicate dependencies = no conflicts!

## Benefits of This Approach

1. ✅ Single source of truth for UI dependencies
2. ✅ No version conflicts between apps
3. ✅ Smaller bundle size (no duplicate code)
4. ✅ Easier dependency management
5. ✅ Consistent package versions across all apps

## Key Takeaway

**In a monorepo with a shared UI package:**
- ✅ Put UI dependencies in the shared package
- ❌ Don't duplicate them in consuming apps
- ✅ Use `transpilePackages` to let Next.js handle the transpilation
- ✅ Export source files (`.ts`/`.tsx`) not compiled files (`.js`)

