// app/courses/layout.tsx
import Link from 'next/link';
import type { ReactNode } from 'react';
export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <><nav aria-label="Courses"><Link href="/courses">All courses</Link></nav>{children}</>;
}
