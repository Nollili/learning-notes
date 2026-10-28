// locale-demo.tsx
import { useState } from 'react';
import { LocaleProvider, LocalizedSummary, type Locale } from './locale-context.js';
import './locale-layout.css';
export function LocaleDemo() {
  const [locale, setLocale] = useState<Locale>('en-US');
  const arabic = locale === 'ar-EG';
  return <LocaleProvider locale={locale}>
    <div className="locale-layout">
      <label>{arabic ? 'اللغة' : 'Language'}
        <select value={locale} onChange={event => {
          const next = event.currentTarget.value;
          if (next === 'en-US' || next === 'ar-EG') setLocale(next);
        }}>
          <option value="en-US" lang="en-US">English</option>
          <option value="ar-EG" lang="ar-EG">العربية</option>
        </select>
      </label>
      <h2>{arabic ? 'ملخص الطلب' : 'Order summary'}</h2>
      <LocalizedSummary count={3} totalUsdCents={12345}
        when={new Date('2026-01-02T12:00:00Z')} reference="ORDER-42" />
      <button type="button">{arabic ? 'متابعة التسوق' : 'Continue shopping'}</button>
    </div>
  </LocaleProvider>;
}
