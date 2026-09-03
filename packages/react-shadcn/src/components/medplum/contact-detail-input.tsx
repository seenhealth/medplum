// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ContactDetailInput/ContactDetailInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ContactPointInput } from '@/components/medplum/contact-point-input';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import type { ComplexTypeInputProps } from '@/components/medplum/resource-property-input-utils';
import { Input } from '@/components/ui/input';
import type { ContactDetail, ContactPoint } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useContext, useMemo, useState } from 'react';

export type ContactDetailInputProps = ComplexTypeInputProps<ContactDetail>;

export function ContactDetailInput(props: ContactDetailInputProps): JSX.Element {
  const [contactDetail, setContactDetail] = useState(props.defaultValue);

  const { getExtendedProps } = useContext(ElementsContext);
  const [nameProps, telecomProps] = useMemo(
    () => ['name', 'telecom'].map((field) => getExtendedProps(props.path + '.' + field)),
    [getExtendedProps, props.path]
  );

  function setContactDetailWrapper(newValue: ContactDetail): void {
    setContactDetail(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function setName(name: string): void {
    const newValue: ContactDetail = { ...contactDetail, name };
    if (!name) {
      delete newValue.name;
    }
    setContactDetailWrapper(newValue);
  }

  function setTelecom(telecom: ContactPoint | undefined): void {
    const newValue: ContactDetail = { ...contactDetail, telecom: telecom && [telecom] };
    if (!telecom) {
      delete newValue.telecom;
    }
    setContactDetailWrapper(newValue);
  }

  return (
    <div data-slot="contact-detail-input" className="flex flex-nowrap gap-2 *:flex-1">
      <Input
        disabled={props.disabled || nameProps?.readonly}
        data-testid={props.name + '-name'}
        name={props.name + '-name'}
        placeholder="Name"
        className="w-[180px]"
        defaultValue={contactDetail?.name}
        onChange={(e) => setName(e.currentTarget.value)}
      />
      <ContactPointInput
        disabled={props.disabled || telecomProps?.readonly}
        name={props.name + '-telecom'}
        path={props.path + '.telecom'}
        defaultValue={contactDetail?.telecom?.[0]}
        onChange={setTelecom}
        outcome={props.outcome}
      />
    </div>
  );
}
