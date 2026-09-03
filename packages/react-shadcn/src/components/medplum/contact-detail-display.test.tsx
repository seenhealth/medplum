// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailDisplay/ContactDetailDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactDetailDisplay } from '@/components/medplum/contact-detail-display';
import { render, screen } from '@/test/render';

describe('ContactDetailDisplay', () => {
  test('Handles undefined value', () => {
    render(<ContactDetailDisplay />);
  });

  test('Handles empty value', () => {
    render(<ContactDetailDisplay value={{}} />);
  });

  test('Renders named value', () => {
    render(<ContactDetailDisplay value={{ name: 'Foo', telecom: [{ value: 'homer@example.com' }] }} />);
    expect(screen.getByText('Foo: homer@example.com', { exact: false })).toBeInTheDocument();
  });
});
