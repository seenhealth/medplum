// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/BackboneElementDisplay/BackboneElementDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { BackboneElementDisplayProps } from '@/components/medplum/backbone-element-display';
import { BackboneElementDisplay } from '@/components/medplum/backbone-element-display';
import { act, render, screen } from '@/test/render';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('BackboneElementDisplay', () => {
  async function setup(args: BackboneElementDisplayProps): Promise<void> {
    await act(async () =>
      render(
        <MedplumProvider medplum={medplum}>
          <BackboneElementDisplay {...args} />
        </MedplumProvider>
      )
    );
  }

  test('Renders null', async () => {
    await setup({
      path: 'Patient.contact',
      value: { type: 'PatientContact', value: null },
    });
  });

  test('Renders value', async () => {
    await setup({
      path: 'Patient.contact',
      value: {
        type: 'PatientContact',
        value: {
          id: '123',
          name: {
            given: ['John'],
            family: 'Doe',
          },
        },
      },
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  test('Ignore missing properties', async () => {
    await setup({
      path: 'Patient.contact',
      value: {
        type: 'PatientContact',
        value: {
          id: '123',
        },
      },
      ignoreMissingValues: true,
    });
    expect(screen.queryByText('Name')).not.toBeInTheDocument();
  });

  test('Renders simple name', async () => {
    await setup({
      path: 'Patient.contact',
      value: {
        type: 'PatientContact',
        value: {
          name: 'Simple Name',
        },
      },
    });
    expect(screen.getByText('Simple Name')).toBeInTheDocument();
  });

  test('Handles name object value', async () => {
    await setup({
      path: 'Organization.contact',
      value: {
        type: 'OrganizationContact',
        value: {
          name: {
            given: ['John'],
            family: 'Doe',
          },
        },
      },
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('Not implemented', async () => {
    await setup({
      path: 'Foo',
      value: {
        type: 'Foo',
        value: {
          foo: 'bar',
        },
      },
    });
    expect(screen.getByText('Foo not implemented')).toBeInTheDocument();
  });
});
