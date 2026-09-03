// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CalendarDateInput/CalendarDateInput.utils.test.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { dayNumber } from '@/components/medplum/calendar-date-input/calendar-date-input-utils';

const DAY = 24 * 60 * 60 * 1000;

describe('dayNumber', () => {
  test('Steps by exactly one day per day', () => {
    // Whatever the machine's timezone, including one whose March has a 23-hour
    // day. Measuring local midnights instead would be an hour out either side of
    // a daylight-saving change, which is enough to decide a range's nearer end
    // the wrong way.
    const march = new Date(2026, 2, 7);
    expect(dayNumber(new Date(2026, 2, 8)) - dayNumber(march)).toBe(DAY);
    expect(dayNumber(new Date(2026, 2, 9)) - dayNumber(march)).toBe(2 * DAY);
    expect(dayNumber(new Date(2026, 2, 11)) - dayNumber(new Date(2026, 2, 9))).toBe(2 * DAY);
  });

  test('Ignores the time of day', () => {
    const morning = new Date(2026, 6, 14, 9, 30);
    const night = new Date(2026, 6, 14, 23, 45);
    expect(dayNumber(morning)).toBe(dayNumber(night));
  });
});
