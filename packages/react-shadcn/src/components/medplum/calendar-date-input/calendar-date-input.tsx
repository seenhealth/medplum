// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CalendarDateInput/CalendarDateInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import {
  dayNumber,
  getMonthString,
  getStartMonth,
  isBeforeDay,
  isSameDay,
  sortEnds,
  startOfDay,
  startOfMonth,
} from '@/components/medplum/calendar-date-input/calendar-date-input-utils';
import { useDayRangeDrag } from '@/components/medplum/calendar-date-input/use-day-range-drag';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import type { JSX } from 'react';
import { useMemo, useState } from 'react';

export interface CalendarDateInputProps {
  readonly availableDates: Date[];
  readonly onChangeMonth: (date: Date) => void;
  /** Called with the day picked. */
  readonly onClick: (date: Date) => void;
  readonly month?: Date;
  /** An extra day to mark as picked, alongside any `range`. Ignored while a drag is under way. */
  readonly selected?: Date;
  readonly allowUnavailableDates?: boolean;
  readonly earliestDate?: Date;
  /**
   * The stretch of days on show, banded across the weeks it spans. The ends may carry a time of
   * day; only the days they fall on are used.
   */
  readonly range?: { readonly start: Date; readonly end: Date };
  /**
   * Called with the stretch of days a drag or a shift-click asked for, earlier end first.
   *
   * A shift-click moves the nearer end of the range to the day clicked and leaves the other where
   * it is, so clicking beyond either end widens the range and clicking within it draws that end in.
   * A day exactly between the two holds the start. The nearer end is measured on the range itself,
   * which may begin in a month that has been paged away from.
   */
  readonly onSelectRange?: (start: Date, end: Date) => void;
}

interface CalendarCell {
  readonly date: Date;
  readonly available: boolean;
}

type OptionalCalendarCell = CalendarCell | undefined;

const calendarTableVariants = cva(
  'w-full min-w-[260px] max-w-[350px] table-fixed border-collapse select-none [&_th]:px-0.5 [&_th]:py-2 [&_th]:text-center [&_th]:text-[11px] [&_th]:font-normal [&_td]:p-0.5 [&_td]:text-center',
  {
    variants: {
      selectsRanges: {
        true: 'selectsRanges [&_td_button]:touch-none',
        false: '',
      },
    },
    defaultVariants: {
      selectsRanges: false,
    },
  }
);

const dayCellVariants = cva('', {
  variants: {
    inRange: {
      true: 'inRange bg-primary/10',
      false: '',
    },
    rangeOpens: {
      true: 'rangeOpens rounded-tl-full rounded-bl-full',
      false: '',
    },
    rangeCloses: {
      true: 'rangeCloses rounded-tr-full rounded-br-full',
      false: '',
    },
  },
});

const dayButtonVariants = cva(
  'mx-auto aspect-square h-auto w-full max-w-11 rounded-full border-0 bg-transparent p-0 text-center text-base font-normal text-muted-foreground hover:bg-muted disabled:cursor-default disabled:bg-transparent disabled:font-normal disabled:text-muted-foreground/50 disabled:hover:bg-transparent',
  {
    variants: {
      available: {
        true: 'available bg-muted font-medium text-foreground hover:bg-accent',
        false: '',
      },
      selected: {
        true: 'selected bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground disabled:bg-transparent disabled:text-muted-foreground/50 disabled:hover:bg-transparent',
        false: '',
      },
    },
  }
);

