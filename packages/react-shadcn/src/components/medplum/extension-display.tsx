// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ExtensionDisplay/ExtensionDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { BackboneElementDisplay } from '@/components/medplum/backbone-element-display';
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { ResourcePropertyDisplay } from '@/components/medplum/resource-property-display';
import { getValueAndType } from '@/components/medplum/resource-property-display-utils';
import type { ElementType } from '@medplum/core';
import { getDataType, isPopulated, isProfileLoaded, tryGetProfile } from '@medplum/core';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';

export type ExtensionDisplayProps = {
  /** The path identifies the element and is expressed as a "."-separated list of ancestor elements, beginning with the name of the resource or extension. */
  readonly path: string;
  readonly elementDefinitionType?: ElementType;
  readonly value: any;
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
  readonly compact?: boolean;
};

export function ExtensionDisplay(props: ExtensionDisplayProps): JSX.Element | null {
  const { elementDefinitionType } = props;

  const medplum = useMedplum();
  const ctx = useContext(ElementsContext);
  const [typeSchema, setTypeSchema] = useState(getDataType('Extension'));
  const profileUrl: string | undefined = useMemo(() => {
    if (!isPopulated(elementDefinitionType?.profile)) {
      return undefined;
    }

    return elementDefinitionType.profile[0] satisfies string;
  }, [elementDefinitionType]);
  const [loadingProfile, setLoadingProfile] = useState(profileUrl !== undefined);

  useEffect(() => {
    if (profileUrl) {
      setLoadingProfile(true);
      medplum
        .requestProfileSchema(profileUrl)
        .then(() => {
          const profile = tryGetProfile(profileUrl);
          setLoadingProfile(false);
          if (profile) {
            setTypeSchema(profile);
          }
        })
        .catch((reason) => {
          setLoadingProfile(false);
          console.warn(reason);
        });
    }
  }, [medplum, profileUrl]);

  if (profileUrl && (loadingProfile || !isProfileLoaded(profileUrl))) {
    return <div>Loading...</div>;
  }

  const valueElement = typeSchema.elements['value[x]'];
  const extensionHasValue = valueElement?.max !== 0;
  if (extensionHasValue) {
    const [propertyValue, propertyType] = getValueAndType(
      { type: 'Extension', value: props.value },
      'value[x]',
      profileUrl ?? ctx.profileUrl
    );
    return <ResourcePropertyDisplay propertyType={propertyType} value={propertyValue} />;
  }

  return (
    <BackboneElementDisplay
      path={props.path}
      value={{ type: typeSchema.type, value: props.value }}
      compact={props.compact}
      ignoreMissingValues={props.ignoreMissingValues}
      link={props.link}
      profileUrl={profileUrl}
    />
  );
}
