// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Document } from '@/components/medplum/document';
import { RingProgress } from '@/components/ui/ring-progress';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'UI/RingProgress',
  component: RingProgress,
} as Meta;

export const Basic = (): JSX.Element => (
  <Document>
    <RingProgress sections={[{ value: 65, color: 'text-primary' }]} roundCaps label="65%" />
  </Document>
);
