// theme-context.tsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
type ThemeValue = { theme: 'light' | 'dark'; toggleTheme: () => void };
const ThemeContext = createContext<ThemeValue | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = useCallback(() => setTheme(current => current === 'light' ? 'dark' : 'light'), []);
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (value === null) throw new Error('ThemeProvider required');
  return value;
}
export function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme}>Current theme: {theme}</button>;
}
