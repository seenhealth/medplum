// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Modal/Modal.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import type { ModalProps } from '@/components/medplum/modal';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Meta } from '@storybook/react';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';

export default {
  title: 'Medplum/Modal',
  component: Modal,
} as Meta;

/**
 * Renders a trigger button next to the modal, since a modal is only interesting once opened.
 * @param props - The modal props, minus the open state the wrapper owns.
 * @returns The story React node.
 */
function ModalStory(
  props: Omit<ModalProps, 'open' | 'onOpenChange'> & { readonly label?: string; readonly children: ReactNode }
): JSX.Element {
  const { label = 'Open modal', ...modalProps } = props;
  const [open, setOpen] = useState(false);
  return (
    <Document>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Modal open={open} onOpenChange={setOpen} {...modalProps} />
    </Document>
  );
}

function bookmarkFields(): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="menuname">Menu</label>
        <Input id="menuname" name="menuname" defaultValue="Favorites" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="bookmarkname">Bookmark name</label>
        <Input id="bookmarkname" name="bookmarkname" defaultValue="Active patients" />
      </div>
    </div>
  );
}

export const Basic = (): JSX.Element => (
  <ModalStory size="md">
    <ModalHeader>
      <ModalTitle>Assign Patient</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <p>Actions stretch to the full modal width, primary action first.</p>
    </ModalBody>
    <ModalFooter>
      <Button>Assign Patient</Button>
      <Button variant="outline">Remove Assigned Patient</Button>
    </ModalFooter>
  </ModalStory>
);

export const WithForm = (): JSX.Element => (
  <ModalStory size="md">
    <ModalHeader>
      <ModalTitle>Add Bookmark</ModalTitle>
    </ModalHeader>
    <ModalBody>{bookmarkFields()}</ModalBody>
    <ModalFooter>
      <Button>OK</Button>
    </ModalFooter>
  </ModalStory>
);

export const ButtonRow = (): JSX.Element => (
  <ModalStory size="md">
    <ModalHeader>
      <ModalTitle>Delete Task</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <p>Wrapping the actions in the footer lays them out in a row, right-aligned.</p>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </ModalFooter>
  </ModalStory>
);

export const LongContent = (): JSX.Element => (
  <ModalStory size="lg">
    <ModalHeader>
      <ModalTitle>Send Fax</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 20 }, (_unused, i) => (
          <div key={`field-${i}`} className="flex flex-col gap-1">
            <label htmlFor={`field-${i}`}>Field {i + 1}</label>
            <Input id={`field-${i}`} placeholder="The body scrolls, the footer does not" />
          </div>
        ))}
      </div>
    </ModalBody>
    <ModalFooter>
      <Button>Send Fax</Button>
    </ModalFooter>
  </ModalStory>
);

export const FixedBodyHeight = (): JSX.Element => (
  <ModalStory size="xl">
    <ModalHeader>
      <ModalTitle>Edit Task</ModalTitle>
    </ModalHeader>
    <ModalBody className="h-[60vh]">
      <div className="grid h-full grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="task">Task</label>
            <Input id="task" defaultValue="Review lab results" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <Input id="description" defaultValue="" />
          </div>
        </div>
        <p className="text-muted-foreground">A fixed height holds the layout even when neither column fills it.</p>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button>Save</Button>
    </ModalFooter>
  </ModalStory>
);

export const NoActions = (): JSX.Element => (
  <ModalStory size="lg">
    <ModalHeader>
      <ModalTitle>Lab Results</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <p>Content-only modals get no footer and no footer border.</p>
    </ModalBody>
  </ModalStory>
);

export const FlushBody = (): JSX.Element => (
  <ModalStory size="xl">
    <ModalHeader>
      <ModalTitle>Prescription</ModalTitle>
    </ModalHeader>
    <ModalBody className="p-0">
      <iframe
        title="Prescription"
        srcDoc="<p>Embedded content, flush to the modal edges.</p>"
        width="100%"
        height={400}
      />
    </ModalBody>
  </ModalStory>
);
