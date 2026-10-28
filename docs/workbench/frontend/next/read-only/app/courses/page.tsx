// app/courses/page.tsx
import { listCourses } from '../../lib/courses';
import CourseFilter from './course-filter';
export default async function CoursesPage() {
  const courses = await listCourses();
  return <main id="main"><h1>Courses</h1><CourseFilter courses={courses} /></main>;
}
