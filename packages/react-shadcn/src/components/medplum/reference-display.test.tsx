// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ReferenceDisplay/ReferenceDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ReferenceDisplay } from '@/components/medplum/reference-display';
import { render, screen } from '@/test/render';
import type { Reference } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { ReactElement } from 'react';

const medplum = new MockClient();

function setup(ui: ReactElement): void {
  render(<MedplumProvider medplum={medplum}>{ui}</MedplumProvider>);
}

describe('ReferenceDisplay', () => {
  test('Renders undefined', () => {
    setup(<ReferenceDisplay />);
  });

  test('Renders reference', () => {
    setup(<ReferenceDisplay value={{ reference: 'Organization/125' }} />);
    expect(screen.getByText('Organization/125')).toBeDefined();
    expect(screen.getByText<HTMLAnchorElement>('Organization/125').href).toMatch('Organization/125');
  });

  test('Renders reference and display', () => {
    setup(<ReferenceDisplay value={{ reference: 'Organization/125', display: 'Foo' }} />);
    expect(screen.getByText('Foo')).toBeDefined();
    expect(screen.getByText<HTMLAnchorElement>('Foo').href).toMatch('Organization/125');
  });

  test('Renders unknown properties', () => {
    setup(<ReferenceDisplay value={{ foo: 'bar' } as unknown as Reference} />);
    expect(screen.getByText('{"foo":"bar"}')).toBeDefined();
  });

  test('Renders reference no link', () => {
    setup(<ReferenceDisplay value={{ reference: 'Organization/125' }} link={false} />);
    expect(screen.getByText('Organization/125')).toBeDefined();
  });

  test('Renders reference and display no link', () => {
    setup(<ReferenceDisplay value={{ reference: 'Organization/125', display: 'Foo' }} link={false} />);
    expect(screen.getByText('Foo')).toBeDefined();
  });
});
