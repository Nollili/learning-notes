// lib/courses.ts — read-only public fixture; replace behind the same boundary in the lab.
import 'server-only';
export type Course = { id: string; title: string };
const rows: readonly Course[] = [
  { id: 'layout', title: 'Layout debugging' },
  { id: 'network', title: 'Network waterfalls' }
];
export async function listCourses(): Promise<Course[]> {
  return rows.map(row => ({ ...row }));
}
export async function findCourse(id: string): Promise<Course | null> {
  const row = rows.find(course => course.id === id);
  return row ? { ...row } : null;
}
