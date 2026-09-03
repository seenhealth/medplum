// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceHistoryTable/ResourceHistoryTable.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ResourceHistoryTableProps } from '@/components/medplum/resource-history-table';
import { ResourceHistoryTable } from '@/components/medplum/resource-history-table';
import { act, render, screen } from '@/test/render';
import type { Bundle } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('ResourceHistoryTable', () => {
  async function setup(args: ResourceHistoryTableProps): Promise<void> {
    await act(async () => {
      render(
        <MedplumProvider medplum={medplum}>
          <ResourceHistoryTable {...args} />
        </MedplumProvider>
      );
    });
  }

  test('Renders preloaded history', async () => {
    const history = await medplum.readHistory('Patient', '123');
    await setup({
      history,
    });

    const el = await screen.findByText('1');
    expect(el).toBeDefined();
  });

  test('Renders after loading the resource', async () => {
    await setup({
      resourceType: 'Patient',
      id: '123',
    });

    const el = await screen.findByText('1');
    expect(el).toBeDefined();
  });

  test('Renders On Behalf Of column header', async () => {
    const history = await medplum.readHistory('Patient', '123');
    await setup({ history });
    expect(screen.getByText('On Behalf Of')).toBeDefined();
  });

  test('Renders onBehalfOf when present', async () => {
    const history: Bundle = {
      resourceType: 'Bundle',
      type: 'history',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'test-obo',
            meta: {
              versionId: '1',
              lastUpdated: '2024-01-01T00:00:00Z',
              author: { reference: 'Practitioner/124' },
              onBehalfOf: { reference: 'Practitioner/124' },
            },
          },
        },
      ],
    };
    await setup({ history });
    expect(await screen.findAllByText('Alice Smith')).toHaveLength(2);
  });
});