export function CalendarDateInput(props: CalendarDateInputProps): JSX.Element {
  const { onChangeMonth, onClick, onSelectRange, allowUnavailableDates, earliestDate } = props;
  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(getStartMonth);
  const shownMonth = props.month ?? uncontrolledMonth;
  const year = shownMonth.getFullYear();
  const monthIndex = shownMonth.getMonth();
  const month = useMemo(() => new Date(year, monthIndex, 1), [year, monthIndex]);
  const atEarliestMonth = !!earliestDate && month <= startOfMonth(earliestDate);

  const drag = useDayRangeDrag(onSelectRange);

  function moveMonth(delta: number): void {
    const newMonth = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    if (props.month === undefined) {
      setUncontrolledMonth(newMonth);
    }
    onChangeMonth(newMonth);
  }

  function isDayDisabled(day: CalendarCell): boolean {
    return (!day.available && !allowUnavailableDates) || (!!earliestDate && isBeforeDay(day.date, earliestDate));
  }

  // A drag that has not yet crossed a day would otherwise blot out the range on show, so the band
  // blinks down to the day pressed on the way to every click.
  const dragging = drag.range && !isSameDay(drag.range.start, drag.range.end) ? drag.range : undefined;
  const range = toDays(dragging ?? props.range);
  // Suppressed only while actively dragging, so a static range still shows its picked day.
  const selected = dragging ? undefined : props.selected;

  const grid = useMemo(() => buildGrid(month, props.availableDates), [month, props.availableDates]);

  return (
    <div>
      <div className="flex flex-nowrap items-center justify-between gap-2 *:flex-1">
        <p className="flex-1">{getMonthString(month)}</p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            disabled={atEarliestMonth}
            onClick={() => moveMonth(-1)}
          >
            &lt;
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Next month" onClick={() => moveMonth(1)}>
            &gt;
          </Button>
        </div>
      </div>
      <table className={calendarTableVariants({ selectsRanges: !!onSelectRange })}>
        <thead>
          <tr>
            <th>SUN</th>
            <th>MON</th>
            <th>TUE</th>
            <th>WED</th>
            <th>THU</th>
            <th>FRI</th>
            <th>SAT</th>
          </tr>
        </thead>
        <tbody>
          {grid.map((week, weekIndex) => (
            <tr key={'week-' + weekIndex}>
              {week.map((day, dayIndex) => (
                <td
                  key={'day-' + dayIndex}
                  className={cn(
                    day &&
                      range &&
                      day.date >= range.start &&
                      day.date <= range.end &&
                      dayCellVariants({
                        inRange: true,
                        rangeOpens: isSameDay(day.date, range.start) || dayIndex === 0,
                        rangeCloses: isSameDay(day.date, range.end) || dayIndex === week.length - 1,
                      })
                  )}
                >
                  {day && (
                    <Button
                      type="button"
                      variant="ghost"
                      className={dayButtonVariants({
                        available: day.available,
                        selected: isAnchor(day.date, range, selected),
                      })}
                      aria-pressed={selected || range ? isChosen(day.date, range, selected) : undefined}
                      disabled={isDayDisabled(day)}
                      onPointerDown={(event) => {
                        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                          event.currentTarget.releasePointerCapture(event.pointerId);
                        }
                        drag.begin(day.date);
                      }}
                      onPointerOver={() => drag.extend(day.date)}
                      onClick={(event) => {
                        // A drag that crossed days has already asked for them, and
                        // the browser reports the release as a click as well.
                        if (drag.consumeClick()) {
                          return;
                        }
                        if (event.shiftKey && onSelectRange) {
                          const reached = moveNearerEnd(day.date, range, selected);
                          if (reached && !isSameDay(reached.start, reached.end)) {
                            // Shift-clicking an end asks for the range already on show.
                            if (
                              !range ||
                              !isSameDay(reached.start, range.start) ||
                              !isSameDay(reached.end, range.end)
                            ) {
                              onSelectRange(reached.start, reached.end);
                            }
                            return;
                          }
                        }
                        onClick(day.date);
                      }}
                    >
                      {day.date.getDate()}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type DayRange = CalendarDateInputProps['range'];

/**
 * Pulls the ends of a range back to the days they fall on.
 * @param range - The stretch of days asked for, if there is one.
 * @returns The same range at day granularity.
 */
function toDays(range: DayRange): DayRange {
  return range && { start: startOfDay(range.start), end: startOfDay(range.end) };
}

/**
 * Returns whether a day is one the calendar is anchored on, and so marked as picked.
 * @param date - Local midnight of the day in question.
 * @param range - The stretch of days on show, if there is one.
 * @param selected - The single day chosen, if there is one.
 * @returns True when the day is an end of the range on show, or the day named as picked.
 */
function isAnchor(date: Date, range: DayRange, selected: Date | undefined): boolean {
  return isSameDay(date, selected) || (!!range && (isSameDay(date, range.start) || isSameDay(date, range.end)));
}

/**
 * Returns whether a day is part of what has been chosen.
 * @param date - Local midnight of the day in question.
 * @param range - The stretch of days on show, if there is one.
 * @param selected - The single day chosen, if there is one.
 * @returns True when the day falls within what is chosen.
 */
function isChosen(date: Date, range: DayRange, selected: Date | undefined): boolean {
  return isAnchor(date, range, selected) || (!!range && date > range.start && date < range.end);
}

/**
 * Works out the range a shift-click asks for: the nearer end moves to the day clicked, and the
 * other end is held where it is.
 * @param date - Local midnight of the day shift-clicked.
 * @param range - The stretch of days on show, if there is one.
 * @param selected - The single day on show, if there is one.
 * @returns The range reached, or undefined when there is no end to hold.
 */
function moveNearerEnd(date: Date, range: DayRange, selected: Date | undefined): DayRange {
  if (range) {
    const start = startOfDay(range.start);
    const end = startOfDay(range.end);
    // Exactly one of these is negative unless the day falls within the range, so the nearer end
    // comes out without measuring either distance. A day dead centre holds the start, leaving the
    // end to come back to it.
    const held = dayNumber(date) - dayNumber(start) < dayNumber(end) - dayNumber(date) ? end : start;
    return sortEnds(held, date);
  }
  if (selected) {
    return sortEnds(startOfDay(selected), date);
  }
  return undefined;
}

function buildGrid(startDate: Date, availableDates: Date[]): OptionalCalendarCell[][] {
  const d = new Date(startDate.getFullYear(), startDate.getMonth());
  const grid: OptionalCalendarCell[][] = [];
  let row: OptionalCalendarCell[] = [];

  // Fill leading empty days
  for (let i = 0; i < d.getDay(); i++) {
    row.push(undefined);
  }

  while (d.getMonth() === startDate.getMonth()) {
    row.push({
      date: new Date(d),
      available: isDayAvailable(d, availableDates),
    });

    if (d.getDay() === 6) {
      grid.push(row);
      row = [];
    }

    d.setDate(d.getDate() + 1);
  }

  // Fill trailing empty days
  if (d.getDay() !== 0) {
    for (let i = d.getDay(); i < 7; i++) {
      row.push(undefined);
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Returns true if the given date is available for booking.
 * @param day - The day to check.
 * @param availableDates - The list of available dates.
 * @returns True if there are any available slots for the day.
 */
function isDayAvailable(day: Date, availableDates: Date[]): boolean {
  // Note that slot start and end time may or may not be in UTC.
  return availableDates.some((availableDate) => isSameDay(availableDate, day));
}
