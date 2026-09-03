// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CalendarInput/CalendarInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { getMonthString, getStartMonth } from '@/components/medplum/calendar-date-input/calendar-date-input-utils';
import { CalendarInput } from '@/components/medplum/calendar-input';
import { act, fireEvent, render, screen } from '@/test/render';
import type { Slot } from '@medplum/fhirtypes';

describe('CalendarInput', () => {
  test('Renders', () => {
    const onClick = vi.fn();
    render(<CalendarInput slots={[]} onChangeMonth={vi.fn()} onClick={onClick} />);
    expect(screen.getByText(getMonthString(new Date()))).toBeDefined();
    expect(screen.getByText('SUN')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });

  test('Disabled days', () => {
    const onClick = vi.fn();
    render(<CalendarInput slots={[]} onChangeMonth={vi.fn()} onClick={onClick} />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: '4' }).disabled).toBe(true);
  });

  test('Change months', async () => {
    const onChangeMonth = vi.fn();
    const onClick = vi.fn();
    render(<CalendarInput slots={[]} onChangeMonth={onChangeMonth} onClick={onClick} />);

    const nextMonth = getStartMonth();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Move forward one month
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Next month'));
    });
    expect(onChangeMonth).toHaveBeenCalledWith(nextMonth);
    expect(screen.getByText(getMonthString(nextMonth))).toBeDefined();

    // Go back to the original month
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Previous month'));
    });
    expect(screen.getByText(getMonthString(new Date()))).toBeDefined();
  });

  test('Click day', async () => {
    const nextMonth = getStartMonth();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Add a slot on the 15th of next month
    const startTime = new Date(nextMonth.getTime());
    startTime.setDate(15);
    startTime.setHours(12, 0, 0, 0);

    const slots: Slot[] = [
      {
        resourceType: 'Slot',
        start: startTime.toISOString(),
      },
    ] as Slot[];

    const onClick = vi.fn();
    render(<CalendarInput slots={slots} onChangeMonth={vi.fn()} onClick={onClick} />);

    // Move forward one month
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Next month'));
    });
    expect(screen.getByText(getMonthString(nextMonth))).toBeDefined();

    // Expect the 15th to be available
    const dayButton = screen.getByRole('button', { name: '15' });
    expect((dayButton as HTMLButtonElement).disabled).toBe(false);

    await act(async () => {
      fireEvent.click(dayButton);
    });

    expect(onClick).toHaveBeenCalled();

    const result = onClick.mock.calls[0][0];
    expect(result.getDate()).toBe(15);
  });
});
