// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AnnotationInput/AnnotationInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Input } from '@/components/ui/input';
import { createReference } from '@medplum/core';
import type { Annotation } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useState } from 'react';

export interface AnnotationInputProps extends ComplexTypeInputProps<Annotation> {}

export function AnnotationInput(props: AnnotationInputProps): JSX.Element {
  const author = useMedplumProfile();
  const [value, setValue] = useState(props.defaultValue || ({} as Annotation));

  function setText(text: string): void {
    const newValue: Annotation = text
      ? {
          text,
          authorReference: author && createReference(author),
          time: new Date().toISOString(),
        }
      : ({} as Annotation);

    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <Input
      disabled={props.disabled}
      name={props.name}
      placeholder="Annotation text"
      defaultValue={value.text}
      onChange={(e) => setText(e.currentTarget.value)}
    />
  );
}
