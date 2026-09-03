// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireBuilder/QuestionnaireBuilder.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { QuestionnaireFormItem } from '@/components/medplum/questionnaire-form/questionnaire-form-item';
import { getValueAndType } from '@/components/medplum/resource-property-display-utils';
import { ResourcePropertyInput } from '@/components/medplum/resource-property-input';
import { ResourceTypeInput } from '@/components/medplum/resource-type-input';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { killEvent } from '@/lib/medplum/dom';
import { cn } from '@/lib/utils';
import { getElementDefinition, isResource as isResourceType } from '@medplum/core';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  Reference,
  ResourceType,
} from '@medplum/fhirtypes';
import {
  getQuestionnaireItemReferenceTargetTypes,
  isChoiceQuestion,
  QUESTIONNAIRE_ITEM_CONTROL_URL,
  QuestionnaireItemType,
  setQuestionnaireItemReferenceTargetTypes,
  useMedplum,
  useResource,
} from '@medplum/react-hooks';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import type { JSX, MouseEvent, SyntheticEvent } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface QuestionnaireBuilderProps {
  readonly questionnaire: Partial<Questionnaire> | Reference<Questionnaire>;
  readonly onSubmit: (result: Questionnaire) => void;
  readonly autoSave?: boolean;
}

export function QuestionnaireBuilder(props: QuestionnaireBuilderProps): JSX.Element | null {
  const medplum = useMedplum();
  const defaultValue = useResource(props.questionnaire);
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  const [value, setValue] = useState<Questionnaire>();
  const [selectedKey, setSelectedKey] = useState<string>();
  const [hoverKey, setHoverKey] = useState<string>();

  function handleDocumentMouseOver(): void {
    setHoverKey(undefined);
  }

  function handleDocumentClick(): void {
    setSelectedKey(undefined);
  }

  useEffect(() => {
    medplum
      .requestSchema('Questionnaire')
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  }, [medplum]);

  useEffect(() => {
    setValue(ensureQuestionnaireKeys(defaultValue ?? { resourceType: 'Questionnaire', status: 'active' }));
    document.addEventListener('mouseover', handleDocumentMouseOver);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('mouseover', handleDocumentMouseOver);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [defaultValue]);

  const handleChange = (questionnaire: Questionnaire, disableSubmit?: boolean): void => {
    setValue(questionnaire);
    if (props.autoSave && !disableSubmit && props.onSubmit) {
      props.onSubmit(questionnaire);
    }
  };

  if (!schemaLoaded || !value) {
    return null;
  }

  return (
    <div>
      <Form testid="questionnaire-form" onSubmit={() => props.onSubmit(value)}>
        <ItemBuilder
          item={value}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          hoverKey={hoverKey}
          setHoverKey={setHoverKey}
          onChange={handleChange}
        />
        <SubmitButton>Save</SubmitButton>
      </Form>
    </div>
  );
}

interface ItemBuilderProps<T extends Questionnaire | QuestionnaireItem> {
  readonly item: T;
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly isFirst?: boolean;
  readonly isLast?: boolean;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (item: T, disableSubmit?: boolean) => void;
  readonly onRemove?: () => void;
  readonly onRepeatable?: (item: QuestionnaireItem) => void;
  onMoveUp?(): void;
  onMoveDown?(): void;
}

function ItemBuilder<T extends Questionnaire | QuestionnaireItem>(props: ItemBuilderProps<T>): JSX.Element {
  const resource = props.item as Questionnaire;
  const item = props.item as QuestionnaireItem;
  const isResource = isResourceType(props.item);
  const isContainer = isResource || item.type === QuestionnaireItemType.group;
  const linkId = item.linkId ?? '[untitled]';
  const editing = props.selectedKey === props.item.id;
  const hovering = props.hoverKey === props.item.id;

  const itemRef = useRef(props.item);
  useLayoutEffect(() => {
    itemRef.current = props.item;
  });

  function onClick(e: SyntheticEvent): void {
    killEvent(e);
    props.setSelectedKey(props.item.id);
  }

  function onHover(e: SyntheticEvent): void {
    killEvent(e);
    props.setHoverKey(props.item.id);
  }

  function changeItem(changedItem: QuestionnaireItem): void {
    const curr = itemRef.current;
    props.onChange({
      ...curr,
      item: curr.item?.map((i) => (i.id === changedItem.id ? changedItem : i)),
    });
  }

  function addItem(addedItem: QuestionnaireItem, disableSubmit?: boolean): void {
    props.onChange(
      {
        ...props.item,
        item: [...(props.item.item ?? []), addedItem],
      },
      disableSubmit
    );
  }

  function removeItem(removedItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      item: props.item.item?.filter((i) => i !== removedItem),
    });
  }

  function changeProperty(property: string, value: any): void {
    props.onChange({
      ...itemRef.current,
      [property]: value,
    });
  }

  function updateItem(updatedItem: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      ...updatedItem,
    });
  }

  function toggleRepeatable(item: QuestionnaireItem): void {
    props.onChange({
      ...props.item,
      item: props.item.item?.map((i) => (i === item ? { ...i, repeats: !i.repeats } : i)),
    });
  }

  function moveItem(itemIndex: number, delta: number): void {
    const updatedItems = reorderItems(props.item.item, itemIndex, delta);

    props.onChange({
      ...props.item,
      item: updatedItems,
    });
  }

  const className = cn(
    'section relative mx-1 mb-2 mt-1 rounded-sm border-[1.5px] border-gray-100 px-3 pb-4 pt-1.5 transition-all duration-100',
    {
      editing,
      'min-h-[100px] border-gray-100 border-l-4 border-l-blue-500': editing,
      hovering: hovering && !editing,
      'border-blue-500': hovering && !editing,
    }
  );

  return (
    <div data-testid={item.linkId} className={className} onClick={onClick} onMouseOver={onHover} onFocus={onHover}>
      <div className="max-w-[600px]">
        {editing ? (
          <>
            {isResource && (
              <Input
                className="h-12 text-xl"
                defaultValue={resource.title}
                onBlur={(e) => changeProperty('title', e.currentTarget.value)}
              />
            )}
            {!isResource && (
              <Textarea
                className="field-sizing-content min-h-16"
                defaultValue={item.text}
                onBlur={(e) => changeProperty('text', e.currentTarget.value)}
              />
            )}
            {item.type === 'reference' && <ReferenceProfiles item={item} onChange={updateItem} />}
            {isChoiceQuestion(item) && <AnswerBuilder item={item} onChange={(item) => updateItem(item)} />}
          </>
        ) : (
          <>
            {resource.title && <h1 className="text-2xl font-semibold tracking-tight">{resource.title}</h1>}
            {item.text && <div className="whitespace-pre-wrap">{item.text}</div>}
            {!isContainer && (
              <QuestionnaireFormItem item={item} index={0} required={false} responseItem={{ linkId: item.linkId }} />
            )}
          </>
        )}
      </div>
      {item.item?.map((item, i) => (
        <div key={item.id}>
          <ItemBuilder
            item={item}
            selectedKey={props.selectedKey}
            setSelectedKey={props.setSelectedKey}
            hoverKey={props.hoverKey}
            isFirst={i === 0}
            isLast={i === (props.item.item ?? []).length - 1}
            setHoverKey={props.setHoverKey}
            onChange={changeItem}
            onRemove={() => removeItem(item)}
            onRepeatable={toggleRepeatable}
            onMoveUp={() => moveItem(i, -1)}
            onMoveDown={() => moveItem(i, 1)}
          />
        </div>
      ))}
      {!isContainer && (
        <div className="absolute top-px right-8 p-1 text-xs text-gray-500">
          {editing ? (
            <>
              <Input
                className="mb-1 h-6 w-[100px] text-xs"
                defaultValue={item.linkId}
                onBlur={(e) => changeProperty('linkId', e.currentTarget.value)}
              />
              {!isContainer && (
                <NativeSelect
                  size="sm"
                  className="w-[100px]"
                  defaultValue={item.type}
                  onChange={(e) => changeProperty('type', e.currentTarget.value)}
                >
                  <NativeSelectOption value="display">Display</NativeSelectOption>
                  <NativeSelectOption value="boolean">Boolean</NativeSelectOption>
                  <NativeSelectOption value="decimal">Decimal</NativeSelectOption>
                  <NativeSelectOption value="integer">Integer</NativeSelectOption>
                  <NativeSelectOption value="date">Date</NativeSelectOption>
                  <NativeSelectOption value="dateTime">Date/Time</NativeSelectOption>
                  <NativeSelectOption value="time">Time</NativeSelectOption>
                  <NativeSelectOption value="string">String</NativeSelectOption>
                  <NativeSelectOption value="text">Text</NativeSelectOption>
                  <NativeSelectOption value="url">URL</NativeSelectOption>
                  <NativeSelectOption value="choice">Choice</NativeSelectOption>
                  <NativeSelectOption value="open-choice">Open Choice</NativeSelectOption>
                  <NativeSelectOption value="attachment">Attachment</NativeSelectOption>
                  <NativeSelectOption value="reference">Reference</NativeSelectOption>
                  <NativeSelectOption value="quantity">Quantity</NativeSelectOption>
                </NativeSelect>
              )}
            </>
          ) : (
            <div>{linkId}</div>
          )}
        </div>
      )}
      {!isResource && (
        <div className="absolute top-0 right-2 pt-2 text-xs">
          <div className="flex flex-col">
            {!props.isFirst && (
              <a
                href="#"
                className="ml-2 text-primary underline-offset-4 hover:underline"
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  if (props.onMoveUp) {
                    props.onMoveUp();
                  }
                }}
              >
                <IconArrowUp data-testid="up-button" size={15} className="text-gray-500" />
              </a>
            )}
            {!props.isLast && (
              <a
                href="#"
                className="ml-2 text-primary underline-offset-4 hover:underline"
                onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  if (props.onMoveDown) {
                    props.onMoveDown();
                  }
                }}
              >
                <IconArrowDown data-testid="down-button" size={15} className="text-gray-500" />
              </a>
            )}
          </div>
        </div>
      )}
      <div className="absolute right-1 bottom-0 text-xs [&_a]:ml-2">
        {isContainer && (
          <>
            <a
              href="#"
              className="text-primary underline-offset-4 hover:underline"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                addItem({
                  id: generateId(),
                  linkId: generateLinkId('q'),
                  type: 'string',
                  text: 'Question',
                });
              }}
            >
              Add item
            </a>
            <a
              href="#"
              className="text-primary underline-offset-4 hover:underline"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                addItem(
                  {
                    id: generateId(),
                    linkId: generateLinkId('g'),
                    type: 'group',
                    text: 'Group',
                  },
                  true
                );
              }}
            >
              Add group
            </a>
          </>
        )}
        {isResource && (
          <a
            href="#"
            className="text-primary underline-offset-4 hover:underline"
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              addItem(createPage(), true);
            }}
          >
            Add Page
          </a>
        )}
        {editing && !isResource && (
          <>
            <a
              href="#"
              className="text-primary underline-offset-4 hover:underline"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                if (props.onRepeatable) {
                  props.onRepeatable(item);
                }
              }}
            >
              {item.repeats ? 'Remove Repeatable' : 'Make Repeatable'}
            </a>
            <a
              href="#"
              className="text-primary underline-offset-4 hover:underline"
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                if (props.onRemove) {
                  props.onRemove();
                }
              }}
            >
              Remove
            </a>
          </>
        )}
      </div>
    </div>
  );
}

