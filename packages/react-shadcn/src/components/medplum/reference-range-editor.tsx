// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ReferenceRangeEditor/ReferenceRangeEditor.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Container } from '@/components/medplum/container';
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { RangeInput } from '@/components/medplum/range-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { killEvent } from '@/lib/medplum/dom';
import { formatRange, getCodeBySystem } from '@medplum/core';
import type {
  CodeableConcept,
  ObservationDefinition,
  ObservationDefinitionQualifiedInterval,
} from '@medplum/fhirtypes';
import { IconCircleMinus, IconCirclePlus } from '@tabler/icons-react';
import type { JSX, MouseEvent } from 'react';
import { useEffect, useState } from 'react';

// Properties of qualified intervals used for grouping
const intervalFilters = ['gender', 'age', 'gestationalAge', 'context', 'appliesTo', 'category'] as const;

export interface ReferenceRangeEditorProps {
  readonly definition: ObservationDefinition;
  readonly onSubmit: (result: ObservationDefinition) => void;
}

// Helper type that groups of qualified intervals by equal filter criteria
export type IntervalGroup = {
  id: string;
  filters: Record<string, any>;
  intervals: ObservationDefinitionQualifiedInterval[];
};

const defaultProps: ReferenceRangeEditorProps = {
  definition: {
    resourceType: 'ObservationDefinition',
    code: { text: '' },
  },
  onSubmit: () => {
    return undefined;
  },
};

export function ReferenceRangeEditor(props: ReferenceRangeEditorProps): JSX.Element {
  props = Object.assign(defaultProps, props);
  const defaultDefinition = props.definition;

  const [intervalGroups, setIntervalGroups] = useState<IntervalGroup[]>([]);
  const [groupId, setGroupId] = useState(1);
  const [intervalId, setIntervalId] = useState(1);

  useEffect(() => {
    const definition = ensureQualifiedIntervalKeys(defaultDefinition, setIntervalId);
    setIntervalGroups(groupQualifiedIntervals(definition.qualifiedInterval || [], setGroupId));
  }, [defaultDefinition]);

  return (
    <Form testid="reference-range-editor" onSubmit={submitDefinition}>
      <div className="flex flex-col gap-4">
        {intervalGroups.map((intervalGroup) => (
          <ReferenceRangeGroupEditor
            unit={getUnitString(defaultDefinition.quantitativeDetails?.unit)}
            onChange={changeInterval}
            onAdd={addInterval}
            onRemove={removeInterval}
            onRemoveGroup={removeGroup}
            key={`group-${intervalGroup.id}`}
            intervalGroup={intervalGroup}
          />
        ))}
      </div>
      <Button
        type="button"
        title="Add Group"
        variant="ghost"
        size="icon"
        onClick={(e: MouseEvent) => {
          killEvent(e);
          addGroup({ id: `group-id-${groupId}`, filters: {}, intervals: [] });
          setGroupId((id) => id + 1);
        }}
      >
        <IconCirclePlus />
      </Button>

      <div className="flex justify-end">
        <SubmitButton>Save</SubmitButton>
      </div>
    </Form>
  );

  /**
   * Submit qualified intervals
   */

  function submitDefinition(): void {
    const qualifiedInterval = intervalGroups
      .flatMap((group) => group.intervals)
      .filter((interval) => !isEmptyInterval(interval));
    props.onSubmit({ ...defaultDefinition, qualifiedInterval });
  }

  /**
   * Add Remove Interval Groups
   */

  function addGroup(addedGroup: IntervalGroup): void {
    setIntervalGroups((currentGroups) => [...currentGroups, addedGroup]);
  }

  function removeGroup(removedGroup: IntervalGroup): void {
    setIntervalGroups((currentGroups) => currentGroups.filter((group) => group.id !== removedGroup.id));
  }

  /**
   * Add/Remove/Update specific Qualified Intervals
   * @param groupId - The reference range group ID.
   * @param changedInterval - The updated reference range interval.
   */
  function changeInterval(groupId: string, changedInterval: ObservationDefinitionQualifiedInterval): void {
    setIntervalGroups((groups) => {
      groups = [...groups];
      const currentGroup = groups.find((g) => g.id === groupId);

      const index = currentGroup?.intervals.findIndex((interval) => interval.id === changedInterval.id);
      if (index !== undefined && currentGroup?.intervals[index]) {
        currentGroup.intervals[index] = changedInterval;
      }
      return groups;
    });
  }

  function addInterval(groupId: string, addedInterval: ObservationDefinitionQualifiedInterval): void {
    if (addedInterval.id === undefined) {
      addedInterval.id = `id-${intervalId}`;
      setIntervalId((id) => id + 1);
    }
    setIntervalGroups((groups) => {
      groups = [...groups];
      const currentGroupIndex = groups.findIndex((g) => g.id === groupId);

      if (currentGroupIndex !== -1) {
        const currentGroup = { ...groups[currentGroupIndex] };
        addedInterval = { ...addedInterval, ...currentGroup.filters };
        currentGroup.intervals = [...currentGroup.intervals, addedInterval];
        groups[currentGroupIndex] = currentGroup;
      }

      return groups;
    });
  }

  function removeInterval(groupId: string, removedInterval: ObservationDefinitionQualifiedInterval): void {
    setIntervalGroups((groups) => {
      groups = [...groups];
      const currentGroup = groups.find((g) => g.id === groupId);
      if (currentGroup) {
        currentGroup.intervals = currentGroup.intervals.filter((interval) => interval.id !== removedInterval.id);
      }
      return groups;
    });
  }
}

