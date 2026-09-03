// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/BookmarkDialog/BookmarkDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { notify } from '@/lib/medplum/notify';
import type { WithId } from '@medplum/core';
import { deepClone, normalizeErrorString } from '@medplum/core';
import type { UserConfiguration } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';

interface BookmarkDialogProps {
  readonly pathname: string;
  readonly searchParams: URLSearchParams;
  readonly visible: boolean;
  readonly onOk: () => void;
  readonly onCancel: () => void;
}
export function BookmarkDialog(props: BookmarkDialogProps): JSX.Element | null {
  const medplum = useMedplum();
  const config = medplum.getUserConfiguration() as WithId<UserConfiguration>;

  function submitHandler(formData: Record<string, string>): void {
    const { menuname, bookmarkname: name } = formData;
    const target = `${props.pathname}?${props.searchParams.toString()}`;
    const newConfig = deepClone(config);
    const menu = newConfig.menu?.find(({ title }) => title === menuname);

    menu?.link?.push({ name, target });
    medplum
      .updateResource(newConfig)
      .then((res) => {
        // refresh current config menu
        config.menu = res.menu;
        medplum.dispatchEvent({ type: 'change' });
        notify.success('Success');
        props.onOk();
      })
      .catch((err: any) => {
        notify.error(normalizeErrorString(err));
      });
  }

  return (
    <Modal open={props.visible} onOpenChange={(open) => !open && props.onCancel()}>
      <ModalHeader>
        <ModalTitle>Add Bookmark</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={submitHandler}>
          <div className="flex flex-col gap-4">
            <SelectMenu config={config}></SelectMenu>
            <FormSection htmlFor="bookmarkname">
              <FormSectionLabel required>Bookmark Name</FormSectionLabel>
              <Input
                id="bookmarkname"
                type="text"
                name="bookmarkname"
                placeholder="Bookmark Name"
                defaultValue={props.pathname.split('/')[1] || ''}
              />
            </FormSection>
            <div className="flex justify-end">
              <SubmitButton>OK</SubmitButton>
            </div>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
}

interface SelectMenuProps {
  readonly config: UserConfiguration | undefined;
}

function SelectMenu(props: SelectMenuProps): JSX.Element {
  function userConfigToMenu(config: UserConfiguration | undefined): string[] {
    return config?.menu?.map((menu) => menu.title) as [];
  }
  const menus = userConfigToMenu(props.config);

  return (
    <FormSection htmlFor="menuname">
      <FormSectionLabel required>Select Menu Option</FormSectionLabel>
      <NativeSelect id="menuname" name="menuname" aria-label="Select Menu Option *" defaultValue={menus[0]}>
        {menus.map((menu) => (
          <NativeSelectOption key={menu} value={menu}>
            {menu}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </FormSection>
  );
}
