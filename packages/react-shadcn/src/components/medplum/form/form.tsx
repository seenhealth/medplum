// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Form/Form.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormContext } from '@/components/medplum/form/form-context';
import { parseForm } from '@/components/medplum/form/form-utils';
import type { CSSProperties, JSX, ReactNode, SyntheticEvent } from 'react';
import { useState } from 'react';

export interface FormProps {
  readonly onSubmit?: (formData: Record<string, string>) => Promise<void> | void;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly testid?: string;
}

export function Form(props: FormProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false);
  return (
    <FormContext.Provider value={{ submitting }}>
      <form
        style={props.style}
        data-testid={props.testid}
        onSubmit={(e: SyntheticEvent) => {
          e.preventDefault();
          const formData = parseForm(e.target as HTMLFormElement);
          if (props.onSubmit) {
            setSubmitting(true);
            const result = props.onSubmit(formData);
            if (result?.then) {
              result.catch(console.error).finally(() => {
                setSubmitting(false);
              });
            } else {
              setSubmitting(false);
            }
          }
        }}
      >
        {props.children}
      </form>
    </FormContext.Provider>
  );
}