/**
 * Helper component that renders an "interval group", which is a set of ObservationDefinitionQualifiedIntervals
 * that have the same filter values
 */
export interface ReferenceRangeGroupEditorProps {
  readonly intervalGroup: IntervalGroup;
  readonly unit: string | undefined;
  readonly onChange: (groupId: string, changed: ObservationDefinitionQualifiedInterval) => void;
  readonly onAdd: (groupId: string, added: ObservationDefinitionQualifiedInterval) => void;
  readonly onRemove: (groupId: string, removed: ObservationDefinitionQualifiedInterval) => void;
  readonly onRemoveGroup: (removedGroup: IntervalGroup) => void;
}

export function ReferenceRangeGroupEditor(props: ReferenceRangeGroupEditorProps): JSX.Element {
  const { intervalGroup, unit } = props;
  return (
    <Container
      data-testid={intervalGroup.id}
      className="relative mx-1 mb-2 mt-1 rounded-sm border-[1.5px] border-gray-300 px-3 pb-4 pt-1.5 transition-all duration-100"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Button
            type="button"
            title="Remove Group"
            variant="ghost"
            data-testid={`remove-group-button-${intervalGroup.id}`}
            key={`remove-group-button-${intervalGroup.id}`}
            size="icon"
            onClick={(e: MouseEvent) => {
              killEvent(e);
              props.onRemoveGroup(intervalGroup);
            }}
          >
            <IconCircleMinus />
          </Button>
        </div>
        <ReferenceRangeGroupFilters intervalGroup={intervalGroup} onChange={props.onChange} />
        <Separator />
        {intervalGroup.intervals.map((interval) => (
          <div key={`interval-${interval.id}`} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-4">
              <FormSection htmlFor={`condition-${interval.id}`}>
                <FormSectionLabel>Condition: </FormSectionLabel>
                <Input
                  id={`condition-${interval.id}`}
                  key={`condition-${interval.id}`}
                  data-testid={`condition-${interval.id}`}
                  defaultValue={interval.condition}
                  className="h-8"
                  onChange={(e) => {
                    killEvent(e);
                    props.onChange(intervalGroup.id, { ...interval, condition: e.currentTarget.value.trim() });
                  }}
                />
              </FormSection>
              <Button
                type="button"
                title="Remove Interval"
                variant="ghost"
                size="icon"
                key={`remove-interval-${interval.id}`}
                data-testid={`remove-interval-${interval.id}`}
                onClick={(e: MouseEvent) => {
                  killEvent(e);
                  props.onRemove(intervalGroup.id, interval);
                }}
              >
                <IconCircleMinus />
              </Button>
            </div>

            <RangeInput
              path=""
              onChange={(range) => {
                props.onChange(intervalGroup.id, { ...interval, range });
              }}
              key={`range-${interval.id}`}
              name={`range-${interval.id}`}
              defaultValue={interval.range}
            />
          </div>
        ))}
        <Button
          type="button"
          title="Add Interval"
          variant="ghost"
          size="icon"
          onClick={(e: MouseEvent) => {
            killEvent(e);
            props.onAdd(intervalGroup.id, {
              range: {
                low: { unit },
                high: { unit },
              },
            });
          }}
        >
          <IconCirclePlus />
        </Button>
      </div>
    </Container>
  );
}

