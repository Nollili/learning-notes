// app/courses/error.tsx — Next16.4.3 API; see installed-version migration notes.
'use client';
export default function CoursesError({ retry }: { error: unknown; retry: () => void }) {
  return <main id="main"><h1>Courses could not load</h1>
    <p>Please try again. If this continues, return later.</p>
    <button type="button" onClick={() => retry()}>Retry loading</button>
  </main>;
}
