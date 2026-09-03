// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceBadge/ResourceBadge.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ResourceBadgeProps } from '@/components/medplum/resource-badge';
import { ResourceBadge } from '@/components/medplum/resource-badge';
import { render, screen } from '@/test/render';
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

function setup(args: ResourceBadgeProps): void {
  render(
    <MedplumProvider medplum={medplum}>
      <ResourceBadge {...args} />
    </MedplumProvider>
  );
}

describe('ResourceBadge', () => {
  test('Renders system', () => {
    setup({ value: { reference: 'system' } });
    expect(screen.getByText('System')).toBeDefined();
  });

  test('Renders resource directly', async () => {
    setup({
      value: HomerSimpson,
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();

    expect(screen.getByText('Homer Simpson')).toBeDefined();
  });

  test('Renders resource directly as link', async () => {
    setup({
      value: HomerSimpson,
      link: true,
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();

    expect(screen.getByText('Homer Simpson')).toBeDefined();
  });

  test('Renders after loading the resource', async () => {
    setup({
      value: createReference(HomerSimpson),
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();

    expect(screen.getByText('Homer Simpson')).toBeDefined();
  });
});
