// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SensitiveTextarea/SensitiveTextarea.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SensitiveTextarea } from '@/components/medplum/sensitive-textarea';
import { act, fireEvent, render, screen } from '@/test/render';

describe('SensitiveTextarea', () => {
  test('Renders', async () => {
    const onChange = vi.fn();

    render(<SensitiveTextarea placeholder="secret" defaultValue="foo" onChange={onChange} />);

    const input = screen.getByPlaceholderText<HTMLTextAreaElement>('secret');
    expect(input).toBeInTheDocument();

    await act(async () => {
      fireEvent.focus(input);
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'bar' } });
    });

    expect(onChange).toHaveBeenCalled();
    expect(input.value).toBe('bar');

    const copyButton = screen.getByTitle('Copy secret');
    expect(copyButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyButton);
    });
  });
});
