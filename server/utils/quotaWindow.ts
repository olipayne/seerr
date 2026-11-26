import { Temporal } from '@js-temporal/polyfill';
import { isPgsql } from '@server/utils/dbType';
import { Raw } from 'typeorm';

export function quotaWindowStart(
  days: number | undefined,
  timeZone: string | undefined,
  now: Date
): Date | undefined {
  if (!days) return undefined;

  if (days === 1) {
    if (!timeZone) return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const start = Temporal.Instant.fromEpochMilliseconds(now.getTime())
      .toZonedDateTimeISO(timeZone)
      .startOfDay();
    return new Date(start.epochMilliseconds);
  }

  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

export function createdSince(start: Date) {
  const iso = start.toISOString();
  // SQLite's CURRENT_TIMESTAMP omits the fractional part at exact seconds.
  const quotaStart = isPgsql
    ? iso
    : iso.replace('T', ' ').replace(/(?:\.000)?Z$/, '');
  return Raw((column) => `${column} >= :quotaStart`, { quotaStart });
}
