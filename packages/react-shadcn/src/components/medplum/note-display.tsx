// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/NoteDisplay/NoteDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { Annotation } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface NoteDisplayProps {
  readonly value?: Annotation[];
}

export function NoteDisplay({ value }: NoteDisplayProps): JSX.Element | null {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col justify-start gap-2">
      {value.map(
        (note) =>
          note.text && (
            <blockquote key={`note-${note.text}`} className="border-l-2 p-[5px] pl-4 text-muted-foreground italic">
              {note.text}
              {(note.authorReference?.display || note.authorString) && (
                <cite className="mt-[3px] block text-xs not-italic">
                  {note.authorReference?.display || note.authorString}
                </cite>
              )}
            </blockquote>
          )
      )}
    </div>
  );
}
