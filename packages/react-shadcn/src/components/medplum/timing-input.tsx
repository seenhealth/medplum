// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/TimingInput/TimingInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { FormSection, FormSectionError, FormSectionLabel } from '@/components/medplum/form-section';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
import type { DayOfWeek } from '@medplum/core';
import { formatTiming } from '@medplum/core';
import type { Timing, TimingRepeat } from '@medplum/fhirtypes';
import { IconCircleMinus, IconCirclePlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useContext, useMemo, useRef, useState } from 'react';

// Sunday-first, unlike the Monday-first `DAYS_OF_WEEK` in core, because this
// drives the order the day chips are rendered in.
const daysOfWeek: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

type PeriodUnit = 'a' | 's' | 'min' | 'h' | 'd' | 'wk' | 'mo';

// Internal state wrapper for `repeat.timeOfDay` array entries; used to provide
// a stable ID to each raw string.
type TimeOfDayItem = { id: number; value: string };

export interface TimingInputProps extends ComplexTypeInputProps<Timing> {
  readonly defaultModalOpen?: boolean;
}

export function TimingInput(props: TimingInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);
  const [open, setOpen] = useState(!props.disabled && (props.defaultModalOpen ?? false));

  return (
    <>
      <div className="flex flex-nowrap gap-2 *:flex-1">
        <span data-testid="timinginput-display">{formatTiming(value) || 'No repeat'}</span>
        <Button type="button" disabled={props.disabled} onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      {!props.disabled && (
        <TimingEditorDialog
          path={props.path}
          visible={open}
          defaultValue={value}
          onOk={(newValue) => {
            if (props.onChange) {
              props.onChange(newValue);
            }
            setValue(newValue);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface TimingEditorDialogProps {
  readonly path: string;
  readonly visible: boolean;
  readonly defaultValue?: Timing;
  readonly onOk: (newValue: Timing) => void;
  readonly onCancel: () => void;
}

const defaultValue: Timing = {
  repeat: {
    period: 1,
    periodUnit: 'd',
  },
};

function TimingEditorDialog(props: TimingEditorDialogProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue || defaultValue);
  const [timeOfDayItems, setTimeOfDayItems] = useState<TimeOfDayItem[]>(() =>
    (props.defaultValue?.repeat?.timeOfDay ?? []).map((v, i) => ({ id: i, value: v }))
  );
  const nextTimeOfDayId = useRef(timeOfDayItems.length);
  const { getExtendedProps } = useContext(ElementsContext);
  const [
    eventProps,
    repeatProps,
    repeatPeriodProps,
    repeatPeriodUnitProps,
    repeatDayOfWeekProps,
    repeatTimeOfDayProps,
  ] = useMemo(
    () =>
      ['event', 'repeat', 'repeat.period', 'repeat.periodUnit', 'repeat.dayOfWeek', 'repeat.timeOfDay'].map((field) =>
        getExtendedProps(props.path + '.' + field)
      ),
    [getExtendedProps, props.path]
  );

  function setStart(newStart: string): void {
    setValue((value) => ({ ...value, event: [newStart] }));
  }

  function setRepeat(repeat: TimingRepeat | undefined): void {
    setValue((value) => ({ ...value, repeat }));
  }

  function setPeriod(period: number | undefined): void {
    setValue((value) => ({ ...value, repeat: { ...value.repeat, period } }));
  }

  function setPeriodUnit(periodUnit: PeriodUnit | undefined): void {
    setValue((value) => ({ ...value, repeat: { ...value.repeat, periodUnit } }));
  }

  function setDaysOfWeek(dayOfWeek: DayOfWeek[] | undefined): void {
    setValue((value) => ({ ...value, repeat: { ...value.repeat, dayOfWeek } }));
  }

  function setTimeOfDay(updater: (items: TimeOfDayItem[]) => TimeOfDayItem[]): void {
    setTimeOfDayItems((items) => {
      const newItems = updater(items);
      const timeOfDay = newItems.map((item) => item.value);
      setValue((value) => ({
        ...value,
        repeat: {
          ...value.repeat,
          timeOfDay,
        },
      }));
      return newItems;
    });
  }

  return (
    <Modal open={props.visible} onOpenChange={(next) => !next && props.onCancel()}>
      <ModalHeader>
        <ModalTitle>Timing</ModalTitle>
        <button type="button" className="sr-only" aria-label="Close" onClick={() => props.onCancel()} />
      </ModalHeader>
      <ModalBody>
        <div className="flex flex-col gap-4">
          <FormSection htmlFor="timing-dialog-start">
            <FormSectionLabel>Starts on</FormSectionLabel>
            <DateTimeInput
              disabled={eventProps?.readonly}
              name="timing-dialog-start"
              onChange={(newValue) => setStart(newValue)}
            />
            <FormSectionError />
          </FormSection>
          <div className="flex items-center gap-2">
            <Switch
              id="timing-dialog-repeat"
              disabled={repeatProps?.readonly}
              checked={!!value.repeat}
              onCheckedChange={(checked) => setRepeat(checked ? defaultValue.repeat : undefined)}
            />
            <Label htmlFor="timing-dialog-repeat">Repeat</Label>
          </div>
          {value.repeat && (
            <>
              <FormSection htmlFor="timing-dialog-period">
                <FormSectionLabel>Repeat every</FormSectionLabel>
                <div className="flex flex-nowrap gap-2 *:flex-1">
                  <Input
                    disabled={repeatPeriodProps?.readonly}
                    type="number"
                    step={1}
                    id="timing-dialog-period"
                    name="timing-dialog-period"
                    defaultValue={value.repeat.period || 1}
                    onChange={(e) => setPeriod(Number.parseInt(e.currentTarget.value, 10) || 1)}
                  />
                  <NativeSelect
                    disabled={repeatPeriodUnitProps?.readonly}
                    id="timing-dialog-periodUnit"
                    name="timing-dialog-periodUnit"
                    defaultValue={value.repeat.periodUnit}
                    onChange={(e) => setPeriodUnit(e.currentTarget.value as PeriodUnit | undefined)}
                  >
                    <NativeSelectOption value="min">minute</NativeSelectOption>
                    <NativeSelectOption value="h">hour</NativeSelectOption>
                    <NativeSelectOption value="d">day</NativeSelectOption>
                    <NativeSelectOption value="wk">week</NativeSelectOption>
                    <NativeSelectOption value="mo">month</NativeSelectOption>
                    <NativeSelectOption value="a">year</NativeSelectOption>
                  </NativeSelect>
                </div>
                <FormSectionError />
              </FormSection>
              {value.repeat.periodUnit === 'wk' && (
                <FormSection>
                  <FormSectionLabel>Repeat on</FormSectionLabel>
                  <div className="mt-2 flex justify-between gap-2">
                    {daysOfWeek.map((day) => {
                      const letter = day.charAt(0).toUpperCase();
                      const checked = (value.repeat?.dayOfWeek ?? []).includes(day);
                      return (
                        <Toggle
                          key={day}
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                          value={day}
                          aria-label={letter}
                          role="checkbox"
                          aria-checked={checked}
                          pressed={checked}
                          disabled={repeatDayOfWeekProps?.readonly}
                          ref={(node) => {
                            if (node) {
                              Object.defineProperty(node, 'checked', {
                                configurable: true,
                                get: () => (value.repeat?.dayOfWeek ?? []).includes(day),
                              });
                            }
                          }}
                          onPressedChange={(next) => {
                            const current = value.repeat?.dayOfWeek ?? [];
                            const nextDays = next
                              ? [...current.filter((d) => d !== day), day]
                              : current.filter((d) => d !== day);
                            setDaysOfWeek(nextDays.length ? nextDays : undefined);
                          }}
                        >
                          {letter}
                        </Toggle>
                      );
                    })}
                  </div>
                  <FormSectionError />
                </FormSection>
              )}
              <FormSection>
                <FormSectionLabel>At times</FormSectionLabel>
                <div className="mt-2 flex flex-col gap-4">
                  {timeOfDayItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        disabled={repeatTimeOfDayProps?.readonly}
                        type="time"
                        id={`timing-dialog-repeat-timeOfDay[${idx}]`}
                        name={`timing-dialog-repeat-timeOfDay[${idx}]`}
                        data-testid={`timing-repeat-timeOfDay-input-${idx}`}
                        defaultValue={item.value.slice(0, 5) /* truncate to HH:mm */}
                        onChange={(e) => {
                          const newValue = `${e.currentTarget.value}:00`;
                          setTimeOfDay((items) => items.with(idx, { ...item, value: newValue }));
                        }}
                        className="grow"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Remove"
                        data-testid={`timing-repeat-timeOfDay-remove-${idx}`}
                        onClick={() => setTimeOfDay((items) => items.toSpliced(idx, 1))}
                      >
                        <IconCircleMinus />
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      title="Add Time of Day"
                      onClick={() =>
                        setTimeOfDay((items) => {
                          const id = nextTimeOfDayId.current++;
                          return items.concat({ id, value: '00:00:00' });
                        })
                      }
                    >
                      <IconCirclePlus />
                      Add Time of Day
                    </Button>
                  </div>
                </div>
                <FormSectionError />
              </FormSection>
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button type="button" onClick={() => props.onOk(value)}>
          OK
        </Button>
      </ModalFooter>
    </Modal>
  );
}
