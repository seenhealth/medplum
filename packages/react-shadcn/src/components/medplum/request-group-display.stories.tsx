// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RequestGroupDisplay/RequestGroupDisplay.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { RequestGroupDisplay } from '@/components/medplum/request-group-display';
import {
  Covid19AssessmentTask,
  Covid19FollowUpConsultTask,
  Covid19InitialConsultTask,
  Covid19PCRTask,
  Covid19PCRTest,
  Covid19RequestGroup,
  Covid19ReviewLabsTask,
} from '@/stories/covid19';
import { withMockedDate } from '@/stories/decorators';
import { ExampleWorkflowRequestGroup } from '@medplum/mock';
import { useMedplum } from '@medplum/react-hooks';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export default {
  title: 'Medplum/RequestGroupDisplay',
  component: RequestGroupDisplay,
  decorators: [withMockedDate],
} as Meta;

export const Simple = (): JSX.Element => (
  <Document>
    <RequestGroupDisplay onStart={console.log} onEdit={console.log} value={ExampleWorkflowRequestGroup} />
  </Document>
);

export const Covid19 = (): JSX.Element => {
  const medplum = useMedplum();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async (): Promise<boolean> => {
      await medplum.createResource(Covid19RequestGroup);
      await medplum.createResource(Covid19AssessmentTask);
      await medplum.createResource(Covid19PCRTask);
      await medplum.createResource(Covid19PCRTest);
      await medplum.createResource(Covid19FollowUpConsultTask);
      await medplum.createResource(Covid19InitialConsultTask);
      await medplum.createResource(Covid19ReviewLabsTask);
      return true;
    })()
      .then(setLoaded)
      .catch(console.log);
  }, [medplum]);

  if (!loaded) {
    return <></>;
  }
  return (
    <Document>
      <RequestGroupDisplay onStart={console.log} onEdit={console.log} value={Covid19RequestGroup} />
    </Document>
  );
};
