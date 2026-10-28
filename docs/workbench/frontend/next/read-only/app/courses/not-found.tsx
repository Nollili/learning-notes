// app/courses/not-found.tsx
import Link from 'next/link';
export default function CourseNotFound() {
  return <main id="main"><h1>Course unavailable</h1><Link href="/courses">Browse courses</Link></main>;
}
