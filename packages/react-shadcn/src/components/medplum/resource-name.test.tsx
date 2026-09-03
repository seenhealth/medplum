// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceName/ResourceName.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ResourceNameProps } from '@/components/medplum/resource-name';
import { ResourceName } from '@/components/medplum/resource-name';
import { render, screen } from '@/test/render';
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('ResourceName', () => {
  function setup(args: ResourceNameProps): void {
    render(
      <MedplumProvider medplum={medplum}>
        <ResourceName {...args} />
      </MedplumProvider>
    );
  }

  test('Renders system', () => {
    setup({ value: { reference: 'system' } });
    expect(screen.getByText('System')).toBeDefined();
  });

  test('Renders resource directly', async () => {
    setup({
      value: HomerSimpson,
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();
  });

  test('Renders resource directly as link', async () => {
    setup({
      value: HomerSimpson,
      link: true,
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();
  });

  test('Renders after loading the resource', async () => {
    setup({
      value: createReference(HomerSimpson),
    });

    expect(await screen.findByText('Homer Simpson')).toBeInTheDocument();
  });

  test('Renders operation outcome', async () => {
    setup({
      value: { reference: 'Patient/not-found' },
    });

    expect(await screen.findByText('[Not found]')).toBeInTheDocument();
  });
});
