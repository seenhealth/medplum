// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/FormSection/FormSection.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { READ_ONLY_TOOLTIP_TEXT, maybeWrapWithTooltip } from '@/lib/medplum/maybe-wrap-with-tooltip';
import { getErrorsForInput } from '@/lib/medplum/outcomes';
import { cn } from '@/lib/utils';
import type { OperationOutcome } from '@medplum/fhirtypes';
import type { ComponentProps, JSX } from 'react';
import { createContext, useContext } from 'react';

interface FormSectionContextType {
  readonly htmlFor?: string;
  readonly fhirPath?: string;
  readonly readonly?: boolean;
  readonly error?: string;
}

const FormSectionContext = createContext<FormSectionContextType>({});

export interface FormSectionProps extends ComponentProps<'div'> {
  readonly htmlFor?: string;
  readonly outcome?: OperationOutcome;
  readonly fhirPath?: string;
  readonly errorExpression?: string;
  readonly readonly?: boolean;
  readonly orientation?: 'vertical' | 'horizontal' | 'responsive';
}

export function FormSection(props: FormSectionProps): JSX.Element {
  const { htmlFor, outcome, fhirPath, errorExpression, readonly, orientation, className, children, ...rest } = props;
  const error = getErrorsForInput(outcome, errorExpression ?? htmlFor);
  return maybeWrapWithTooltip(
    readonly ? READ_ONLY_TOOLTIP_TEXT : undefined,
    <FormSectionContext.Provider value={{ htmlFor, fhirPath, readonly, error }}>
      <Field
        data-slot="form-section"
        orientation={orientation}
        data-invalid={error ? true : undefined}
        className={cn('gap-1', className)}
        {...rest}
      >
        {children}
      </Field>
    </FormSectionContext.Provider>
  );
}

export interface FormSectionLabelProps extends ComponentProps<typeof FieldLabel> {
  readonly required?: boolean;
}

export function FormSectionLabel({ required, className, children, ...props }: FormSectionLabelProps): JSX.Element {
  const { htmlFor, fhirPath, readonly } = useContext(FormSectionContext);
  const { debugMode } = useContext(ElementsContext);
  return (
    <FieldLabel
      data-slot="form-section-label"
      htmlFor={htmlFor}
      className={cn('whitespace-pre-wrap', readonly && 'text-muted-foreground', className)}
      {...props}
    >
      {children}
      {debugMode && fhirPath && ` - ${fhirPath}`}
      {required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
    </FieldLabel>
  );
}

export function FormSectionDescription({ className, ...props }: ComponentProps<typeof FieldDescription>): JSX.Element {
  return (
    <FieldDescription
      data-slot="form-section-description"
      className={cn('whitespace-pre-wrap', className)}
      {...props}
    />
  );
}

export function FormSectionContent(props: ComponentProps<typeof FieldContent>): JSX.Element {
  return <FieldContent data-slot="form-section-content" {...props} />;
}

// Renders the OperationOutcome issues matched by the parent FormSection; nothing when there are none.
export function FormSectionError(props: ComponentProps<typeof FieldError>): JSX.Element | null {
  const { error } = useContext(FormSectionContext);
  if (!error) {
    return null;
  }
  return (
    <FieldError data-slot="form-section-error" {...props}>
      {error}
    </FieldError>
  );
}