interface AnswerBuilderProps {
  readonly item: QuestionnaireItem;
  readonly onChange: (item: QuestionnaireItem) => void;
}

function AnswerBuilder(props: AnswerBuilderProps): JSX.Element {
  const property = getElementDefinition('QuestionnaireItemAnswerOption', 'value[x]');
  const options = props.item.answerOption ?? [];
  return (
    <div>
      {props.item.answerValueSet !== undefined ? (
        <Input
          placeholder="Enter Value Set"
          defaultValue={props.item.answerValueSet}
          onChange={(e) => props.onChange({ ...props.item, answerValueSet: e.target.value })}
        />
      ) : (
        <AnswerOptionsInput options={options} property={property} item={props.item} onChange={props.onChange} />
      )}
      <div className="flex">
        <a
          href="#"
          className="text-primary underline-offset-4 hover:underline"
          onClick={(e: SyntheticEvent) => {
            killEvent(e);
            props.onChange({
              ...props.item,
              answerValueSet: undefined,
              answerOption: [
                ...options,
                {
                  id: generateId(),
                },
              ],
            });
          }}
        >
          Add choice
        </a>
        <div className="w-8" />
        <a
          href="#"
          className="text-primary underline-offset-4 hover:underline"
          onClick={(e: SyntheticEvent) => {
            killEvent(e);
            props.onChange({
              ...props.item,
              answerOption: [],
              answerValueSet: '',
            });
          }}
        >
          Add value set
        </a>
      </div>
    </div>
  );
}

