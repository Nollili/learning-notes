// app/layout.tsx
import type { ReactNode } from 'react';
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a href="#main">Skip to content</a>{children}</body></html>;
}
