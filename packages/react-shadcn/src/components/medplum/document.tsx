// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Document/Document.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Container } from '@/components/medplum/container';
import type { PanelProps } from '@/components/medplum/panel';
import { Panel } from '@/components/medplum/panel';
import type { JSX } from 'react';

export function Document(props: PanelProps): JSX.Element {
  const { children, ...others } = props;
  return (
    <Container>
      <Panel {...others}>{children}</Panel>
    </Container>
  );
}
