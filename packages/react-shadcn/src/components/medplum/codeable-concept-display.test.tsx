// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/CodeableConceptDisplay/CodeableConceptDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptDisplay } from '@/components/medplum/codeable-concept-display';
import { render, screen } from '@/test/render';

describe('CodeableConceptDisplay', () => {
  test('Handles undefined value', () => {
    render(<CodeableConceptDisplay />);
  });

  test('Handles empty value', () => {
    render(<CodeableConceptDisplay value={{}} />);
  });

  test('Renders text', () => {
    render(<CodeableConceptDisplay value={{ text: 'foo' }} />);
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  test('Renders single code', () => {
    render(<CodeableConceptDisplay value={{ coding: [{ code: 'foo' }] }} />);
    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  test('Renders multiple code', () => {
    render(<CodeableConceptDisplay value={{ coding: [{ code: 'foo' }, { code: 'bar' }] }} />);
    expect(screen.getByText('foo, bar')).toBeInTheDocument();
  });
});
