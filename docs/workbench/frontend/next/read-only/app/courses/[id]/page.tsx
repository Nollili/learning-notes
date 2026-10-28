// app/courses/[id]/page.tsx
import { notFound } from 'next/navigation';
import { findCourse } from '../../../lib/courses';
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const course = await findCourse(id);
  if (!course) notFound();
  return <main id="main"><h1>{course.title}</h1></main>;
}
