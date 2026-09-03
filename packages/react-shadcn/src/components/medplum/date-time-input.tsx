// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/DateTimeInput/DateTimeInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { convertIsoToLocal, convertLocalToIso } from '@/components/medplum/date-time-input-utils';
import type { PrimitiveTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import type { OperationOutcome } from '@medplum/fhirtypes';
import type { ChangeEvent, JSX } from 'react';

export interface DateTimeInputProps extends PrimitiveTypeInputProps {
  readonly label?: string;
  readonly placeholder?: string;
  readonly defaultValue?: string;
  readonly autoFocus?: boolean;
  readonly outcome?: OperationOutcome;
  readonly onChange?: (value: string) => void;
}

/**
 * The DateTimeInput component is a wrapper around the HTML5 input type="datetime-local".
 * The main purpose is to reconcile time zones.
 * Most of our date/time values are in ISO-8601, which includes a time zone offset.
 * The datetime-local input does not support the time zone offset.
 * @param props - The Input props.
 * @returns The JSX element to render.
 */
export function DateTimeInput(props: DateTimeInputProps): JSX.Element {
  const error = getErrorsForInput(props.outcome, props.name);
  return (
    <Field data-invalid={error ? true : undefined} className="gap-1">
      {props.label && <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>}
      <Input
        id={props.name}
        name={props.name}
        data-autofocus={props.autoFocus}
        data-testid={props['data-testid'] ?? props.name}
        placeholder={props.placeholder}
        required={props.required}
        disabled={props.disabled}
        type={getInputType()}
        step={1}
        defaultValue={convertIsoToLocal(props.defaultValue)}
        autoFocus={props.autoFocus}
        aria-invalid={error ? true : undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (props.onChange) {
            const newValue = e.currentTarget.value;
            props.onChange(convertLocalToIso(newValue));
          }
        }}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

/**
 * Returns the input type for the requested type.
 * JSDOM does not support many of the valid <input> type attributes.
 * For example, it won't fire change events for <input type="datetime-local">.
 * @returns The input type for the current environment.
 */
function getInputType(): string {
  return import.meta.env.NODE_ENV === 'test' ? 'text' : 'datetime-local';
}
