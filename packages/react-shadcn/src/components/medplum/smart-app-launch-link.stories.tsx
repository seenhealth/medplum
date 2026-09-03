// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SmartAppLaunchLink/SmartAppLaunchLink.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { SmartAppLaunchLink } from '@/components/medplum/smart-app-launch-link';
import { createReference } from '@medplum/core';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/SmartAppLaunchLink',
  component: SmartAppLaunchLink,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <SmartAppLaunchLink
      client={{ resourceType: 'ClientApplication', launchUri: 'https://example.com' }}
      patient={createReference(HomerSimpson)}
    >
      Example SMART Launch
    </SmartAppLaunchLink>
  </Document>
);
