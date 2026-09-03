// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceTimeline/ResourceTimeline.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceTimeline } from '@/components/medplum/resource-timeline';
import type { MedplumClient, ProfileResource } from '@medplum/core';
import { createReference } from '@medplum/core';
import type { Attachment, Bundle, Encounter, ResourceType } from '@medplum/fhirtypes';
import { HomerEncounter } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceTimeline',
  component: ResourceTimeline,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ResourceTimeline
      value={HomerEncounter}
      loadTimelineResources={(
        medplum: MedplumClient,
        resourceType: ResourceType,
        id: string
      ): Promise<PromiseSettledResult<Bundle>[]> => {
        return Promise.allSettled([
          medplum.readHistory(resourceType, id),
          medplum.search('Communication', 'encounter=' + resourceType + '/' + id),
          medplum.search('Media', 'encounter=' + resourceType + '/' + id),
        ]);
      }}
    />
  </Document>
);

export const WithComments = (): JSX.Element => (
  <Document>
    <ResourceTimeline
      value={HomerEncounter}
      loadTimelineResources={(
        medplum: MedplumClient,
        resourceType: ResourceType,
        id: string
      ): Promise<PromiseSettledResult<Bundle>[]> => {
        return Promise.allSettled([
          medplum.readHistory(resourceType, id),
          medplum.search('Communication', 'encounter=' + resourceType + '/' + id),
          medplum.search('Media', 'encounter=' + resourceType + '/' + id),
        ]);
      }}
      createCommunication={(resource: Encounter, sender: ProfileResource, text: string) => ({
        resourceType: 'Communication',
        status: 'completed',
        encounter: createReference(resource),
        subject: resource.subject,
        sender: createReference(sender),
        payload: [{ contentString: text }],
      })}
      createMedia={(resource: Encounter, operator: ProfileResource, content: Attachment) => ({
        resourceType: 'Media',
        status: 'completed',
        encounter: createReference(resource),
        subject: resource.subject,
        operator: createReference(operator),
        content,
      })}
    />
  </Document>
);
