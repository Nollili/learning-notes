// app/articles/page.tsx — Server Component; API_ORIGIN remains server configuration.
type Article = { id: string; title: string };
function parseArticles(value: unknown): Article[] {
  if (!Array.isArray(value) || !value.every(item =>
    item !== null && typeof item === 'object' &&
    typeof item.id === 'string' && typeof item.title === 'string'
  )) throw new Error('Invalid article response');
  return value.map(item => ({ id: item.id, title: item.title }));
}
export default async function ArticlesPage() {
  const origin = process.env.API_ORIGIN;
  if (!origin) throw new Error('API_ORIGIN required');
  const response = await fetch(new URL('/articles', origin), {
    cache: 'no-store', signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) { await response.body?.cancel(); throw new Error('Articles unavailable'); }
  const articles = parseArticles(await response.json());
  return <main><h1>Articles</h1><ul>{articles.map(article =>
    <li key={article.id}>{article.title}</li>
  )}</ul></main>;
}
