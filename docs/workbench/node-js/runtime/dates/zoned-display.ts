// zoned-display.ts
export function makeDateDisplay(locale: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone, calendar: 'gregory', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'shortOffset',
  });
  return {
    text(instant: Date): string { return formatter.format(instant); },
    parts(instant: Date): Record<string, string> {
      return Object.fromEntries(formatter.formatToParts(instant)
        .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    },
    resolved: formatter.resolvedOptions(),
  };
}
