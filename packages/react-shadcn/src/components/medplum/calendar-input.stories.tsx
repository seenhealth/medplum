// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CalendarInput/CalendarInput.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CalendarInput } from '@/components/medplum/calendar-input';
import { Document } from '@/components/medplum/document';
import { withMockedDate } from '@/stories/decorators';
import type { Slot } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/CalendarInput',
  component: CalendarInput,
  decorators: [withMockedDate],
} as Meta;

export const Basic = (): JSX.Element => {
  const start = new Date();
  const end = new Date(start);
  end.setHours(start.getHours() + 1);
  return (
    <Document>
      <CalendarInput
        slots={
          [
            {
              resourceType: 'Slot',
              schedule: {
                reference: 'Schedule/example',
              },
              status: 'free',
              start: start.toISOString(),
              end: end.toISOString(),
            },
          ] as Slot[]
        }
        onChangeMonth={(date: Date) => console.log(date)}
        onClick={(date: Date) => console.log('Clicked ' + date)}
      />
    </Document>
  );
};
