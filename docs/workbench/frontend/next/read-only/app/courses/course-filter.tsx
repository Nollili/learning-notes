// app/courses/course-filter.tsx
'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import type { Course } from '../../lib/courses';
export default function CourseFilter({ courses }: { courses: Course[] }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const visible = courses.filter(course => course.title.toLowerCase().includes(query.toLowerCase()));
  return <section aria-label="Course search">
    <label htmlFor={id}>Filter courses</label>
    <input id={id} value={query} onChange={event => setQuery(event.target.value)} />
    <p role="status">{visible.length} {visible.length === 1 ? 'course' : 'courses'}</p>
    <ul>{visible.map(course => <li key={course.id}>
      <Link href={`/courses/${encodeURIComponent(course.id)}`}>{course.title}</Link>
    </li>)}</ul>
  </section>;
}
