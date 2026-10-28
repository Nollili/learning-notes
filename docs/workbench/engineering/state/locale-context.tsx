// locale-context.tsx
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
export type Locale = 'en-US' | 'ar-EG';
const LocaleContext = createContext<Locale | null>(null);
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  if (locale !== 'en-US' && locale !== 'ar-EG') throw new Error('Unsupported locale');
  return <LocaleContext.Provider value={locale}>
    <section lang={locale} dir={locale === 'ar-EG' ? 'rtl' : 'ltr'}>{children}</section>
  </LocaleContext.Provider>;
}
export function formatItemCount(locale: Locale, count: number): string {
  if (!Number.isSafeInteger(count) || count < 0 || count > 100000) throw new Error('Invalid count');
  const number = new Intl.NumberFormat(locale).format(count);
  const category = new Intl.PluralRules(locale, { type: 'cardinal' }).select(count);
  if (locale === 'en-US') return `${number} ${category === 'one' ? 'item' : 'items'}`;
  const messages: Record<Intl.LDMLPluralRule, string> = {
    zero: 'لا عناصر', one: 'عنصر واحد', two: 'عنصران',
    few: `${number} عناصر`, many: `${number} عنصرًا`, other: `${number} عنصر`,
  };
  return messages[category];
}
export function LocalizedSummary({ count, totalUsdCents, when, reference }: {
  count: number; totalUsdCents: number; when: Date; reference: string;
}) {
  const locale = useContext(LocaleContext);
  if (locale === null) throw new Error('LocaleProvider required');
  if (!Number.isSafeInteger(totalUsdCents) || totalUsdCents < 0 || totalUsdCents > 10000000
    || !Number.isFinite(when.getTime()) || reference.length > 80) throw new Error('Invalid summary');
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(totalUsdCents / 100);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(when);
  return <>
    <p>{formatItemCount(locale, count)}</p>
    <p>{money}</p>
    <p><time dateTime={when.toISOString()}>{date}</time></p>
    <p><bdi>{reference}</bdi></p>
  </>;
}
