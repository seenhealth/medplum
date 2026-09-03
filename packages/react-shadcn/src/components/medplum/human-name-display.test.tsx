// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/HumanNameDisplay/HumanNameDisplay.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { HumanNameDisplay } from '@/components/medplum/human-name-display';
import { render, screen } from '@/test/render';

describe('HumanNameDisplay', () => {
  test('Renders', () => {
    render(
      <HumanNameDisplay
        value={{
          given: ['Alice'],
          family: 'Smith',
          use: 'official',
        }}
      />
    );

    expect(screen.getByText('Alice Smith')).toBeDefined();
  });

  test('Renders with options', () => {
    render(
      <HumanNameDisplay
        value={{
          given: ['Alice'],
          family: 'Smith',
          use: 'official',
        }}
        options={{ all: true }}
      />
    );

    expect(screen.getByText('Alice Smith [official]')).toBeDefined();
  });

  test('Handles null name', () => {
    expect(HumanNameDisplay({})).toBeNull();
  });
});
