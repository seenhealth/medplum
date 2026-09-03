// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFieldEditor/SearchFieldEditor.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SearchFieldEditor } from '@/components/medplum/search-field-editor';
import { act, fireEvent, render, screen } from '@/test/render';
import type { SearchRequest } from '@medplum/core';
import { MockClient } from '@medplum/mock';

describe('SearchFieldEditor', () => {
  beforeAll(async () => {
    await new MockClient().requestSchema('Patient');
  });

  test('Render not visible', () => {
    const currSearch: SearchRequest = {
      resourceType: 'Patient',
      fields: ['name'],
    };

    render(<SearchFieldEditor search={currSearch} visible={false} onOk={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.queryByText('OK')).toBeNull();
  });

  test('Modal onClose not called when overlay clicked while dropdown open', async () => {
    let currSearch: SearchRequest = {
      resourceType: 'Patient',
      fields: [],
    };
    const onCancel = vi.fn();

    render(<SearchFieldEditor search={currSearch} visible={true} onOk={(e) => (currSearch = e)} onCancel={onCancel} />);

    // opens the dropdown
    await act(async () => {
      fireEvent.focus(screen.getByPlaceholderText('Select fields to display'));
    });

    // click the overlay
    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('overlay-child'));
      fireEvent.mouseUp(screen.getByTestId('overlay-child'));
      fireEvent.click(screen.getByTestId('overlay-child'));
    });

    expect(onCancel).not.toHaveBeenCalled();
  });

  test('Modal onClose called when overlay clicked while dropdown NOT open', async () => {
    let currSearch: SearchRequest = {
      resourceType: 'Patient',
      fields: [],
    };
    const onCancel = vi.fn();

    render(<SearchFieldEditor search={currSearch} visible={true} onOk={(e) => (currSearch = e)} onCancel={onCancel} />);

    // click the overlay
    await act(async () => {
      fireEvent.mouseDown(screen.getByTestId('overlay-child'));
      fireEvent.mouseUp(screen.getByTestId('overlay-child'));
      fireEvent.click(screen.getByTestId('overlay-child'));
    });

    expect(onCancel).toHaveBeenCalled();
  });
});
