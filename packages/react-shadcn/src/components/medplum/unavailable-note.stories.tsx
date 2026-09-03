// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/UnavailableNote/UnavailableNote.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { UnavailableNote } from '@/components/medplum/unavailable-note';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/UnavailableNote',
  component: UnavailableNote,
} as Meta;

export const SuggestionsUnavailable = (): JSX.Element => (
  <Document>
    <UnavailableNote
      text="Suggestions unavailable"
      color="yellow.9"
      message="Value set http://example.com/my-value-set is unavailable"
    />
  </Document>
);

export const FieldUnavailable = (): JSX.Element => (
  <Document>
    <UnavailableNote
      text="This field is unavailable."
      color="red"
      message="Value set http://example.com/my-value-set is unavailable"
    />
  </Document>
);

export const BothVariants = (): JSX.Element => (
  <Document>
    <div className="flex flex-col gap-4">
      <UnavailableNote
        text="Suggestions unavailable"
        color="yellow.9"
        message="Value set http://example.com/my-value-set is unavailable"
      />
      <UnavailableNote
        text="This field is unavailable."
        color="red"
        message="Value set http://example.com/my-value-set is unavailable"
      />
    </div>
  </Document>
);
