// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Modal/Modal.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { Button } from '@/components/ui/button';
import { fireEvent, render, screen } from '@/test/render';

describe('Modal', () => {
  test('Renders title, body and actions', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <ModalHeader>
          <ModalTitle>Add Bookmark</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
        <ModalFooter>
          <Button>Save</Button>
        </ModalFooter>
      </Modal>
    );
    expect(screen.getByRole('heading', { name: 'Add Bookmark' })).toBeDefined();
    expect(screen.getByText('Body content')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
  });

  test('Renders nothing when closed', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()}>
        <ModalHeader>
          <ModalTitle>Add Bookmark</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
      </Modal>
    );
    expect(screen.queryByText('Body content')).toBeNull();
  });

  test('Renders actions after the body', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <ModalHeader>
          <ModalTitle>Add Bookmark</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
        <ModalFooter>
          <Button>Save</Button>
        </ModalFooter>
      </Modal>
    );
    const body = screen.getByText('Body content');
    const action = screen.getByRole('button', { name: 'Save' });
    // Node.DOCUMENT_POSITION_FOLLOWING (4) means the action comes after the body.
    expect(body.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('Omits the footer without actions', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <ModalHeader>
          <ModalTitle>Lab Results</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
      </Modal>
    );
    expect(document.querySelector('[data-slot="modal-footer"]')).toBeNull();
    expect(document.querySelector('[data-slot="modal-body"]')).not.toBeNull();
  });

  test.skip('Applies the layout classes alongside the Mantine classes (Mantine-specific: no Mantine classNames bag exists on this composition)', () => {});

  test.skip('Merges caller classNames rather than replacing them (Mantine-specific: classNames prop bag has no equivalent; each sub-component takes its own className)', () => {});

  test.skip('Leaves the styles prop as an escape hatch (Mantine-specific: Modal no longer accepts a per-slot styles bag)', () => {});

  test.skip('Sets the body height custom property (bodyHeight prop dropped from the composition API; ModalBody sizes via flex-1 min-h-0 overflow-y-auto)', () => {});

  test.skip('Omits the body height custom property by default (bodyHeight prop dropped from the composition API)', () => {});

  test.skip('Submits body fields from an action button (Form/SubmitButton not yet ported to react-shadcn; onSubmit removed from Modal, callers own their <form>)', () => {});

  test('Renders no form without onSubmit', () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <ModalHeader>
          <ModalTitle>Add Bookmark</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
        <ModalFooter>
          <Button>Save</Button>
        </ModalFooter>
      </Modal>
    );
    expect(document.querySelector('form')).toBeNull();
  });

  test('Closes from the default close button', () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange}>
        <ModalHeader>
          <ModalTitle>Add Bookmark</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div>Body content</div>
        </ModalBody>
      </Modal>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test.skip('Allows overriding the close button props (closeButtonProps bag replaced by boolean withCloseButton; no override mechanism modeled)', () => {});

  test.skip('Renders no header without a title or close button (header presence is caller-controlled via composition; there is no title prop to tie it to)', () => {});
});
