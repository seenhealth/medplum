// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ElementsInput/ElementsInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsInput } from '@/components/medplum/elements-input';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { render, screen } from '@/test/render';
import type { ElementsContextType } from '@medplum/core';

const elementsContext: ElementsContextType = {
  debugMode: false,
  elements: {
    test: {
      description: 'test',
      max: 1,
      min: 0,
      path: 'test',
      type: [{ code: 'testCode', profile: ['testProfile'], targetProfile: ['testTargetProfile'] }],
    },
  },
  elementsByPath: {
    test: {
      description: 'test',
      max: 1,
      min: 0,
      path: 'test',
      type: [{ code: 'testCode', profile: ['testProfile'], targetProfile: ['testTargetProfile'] }],
    },
  },
  path: 'elements',
  profileUrl: 'testProfileUrl',
  getExtendedProps: () => undefined,
};

const onChange = vi.fn();
describe('ElementsInput', () => {
  test('Renders', () => {
    render(
      <ElementsContext.Provider value={elementsContext}>
        <ElementsInput
          defaultValue={'testValue'}
          onChange={onChange}
          outcome={undefined}
          path="test"
          testId="test"
          type="elementsinput"
        />
      </ElementsContext.Provider>
    );

    expect(screen.getByTestId('test')).toBeDefined();
  });
});
