'use client';

import { memo, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared';

export const ThemeToggler = memo(() => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-32 rounded-md border border-input bg-background" />;
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-32">
        <div className="flex items-center gap-2">
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <div className="flex items-center gap-2">
            <FaSun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark">
          <div className="flex items-center gap-2">
            <FaMoon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
        <SelectItem value="system">
          <div className="flex items-center gap-2">
            <FaDesktop className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
});
ThemeToggler.displayName = 'ThemeToggler';
