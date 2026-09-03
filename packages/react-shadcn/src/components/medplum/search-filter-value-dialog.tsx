// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SearchFilterValueDialog/SearchFilterValueDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { SearchFilterValueInput } from '@/components/medplum/search-filter-value-input';
import type { Filter } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useState } from 'react';

export interface SearchFilterValueDialogProps {
  readonly title: string;
  readonly visible: boolean;
  readonly resourceType: string;
  readonly searchParam?: SearchParameter;
  readonly filter?: Filter;
  readonly defaultValue?: string;
  readonly onOk: (filter: Filter) => void;
  readonly onCancel: () => void;
}

export function SearchFilterValueDialog(props: SearchFilterValueDialogProps): JSX.Element | null {
  const [value, setValue] = useState(props.defaultValue ?? '');

  if (!props.searchParam || !props.filter) {
    return null;
  }

  function onOk(): void {
    props.onOk({ ...(props.filter as Filter), value });
  }

  return (
    <Modal open={props.visible} onOpenChange={(open) => !open && props.onCancel()} size="xl">
      <ModalHeader>
        <ModalTitle>{props.title}</ModalTitle>
      </ModalHeader>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          onOk();
        }}
      >
        <ModalBody>
          <SearchFilterValueInput
            resourceType={props.resourceType}
            searchParam={props.searchParam}
            defaultValue={value}
            autoFocus={true}
            onChange={setValue}
          />
        </ModalBody>
        <ModalFooter>
          <SubmitButton>OK</SubmitButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}
