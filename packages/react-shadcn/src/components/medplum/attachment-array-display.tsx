// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/AttachmentArrayDisplay/AttachmentArrayDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentDisplay } from '@/components/medplum/attachment-display/attachment-display';
import { DescriptionListEntry } from '@/components/medplum/description-list';
import type { InternalSchemaElement } from '@medplum/core';
import { getPathDisplayName, isPopulated } from '@medplum/core';
import type { Attachment } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface AttachmentArrayDisplayProps {
  readonly path?: string;
  readonly values?: Attachment[];
  readonly maxWidth?: number;
  readonly includeDescriptionListEntry?: boolean;
  readonly property?: InternalSchemaElement;
}

export function AttachmentArrayDisplay(props: AttachmentArrayDisplayProps): JSX.Element {
  const attachmentElements = props.values?.map((v, index) => (
    <div key={'attatchment-' + index}>
      <AttachmentDisplay value={v} maxWidth={props.maxWidth} />
    </div>
  ));

  let content: JSX.Element;
  if (props.includeDescriptionListEntry) {
    if (props.property === undefined) {
      throw new Error('props.property is required when includeDescriptionListEntry is true');
    }

    if (!isPopulated(props.path)) {
      throw new Error('props.path is required when includeDescriptionListEntry is true');
    }

    // Since arrays are responsible for rendering their own DescriptionListEntry, we must find the key
    const key = props.path.split('.').pop() as string;
    content = <DescriptionListEntry term={getPathDisplayName(key)}>{attachmentElements}</DescriptionListEntry>;
  } else {
    content = <>{attachmentElements}</>;
  }
  return content;
}
