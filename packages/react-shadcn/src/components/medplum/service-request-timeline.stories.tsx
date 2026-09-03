// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ServiceRequestTimeline/ServiceRequestTimeline.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ServiceRequestTimeline } from '@/components/medplum/service-request-timeline';
import { HomerServiceRequest } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ServiceRequestTimeline',
  component: ServiceRequestTimeline,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <ServiceRequestTimeline serviceRequest={HomerServiceRequest} />
  </Document>
);
