// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentInput/AttachmentInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentButton } from '@/components/medplum/attachment-button';
import { AttachmentDisplay } from '@/components/medplum/attachment-display/attachment-display';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Button } from '@/components/ui/button';
import { killEvent } from '@/lib/medplum/dom';
import type { Attachment, Reference } from '@medplum/fhirtypes';
import type { JSX, MouseEvent } from 'react';
import { useState } from 'react';

export interface AttachmentInputProps extends ComplexTypeInputProps<Attachment> {
  readonly arrayElement?: boolean;
  readonly securityContext?: Reference;
  readonly onChange?: (value: Attachment | undefined) => void;
}

export function AttachmentInput(props: AttachmentInputProps): JSX.Element {
  const [value, setValue] = useState(props.defaultValue);

  function setValueWrapper(newValue: Attachment | undefined): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  if (value) {
    return (
      <>
        <AttachmentDisplay value={value} maxWidth={200} />
        <Button
          disabled={props.disabled}
          onClick={(e: MouseEvent) => {
            killEvent(e);
            setValueWrapper(undefined);
          }}
        >
          Remove
        </Button>
      </>
    );
  }

  return (
    <AttachmentButton disabled={props.disabled} securityContext={props.securityContext} onUpload={setValueWrapper}>
      {(props) => <Button {...props}>Upload...</Button>}
    </AttachmentButton>
  );
}
