// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceForm/ResourceForm.utils.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { InternalSchemaElement } from '@medplum/core';
import { capitalize, isEmpty } from '@medplum/core';
import type { StructureDefinition } from '@medplum/fhirtypes';

export function setPropertyValue(
  obj: any,
  key: string,
  propName: string,
  elementDefinition: InternalSchemaElement,
  value: any
): any {
  const types = elementDefinition.type;
  if (types.length > 1) {
    for (const type of types) {
      const compoundKey = key.replace('[x]', capitalize(type.code));
      if (compoundKey in obj) {
        delete obj[compoundKey];
      }
    }
  }
  if (isEmpty(value)) {
    obj[propName] = undefined;
  } else {
    obj[propName] = value;
  }
  return obj;
}

export type SupportedProfileStructureDefinition = StructureDefinition & {
  url: NonNullable<StructureDefinition['url']>;
  name: NonNullable<StructureDefinition['name']>;
};

export function isSupportedProfileStructureDefinition(
  profile?: StructureDefinition
): profile is SupportedProfileStructureDefinition {
  return !!profile && !isEmpty(profile.url) && !isEmpty(profile.name);
}