interface AnswerOptionsInputProps {
  readonly options: QuestionnaireItemAnswerOption[];
  readonly property: any;
  readonly item: QuestionnaireItem;
  readonly onChange: (item: QuestionnaireItem) => void;
}

function AnswerOptionsInput(props: AnswerOptionsInputProps): JSX.Element {
  return (
    <div>
      {props.options.map((option: QuestionnaireItemAnswerOption) => {
        const [propertyValue, propertyType] = getValueAndType(
          { type: 'QuestionnaireItemAnswerOption', value: option },
          'value'
        );
        return (
          <div
            key={option.id}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '80%',
            }}
          >
            <div>
              <ResourcePropertyInput
                key={option.id}
                name="value[x]"
                path="Questionnaire.answerOption.value[x]"
                property={props.property}
                defaultPropertyType={propertyType}
                defaultValue={propertyValue}
                onChange={(newValue: any, propName?: string) => {
                  const newOptions = [...props.options];
                  const index = newOptions.findIndex((o) => o.id === option.id);
                  newOptions[index] = { id: option.id, [propName as string]: newValue };
                  props.onChange({
                    ...props.item,
                    answerOption: newOptions,
                  });
                }}
                outcome={undefined}
              />
            </div>

            <div>
              <a
                href="#"
                className="text-primary underline-offset-4 hover:underline"
                onClick={(e: SyntheticEvent) => {
                  killEvent(e);
                  props.onChange({
                    ...props.item,
                    answerOption: props.options.filter((o) => o.id !== option.id),
                  });
                }}
              >
                Remove
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ReferenceTypeProps {
  readonly item: QuestionnaireItem;
  readonly onChange: (updatedItem: QuestionnaireItem) => void;
}

function ReferenceProfiles(props: ReferenceTypeProps): JSX.Element {
  const targetTypes = getQuestionnaireItemReferenceTargetTypes(props.item) ?? [];
  return (
    <>
      {targetTypes.map((targetType: ResourceType, index: number) => {
        return (
          <div key={`${targetType}-${index}`} className="flex flex-wrap items-center gap-4">
            <ResourceTypeInput
              name="resourceType"
              placeholder="Resource Type"
              defaultValue={targetType}
              onChange={(newValue) => {
                props.onChange(
                  setQuestionnaireItemReferenceTargetTypes(
                    props.item,
                    targetTypes.map((t) => (t === targetType ? (newValue as ResourceType) : t))
                  )
                );
              }}
            />
            <a
              href="#"
              className="text-primary underline-offset-4 hover:underline"
              onClick={(e: SyntheticEvent) => {
                killEvent(e);
                props.onChange(
                  setQuestionnaireItemReferenceTargetTypes(
                    props.item,
                    targetTypes.filter((t) => t !== targetType)
                  )
                );
              }}
            >
              Remove
            </a>
          </div>
        );
      })}
      <a
        href="#"
        className="text-primary underline-offset-4 hover:underline"
        onClick={(e: SyntheticEvent) => {
          killEvent(e);
          props.onChange(setQuestionnaireItemReferenceTargetTypes(props.item, [...targetTypes, '' as ResourceType]));
        }}
      >
        Add Resource Type
      </a>
    </>
  );
}

let nextLinkId = 1;
let nextId = 1;

/**
 * Generates a link ID for an item.
 * Link IDs are required properties on QuestionnaireItem objects.
 * @param prefix - The link ID prefix string.
 * @returns A unique link ID.
 */
function generateLinkId(prefix: string): string {
  return prefix + nextLinkId++;
}

/**
 * Generates a unique ID.
 * React needs unique IDs for components for rendering performance.
 * All of the important components in the questionnaire builder have id properties for this:
 * Questionnaire, QuestionnaireItem, and QuestionnaireItemAnswerOption.
 * @returns A unique key.
 */
function generateId(): string {
  return 'id-' + nextId++;
}

function ensureQuestionnaireKeys(questionnaire: Questionnaire): Questionnaire {
  return {
    ...questionnaire,
    id: questionnaire.id || generateId(),
    item: ensureQuestionnaireItemKeys(questionnaire.item),
  };
}

function ensureQuestionnaireItemKeys(items: QuestionnaireItem[] | undefined): QuestionnaireItem[] | undefined {
  if (!items) {
    return undefined;
  }
  items.forEach((item) => {
    if (item.id?.match(/^id-\d+$/)) {
      nextId = Math.max(nextId, Number.parseInt(item.id.substring(3), 10) + 1);
    }
    if (item.linkId?.match(/^q\d+$/)) {
      nextLinkId = Math.max(nextLinkId, Number.parseInt(item.linkId.substring(1), 10) + 1);
    }
  });
  return items.map((item) => ({
    ...item,
    id: item.id || generateId(),
    item: ensureQuestionnaireItemKeys(item.item),
    answerOption: ensureQuestionnaireOptionKeys(item.answerOption),
  }));
}

function ensureQuestionnaireOptionKeys(
  options: QuestionnaireItemAnswerOption[] | undefined
): QuestionnaireItemAnswerOption[] | undefined {
  if (!options) {
    return undefined;
  }
  return options.map((option) => ({
    ...option,
    id: option.id || generateId(),
  }));
}

function createPage(): QuestionnaireItem {
  return {
    id: generateId(),
    linkId: generateLinkId('s'),
    type: 'group',
    text: `New Page`,
    extension: [
      {
        url: QUESTIONNAIRE_ITEM_CONTROL_URL,
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://hl7.org/fhir/questionnaire-item-control',
              code: 'page',
            },
          ],
        },
      },
    ],
  };
}

function reorderItems(items: QuestionnaireItem[] | undefined, itemIndex: number, delta: number): QuestionnaireItem[] {
  const currentItems = items ?? [];
  const newIndex = itemIndex + delta;
  if (newIndex < 0 || newIndex >= currentItems.length) {
    return currentItems;
  }

  const updatedItems = [...currentItems];
  [updatedItems[itemIndex], updatedItems[newIndex]] = [updatedItems[newIndex], updatedItems[itemIndex]];

  return updatedItems;
}
