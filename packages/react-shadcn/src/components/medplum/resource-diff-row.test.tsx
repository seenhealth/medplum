// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiffRow/ResourceDiffRow.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ResourceDiffRowProps } from '@/components/medplum/resource-diff-row';
import { ResourceDiffRow } from '@/components/medplum/resource-diff-row';
import { Table, TableBody } from '@/components/ui/table';
import { act, render, screen } from '@/test/render';

describe('ResourceDiffRow', () => {
  function setup(props: ResourceDiffRowProps): void {
    render(
      <Table>
        <TableBody>
          <ResourceDiffRow {...props} />
        </TableBody>
      </Table>
    );
  }

  test('Text diff', async () => {
    await act(async () => {
      setup({
        name: 'Add name',
        path: 'given',
        property: undefined,
        originalValue: { type: 'string', value: 'Bart' },
        revisedValue: { type: 'string', value: 'Homer' },
      });
    });

    expect(await screen.findByText('Homer')).toBeInTheDocument();
  });

  test('Text Expand/Collapse', async () => {
    await act(async () => {
      setup({
        name: 'Replace sourceCode',
        path: 'Bot.sourceCode',
        property: {
          description: 'Bot source code',
          path: 'Bot.sourceCode',
          min: 0,
          max: 1,
          type: [
            {
              code: 'Attachment',
            },
          ],
        },
        originalValue: {
          type: 'Attachment',
          value: {
            contentType: 'text/typescript',
            title: 'old.ts',
            url: 'http://example.com/old.pdf',
          },
        },
        revisedValue: {
          type: 'Attachment',
          value: {
            contentType: 'text/typescript',
            url: 'http://example.com/new.ts',
            title: 'new.ts',
          },
        },
      });
    });

    await act(async () => {
      const button = screen.getByText('Expand');
      button.click();
    });

    expect(await screen.queryByText('Expand')).not.toBeInTheDocument();
  });

  test('No Attachmentcd diff - No Expand button', async () => {
    await act(async () => {
      setup({
        name: 'Add name',
        path: 'given',
        property: undefined,
        originalValue: { type: 'string', value: 'Bart' },
        revisedValue: { type: 'string', value: 'Homer' },
      });
    });

    expect(await screen.queryByText('Expand')).not.toBeInTheDocument();
  });
});
