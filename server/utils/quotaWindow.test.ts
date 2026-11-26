import { quotaWindowStart } from '@server/utils/quotaWindow';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('quotaWindowStart', () => {
  for (const [zone, now, midnight] of [
    ['Europe/Amsterdam', '2026-03-29T21:59:59Z', '2026-03-28T23:00:00Z'],
    ['Europe/Amsterdam', '2026-03-29T22:00:00Z', '2026-03-29T22:00:00Z'],
    ['Europe/Amsterdam', '2026-10-25T22:59:59Z', '2026-10-24T22:00:00Z'],
    ['Asia/Kathmandu', '2026-11-26T15:00:00Z', '2026-11-25T18:15:00Z'],
  ]) {
    it(`uses the start of the local day in ${zone} at ${now}`, () => {
      assert.deepEqual(
        quotaWindowStart(1, zone, new Date(now)),
        new Date(midnight)
      );
    });
  }

  it('keeps the 24-hour default and ignores the reset zone for other periods', () => {
    const now = new Date('2026-03-29T12:34:56Z');
    assert.deepEqual(
      quotaWindowStart(1, undefined, now),
      new Date('2026-03-28T12:34:56Z')
    );
    assert.deepEqual(
      quotaWindowStart(7, 'UTC', now),
      quotaWindowStart(7, undefined, now)
    );
    assert.equal(quotaWindowStart(0, 'UTC', now), undefined);
  });
});
