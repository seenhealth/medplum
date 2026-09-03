// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Panel/Panel.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { Panel } from '@/components/medplum/panel';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/Panel',
  component: Panel,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <Panel>Your content here</Panel>
  </Document>
);

export const ExtraShadow = (): JSX.Element => (
  <Document>
    <Panel className="shadow-xl">Your content here</Panel>
  </Document>
);

export const NoBorder = (): JSX.Element => (
  <Document>
    <Panel className="border-0">Your content here</Panel>
  </Document>
);

export const Rounded = (): JSX.Element => (
  <Document>
    <Panel className="rounded-xl">Your content here</Panel>
  </Document>
);

export const Nested = (): JSX.Element => (
  <Document>
    <Panel>
      Outer Panel
      <Panel className="rounded-xl">Inner Panel</Panel>
    </Panel>
  </Document>
);
