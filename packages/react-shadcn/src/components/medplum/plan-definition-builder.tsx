// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PlanDefinitionBuilder/PlanDefinitionBuilder.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { ResourceInput } from '@/components/medplum/resource-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { killEvent } from '@/lib/medplum/dom';
import { cn } from '@/lib/utils';
import { getReferenceString } from '@medplum/core';
import type {
  ActivityDefinition,
  PlanDefinition,
  PlanDefinitionAction,
  Questionnaire,
  Reference,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import { IconX } from '@tabler/icons-react';
import type { JSX, MouseEvent, SyntheticEvent } from 'react';
import { useEffect, useState } from 'react';

export interface PlanDefinitionBuilderProps {
  readonly value: Partial<PlanDefinition> | Reference<PlanDefinition>;
  readonly onSubmit: (result: PlanDefinition) => void;
}

export function PlanDefinitionBuilder(props: PlanDefinitionBuilderProps): JSX.Element | null {
  const medplum = useMedplum();
  const defaultValue = useResource(props.value);
  const [schemaLoaded, setSchemaLoaded] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [hoverKey, setHoverKey] = useState<string>();
  const [value, setValue] = useState<PlanDefinition>();

  function handleDocumentMouseOver(): void {
    setHoverKey(undefined);
  }

  function handleDocumentClick(): void {
    setSelectedKey(undefined);
  }

  useEffect(() => {
    medplum
      .requestSchema('PlanDefinition')
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  }, [medplum]);

  useEffect(() => {
    setValue(ensurePlanDefinitionKeys(defaultValue ?? { resourceType: 'PlanDefinition', status: 'active' }));
    document.addEventListener('mouseover', handleDocumentMouseOver);
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('mouseover', handleDocumentMouseOver);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [defaultValue]);

  if (!schemaLoaded || !value) {
    return null;
  }

  function changeProperty(property: string, newValue: any): void {
    setValue((prevValue) => ({ ...prevValue, [property]: newValue }) as PlanDefinition);
  }

  return (
    <div>
      <Form testid="questionnaire-form" onSubmit={() => props.onSubmit(value)}>
        <FormSection htmlFor="plan-title" className="py-4">
          <FormSectionLabel>Plan Title</FormSectionLabel>
          <Input
            id="plan-title"
            defaultValue={value.title}
            onChange={(e) => changeProperty('title', e.currentTarget.value)}
          />
        </FormSection>
        <ActionArrayBuilder
          actions={value.action || []}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          hoverKey={hoverKey}
          setHoverKey={setHoverKey}
          onChange={(x) => changeProperty('action', x)}
        />
        <SubmitButton>Save</SubmitButton>
      </Form>
    </div>
  );
}

interface ActionArrayBuilderProps {
  readonly actions: PlanDefinitionAction[];
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (actions: PlanDefinitionAction[]) => void;
}

function ActionArrayBuilder(props: ActionArrayBuilderProps): JSX.Element {
  function changeAction(changedAction: PlanDefinitionAction): void {
    props.onChange(props.actions.map((i) => (i.id === changedAction.id ? changedAction : i)));
  }

  function addAction(addedAction: PlanDefinitionAction): void {
    props.onChange([...props.actions, addedAction]);
    props.setSelectedKey(addedAction.id);
  }

  function removeAction(removedAction: PlanDefinitionAction): void {
    props.onChange(props.actions.filter((i) => i !== removedAction));
  }

  return (
    <div className="section relative flex flex-col gap-4 py-1.5 pb-4 transition-all duration-100">
      {props.actions.map((action) => (
        <ActionBuilder
          key={action.id}
          action={action}
          selectedKey={props.selectedKey}
          setSelectedKey={props.setSelectedKey}
          hoverKey={props.hoverKey}
          setHoverKey={props.setHoverKey}
          onChange={changeAction}
          onRemove={() => removeAction(action)}
        />
      ))}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={(e: MouseEvent) => {
            killEvent(e);
            addAction({ id: generateId() });
          }}
        >
          Add action
        </Button>
      </div>
    </div>
  );
}

interface ActionBuilderProps {
  readonly action: PlanDefinitionAction;
  readonly selectedKey: string | undefined;
  readonly setSelectedKey: (key: string | undefined) => void;
  readonly hoverKey: string | undefined;
  readonly setHoverKey: (key: string | undefined) => void;
  readonly onChange: (action: PlanDefinitionAction) => void;
  readonly onRemove: () => void;
}

function ActionBuilder(props: ActionBuilderProps): JSX.Element {
  const { action } = props;

  function onClick(e: SyntheticEvent): void {
    e.stopPropagation();
    props.setSelectedKey(props.action.id);
  }

  function onHover(e: SyntheticEvent): void {
    killEvent(e);
    props.setHoverKey(props.action.id);
  }

  return (
    <div onClick={onClick} onMouseOver={onHover} onFocus={onHover}>
      <ActionEditor
        action={action}
        onChange={props.onChange}
        selectedKey={props.selectedKey}
        hoverKey={props.hoverKey}
        onRemove={props.onRemove}
      />
    </div>
  );
}

interface ActionEditorProps {
  readonly action: PlanDefinitionAction;
  readonly selectedKey: string | undefined;
  readonly hoverKey: string | undefined;
  readonly onChange: (action: PlanDefinitionAction) => void;
  readonly onRemove: () => void;
}

function ActionEditor(props: ActionEditorProps): JSX.Element {
  const { action } = props;
  const [actionType, setActionType] = useState<string | undefined>();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState<Questionnaire | ActivityDefinition | undefined>();
  const editing = props.selectedKey === props.action.id;
  const hovering = props.hoverKey === props.action.id;

  function changeProperty(property: string, value: any): void {
    props.onChange({
      ...action,
      [property]: value,
    });
  }

  const className = cn('section relative py-1.5 pb-4 transition-all duration-100', {
    hovering: hovering && !editing,
    'border-[1.5px] border-blue-500': hovering && !editing,
  });

  useEffect(() => {
    const readResource = async (): Promise<void> => {
      if (!action.definitionCanonical) {
        return;
      }
      setLoading(true);
      const resource = await medplum.readCanonical(['Questionnaire', 'ActivityDefinition'], action.definitionCanonical);
      setActionType(getInitialActionType(resource));
      setResource(resource);
      setLoading(false);
    };
    readResource().catch(console.error);
  }, [action.definitionCanonical, medplum]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div data-testid={action.id} className={cn('rounded-md border bg-card p-0', className)}>
      <div className="flex w-full items-center justify-between gap-4 bg-muted/50 p-2">
        <Input
          className="w-full"
          name={`actionTitle-${action.id}`}
          defaultValue={action.title}
          placeholder="Title"
          onChange={(e) => changeProperty('title', e.currentTarget.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-testid="close-button"
          aria-label="Close"
          onClick={props.onRemove}
        >
          <IconX />
        </Button>
      </div>

      {editing && (
        <div className="flex flex-col gap-8 p-4">
          <div>
            <FormSection htmlFor={`actionDescription-${action.id}`}>
              <FormSectionLabel>Task Description</FormSectionLabel>
              <Input
                id={`actionDescription-${action.id}`}
                placeholder="Enter task description"
                name={`actionDescription-${action.id}`}
                defaultValue={action.description}
                onChange={(e) => changeProperty('description', e.currentTarget.value)}
              />
            </FormSection>
          </div>

          <div>
            <FormSection htmlFor={`actionType-${action.id}`}>
              <FormSectionLabel>Type of Action</FormSectionLabel>
              <NativeSelect
                id={`actionType-${action.id}`}
                value={actionType}
                onChange={(e) => {
                  const value = e.currentTarget.value === 'standard' ? undefined : e.currentTarget.value;
                  setActionType(value);
                  props.onChange({
                    ...props.action,
                    definitionCanonical: value === 'standard' ? undefined : props.action.definitionCanonical,
                  });
                }}
              >
                <NativeSelectOption value="standard">Standard task</NativeSelectOption>
                <NativeSelectOption value="questionnaire">Task with Questionnaire</NativeSelectOption>
                <NativeSelectOption value="activitydefinition">Task with Activity Definition</NativeSelectOption>
              </NativeSelect>
            </FormSection>
          </div>

          {actionType === 'questionnaire' && (
            <div className="flex flex-col gap-0">
              <div className="mb-2 flex gap-0">
                <span className="font-semibold">Select questionnaire</span>
                <span className="text-destructive">*</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Questionnaire to be shown in the task in Encounter view. You can create new one from{' '}
                <a href="/Questionnaire" target="_blank" className="text-primary underline-offset-4 hover:underline">
                  questionnaires list
                </a>
              </p>
              <ActionResourceTypeBuilder
                resource={resource}
                resourceType="Questionnaire"
                action={action}
                onChange={props.onChange}
                placeholder="Search for questionnaire"
              />
            </div>
          )}

          {actionType === 'activitydefinition' && (
            <div className="flex flex-col gap-0">
              <div className="mb-2 flex gap-0">
                <span className="font-semibold">Select activity definition</span>
                <span className="text-destructive">*</span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                ActivityDefinition.kind resource to be shown in the task in Encounter view. You can create new one from{' '}
                <a
                  href="/ActivityDefinition"
                  target="_blank"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  activity definitions list
                </a>
              </p>
              <ActionResourceTypeBuilder
                resource={resource}
                resourceType="ActivityDefinition"
                action={action}
                onChange={props.onChange}
                placeholder="Search for activity definition"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ActionResourceTypeBuilderProps {
  readonly action: PlanDefinitionAction;
  readonly resource: Questionnaire | ActivityDefinition | undefined;
  readonly resourceType: 'Questionnaire' | 'ActivityDefinition';
  readonly placeholder?: string;
  readonly onChange: (action: PlanDefinitionAction) => void;
}

function ActionResourceTypeBuilder(props: ActionResourceTypeBuilderProps): JSX.Element {
  const { id } = props.action;
  const { resource } = props as { resource: Questionnaire | ActivityDefinition };

  return (
    <ResourceInput
      name={id as string}
      placeholder={props.placeholder}
      resourceType={props.resourceType}
      defaultValue={resource}
      onChange={(newValue) => {
        if (newValue) {
          props.onChange({
            ...props.action,
            definitionCanonical: 'url' in newValue ? newValue.url : undefined,
            definitionUri: !('url' in newValue) ? getReferenceString(newValue) : undefined,
          });
        } else {
          props.onChange({ ...props.action, definitionCanonical: undefined });
        }
      }}
    />
  );
}

function getInitialActionType(resource: Questionnaire | ActivityDefinition | undefined): string | undefined {
  return resource === undefined ? 'standard' : resource.resourceType.toLowerCase();
}

let nextId = 1;

/**
 * Generates a unique ID.
 * React needs unique IDs for components for rendering performance.
 * All of the important components in the questionnaire builder have id properties for this:
 * Questionnaire, QuestionnaireItem, and QuestionnaireItemAnswerOption.
 * @param existing - Optional existing id which will update nextId.
 * @returns A unique key.
 */
function generateId(existing?: string): string {
  if (existing) {
    if (existing.startsWith('id-')) {
      const existingNum = Number.parseInt(existing.substring(3), 10);
      if (!Number.isNaN(existingNum)) {
        nextId = Math.max(nextId, existingNum + 1);
      }
    }
    return existing;
  }
  return 'id-' + nextId++;
}

function ensurePlanDefinitionKeys(planDefinition: PlanDefinition): PlanDefinition {
  return {
    ...planDefinition,
    action: ensurePlanDefinitionActionKeys(planDefinition.action),
  };
}

function ensurePlanDefinitionActionKeys(
  actions: PlanDefinitionAction[] | undefined
): PlanDefinitionAction[] | undefined {
  if (!actions) {
    return undefined;
  }
  return actions.map((action) => ({
    ...action,
    id: generateId(action.id),
    action: ensurePlanDefinitionActionKeys(action.action),
  }));
}