interface ReferenceRangeGroupFiltersProps {
  readonly intervalGroup: IntervalGroup;
  readonly onChange: ReferenceRangeGroupEditorProps['onChange'];
}

/**
 * Render the "filters" section of the IntervalGroup.
 * @param props - The ReferenceRangeGroupFilter React props.
 * @returns The ReferenceRangeGroupFilter React node.
 */
function ReferenceRangeGroupFilters(props: ReferenceRangeGroupFiltersProps): JSX.Element {
  const { intervalGroup, onChange } = props;

  // Pre-populate the units of the age filter (computed locally, not mutating props)
  const age = intervalGroup.filters.age ?? {};
  const ageWithDefaults = {
    low: age.low?.unit ? age.low : { ...age.low, unit: 'years', system: 'http://unitsofmeasure.org' },
    high: age.high?.unit ? age.high : { ...age.high, unit: 'years', system: 'http://unitsofmeasure.org' },
  };

  return (
    <div className="flex max-w-[50%] flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <FormSection htmlFor={`gender-${intervalGroup.id}`}>
          <FormSectionLabel>Gender:</FormSectionLabel>
          <NativeSelect
            id={`gender-${intervalGroup.id}`}
            defaultValue={intervalGroup.filters.gender || ''}
            onChange={(e) => {
              for (const interval of intervalGroup.intervals) {
                let newGender: string | undefined = e.currentTarget.value;
                if (newGender === '') {
                  newGender = undefined;
                }
                onChange(intervalGroup.id, {
                  ...interval,
                  gender: newGender as ObservationDefinitionQualifiedInterval['gender'],
                });
              }
            }}
          >
            {['', 'male', 'female'].map((option) => (
              <NativeSelectOption key={option} value={option}>
                {option}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormSection>
      </div>
      <div className="flex flex-nowrap items-center gap-2">
        <label htmlFor={`div-age-${intervalGroup.id}`}>Age:</label>
        <div id={`div-age-${intervalGroup.id}`}>
          <RangeInput
            path=""
            key={`age-${intervalGroup.id}`}
            name={`age-${intervalGroup.id}`}
            defaultValue={ageWithDefaults}
            onChange={(ageRange) => {
              for (const interval of intervalGroup.intervals) {
                onChange(intervalGroup.id, { ...interval, age: ageRange });
              }
            }}
          />
        </div>
      </div>
      <FormSection htmlFor={`endocrine-${intervalGroup.id}`}>
        <FormSectionLabel>Endocrine:</FormSectionLabel>
        <NativeSelect
          id={`endocrine-${intervalGroup.id}`}
          defaultValue={intervalGroup.filters.context?.text || ''}
          onChange={(e) => {
            for (const interval of intervalGroup.intervals) {
              let newEndocrine: string | undefined = e.currentTarget.value;
              if (newEndocrine === '') {
                newEndocrine = undefined;
                onChange(intervalGroup.id, { ...interval, context: undefined });
              } else {
                onChange(intervalGroup.id, {
                  ...interval,
                  context: {
                    text: newEndocrine,
                    coding: [
                      { code: newEndocrine, system: 'http://terminology.hl7.org/CodeSystem/referencerange-meaning' },
                    ],
                  },
                });
              }
            }
          }}
        >
          {['', 'pre-puberty', 'follicular', 'midcycle', 'luteal', 'postmenopausal'].map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormSection>
      <FormSection htmlFor={`category-${intervalGroup.id}`}>
        <FormSectionLabel>Category: </FormSectionLabel>
        <NativeSelect
          id={`category-${intervalGroup.id}`}
          defaultValue={intervalGroup.filters.category}
          onChange={(e) => {
            for (const interval of intervalGroup.intervals) {
              const newCategory: string | undefined = e.currentTarget.value;
              if (newCategory === '') {
                onChange(intervalGroup.id, { ...interval, category: undefined });
              } else {
                onChange(intervalGroup.id, {
                  ...interval,
                  category: newCategory as 'reference' | 'critical' | 'absolute',
                });
              }
            }
          }}
        >
          {['', 'reference', 'critical', 'absolute'].map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </FormSection>
    </div>
  );
}

/**
 * Helper function that assigns ids to each qualifiedInterval of an ObservationDefinition
 * @param definition - An ObservationDefinition
 * @param setIntervalId - React setState function for the intervalId
 * @returns The updated observation definition.
 */
function ensureQualifiedIntervalKeys(
  definition: ObservationDefinition,
  setIntervalId: (id: number) => void
): ObservationDefinition {
  const intervals = definition.qualifiedInterval || [];
  // Set the nextId to the max of any existing numeric id
  let nextId =
    Math.max(
      ...intervals.map((interval) => {
        const existingNum = Number.parseInt(interval.id?.substring(3) || '', 10);
        return !Number.isNaN(existingNum) ? existingNum : Number.NEGATIVE_INFINITY;
      })
    ) + 1;

  if (!Number.isFinite(nextId)) {
    nextId = 1;
  }

  // If an interval doesn't have an id, set it to the nextId
  definition = {
    ...definition,
    qualifiedInterval: intervals.map((interval) => ({
      ...interval,
      id: interval.id || `id-${nextId++}`,
    })),
  };
  setIntervalId(nextId);
  return definition;
}

/**
 * Group all ObservationDefinitionQualifiedIntervals based on the values of their "filter" properties,
 * so that similar ranges can be grouped together.
 * @param intervals - Array of reference range intervals.
 * @param setGroupId - Callback to set the group ID.
 * @returns The grouped intervals.
 */
function groupQualifiedIntervals(
  intervals: ObservationDefinitionQualifiedInterval[],
  setGroupId: (id: number) => void
): IntervalGroup[] {
  let groupId = 1;
  const groups: Record<string, IntervalGroup> = {};
  for (const interval of intervals) {
    const groupKey = generateGroupKey(interval);
    if (!(groupKey in groups)) {
      groups[groupKey] = {
        id: `group-id-${groupId++}`,
        filters: Object.fromEntries(intervalFilters.map((f) => [f, interval[f]])),
        intervals: [],
      };
    }
    groups[groupKey].intervals.push(interval);
  }
  setGroupId(groupId);
  return Object.values(groups);
}

/**
 * Generates a unique string for each set of filter values, so that similarly filtered intervals can be grouped together.
 * @param interval - The reference range interval.
 * @returns A "group key" that corresponds to the value of the interval filter properties.
 */
function generateGroupKey(interval: ObservationDefinitionQualifiedInterval): string {
  const results = [
    `gender=${interval.gender}`,
    `age=${formatRange(interval.age)}`,
    `gestationalAge=${formatRange(interval.gestationalAge)}`,
    `context=${interval.context?.text}`,
    `appliesTo=${interval.appliesTo?.map((c) => c.text).join('+')}`,
    `category=${interval.category}`,
  ];

  return results.join(':');
}

function getUnitString(unit: CodeableConcept | undefined): string | undefined {
  return unit && (getCodeBySystem(unit, 'http://unitsofmeasure.org') || unit.text);
}

function isEmptyInterval(interval: ObservationDefinitionQualifiedInterval): boolean {
  return interval.range?.low?.value === undefined && interval.range?.high?.value === undefined;
}
