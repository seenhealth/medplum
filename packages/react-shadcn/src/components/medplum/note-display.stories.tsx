// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/NoteDisplay/NoteDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { NoteDisplay } from '@/components/medplum/note-display';
import type { Annotation } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

const notes: Annotation[] = [
  {
    text: 'Previously reported as 167 mg/dL on 2/3/2023, 8:40:14 PM',
    authorReference: { reference: 'Practitioner/124', display: 'Dr. Alice Smith' },
  },
  {
    text: 'Previously reported as 10 mg/dL on 2/1/2023, 8:40:14 PM Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

export default {
  title: 'Medplum/NotesDisplay',
  component: NoteDisplay,
} as Meta;

export const Simple = (): JSX.Element => (
  <Document>
    <NoteDisplay value={notes.slice(1)} />
  </Document>
);

export const WithAuthor = (): JSX.Element => (
  <Document>
    <NoteDisplay value={notes.slice(0, 1)} />
  </Document>
);

export const MultipleNotes = (): JSX.Element => (
  <Document>
    <NoteDisplay value={notes} />
  </Document>
);
