// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentArrayInput/AttachmentArrayInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentButton } from '@/components/medplum/attachment-button';
import { AttachmentDisplay } from '@/components/medplum/attachment-display/attachment-display';
import { Button } from '@/components/ui/button';
import { killEvent } from '@/lib/medplum/dom';
import type { Attachment } from '@medplum/fhirtypes';
import { IconCircleMinus, IconCloudUpload } from '@tabler/icons-react';
import type { JSX, MouseEvent } from 'react';
import { useState } from 'react';

export interface AttachmentArrayInputProps {
  readonly name: string;
  readonly defaultValue?: Attachment[];
  readonly arrayElement?: boolean;
  readonly onChange?: (value: Attachment[]) => void;
  readonly disabled?: boolean;
}

export function AttachmentArrayInput(props: AttachmentArrayInputProps): JSX.Element {
  const [values, setValues] = useState(props.defaultValue ?? []);

  function setValuesWrapper(newValues: Attachment[]): void {
    setValues(newValues);
    if (props.onChange) {
      props.onChange(newValues);
    }
  }

  return (
    <table style={{ width: '100%' }}>
      <colgroup>
        <col width="97%" />
        <col width="3%" />
      </colgroup>
      <tbody>
        {values.map((v: Attachment, index: number) => (
          <tr key={`${index}-${values.length}`}>
            <td>
              <AttachmentDisplay value={v} maxWidth={200} />
            </td>
            <td>
              <Button
                disabled={props.disabled}
                title="Remove"
                aria-label="Remove"
                variant="ghost"
                size="icon"
                onClick={(e: MouseEvent) => {
                  killEvent(e);
                  const copy = values.slice();
                  copy.splice(index, 1);
                  setValuesWrapper(copy);
                }}
              >
                <IconCircleMinus />
              </Button>
            </td>
          </tr>
        ))}
        <tr>
          <td></td>
          <td>
            <AttachmentButton
              disabled={props.disabled}
              onUpload={(attachment: Attachment) => {
                setValuesWrapper([...values, attachment]);
              }}
            >
              {(props) => (
                <Button {...props} title="Add" aria-label="Add" variant="ghost" size="icon">
                  <IconCloudUpload />
                </Button>
              )}
            </AttachmentButton>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
