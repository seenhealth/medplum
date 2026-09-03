// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchExportDialog/SearchExportDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { Button } from '@/components/ui/button';
import type { JSX } from 'react';

interface SearchExportDialogProps {
  readonly visible: boolean;
  readonly exportCsv?: () => void;
  readonly exportTransactionBundle?: () => void;
  readonly onCancel: () => void;
}

export function SearchExportDialog(props: SearchExportDialogProps): JSX.Element | null {
  // Left undefined when neither format is offered, so the modal renders no footer and no
  // footer border rather than an empty bordered strip.
  const actions =
    props.exportCsv || props.exportTransactionBundle ? (
      <>
        {props.exportCsv && <ExportButton text="CSV" exportLogic={props.exportCsv} onCancel={props.onCancel} />}
        {props.exportTransactionBundle && (
          <ExportButton
            text="Transaction Bundle"
            exportLogic={props.exportTransactionBundle}
            onCancel={props.onCancel}
          />
        )}
      </>
    ) : undefined;

  return (
    <Modal open={props.visible} onOpenChange={(open) => !open && props.onCancel()}>
      <ModalHeader>
        <ModalTitle>Export</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>Limited to 1000 records</p>
      </ModalBody>
      {actions && <ModalFooter>{actions}</ModalFooter>}
    </Modal>
  );
}

interface ExportButtonProps {
  readonly text: string;
  readonly exportLogic: () => void;
  readonly onCancel: () => void;
}

export function ExportButton(props: ExportButtonProps): JSX.Element {
  return (
    <Button
      onClick={() => {
        props.exportLogic();
        props.onCancel();
      }}
    >
      {`Export as ${props.text}`}
    </Button>
  );
}
