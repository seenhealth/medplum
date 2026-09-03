// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PlanDefinitionBuilder/PlanDefinitionBuilder.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { PlanDefinitionBuilder } from '@/components/medplum/plan-definition-builder';
import {
  Covid19AssessmentQuestionnaire,
  Covid19CarePlanDefinition,
  Covid19PCRLabService,
  Covid19PCRServiceRequest,
  Covid19PCRTest,
  Covid19ReviewReport,
} from '@/stories/covid19';
import { useMedplum } from '@medplum/react-hooks';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export default {
  title: 'Medplum/PlanDefinitionBuilder',
  component: PlanDefinitionBuilder,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <PlanDefinitionBuilder
      value={{
        resourceType: 'PlanDefinition',
        title: 'Basic Example',
      }}
      onSubmit={(formData: any) => {
        console.log(JSON.stringify(formData, null, 2));
      }}
    />
  </Document>
);

export const Covid19Eval = (): JSX.Element => {
  const medplum = useMedplum();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async (): Promise<boolean> => {
      await medplum.createResource(Covid19AssessmentQuestionnaire);
      await medplum.createResource(Covid19CarePlanDefinition);
      await medplum.createResource(Covid19PCRServiceRequest);

      await medplum.createResource(Covid19ReviewReport);
      await medplum.createResource(Covid19PCRTest);
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
      <PlanDefinitionBuilder
        value={Covid19CarePlanDefinition}
        onSubmit={(formData: any) => {
          console.log(JSON.stringify(formData, null, 2));
        }}
      />
    </Document>
  );
};

export const Covid19PCRLabServiceStory = (): JSX.Element => {
  const medplum = useMedplum();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async (): Promise<boolean> => {
      await medplum.createResource(Covid19PCRLabService);

      await medplum.createResource(Covid19ReviewReport);

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
      <PlanDefinitionBuilder
        value={Covid19PCRLabService}
        onSubmit={(formData: any) => {
          console.log(JSON.stringify(formData, null, 2));
        }}
      />
    </Document>
  );
};
