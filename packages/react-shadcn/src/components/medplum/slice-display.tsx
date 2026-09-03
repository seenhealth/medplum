// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SliceDisplay/SliceDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ElementsContext } from '@/components/medplum/elements-input-utils';
import { ResourcePropertyDisplay } from '@/components/medplum/resource-property-display';
import { maybeWrapWithContext } from '@/lib/medplum/maybe-wrap-with-context';
import type { ElementsContextType, InternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import { buildElementsContext, isPopulated } from '@medplum/core';
import type { JSX } from 'react';
import { useContext, useMemo } from 'react';

export interface SliceDisplayProps {
  readonly path: string;
  readonly slice: SliceDefinitionWithTypes;
  readonly property: InternalSchemaElement;
  readonly value: any[];
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
}

export function SliceDisplay(props: SliceDisplayProps): JSX.Element {
  const { slice, property } = props;

  const sliceElements = slice.typeSchema?.elements ?? slice.elements;

  const parentContext = useContext(ElementsContext);

  const contextValue: ElementsContextType | undefined = useMemo(() => {
    if (isPopulated(sliceElements)) {
      return buildElementsContext({
        parentContext: parentContext,
        elements: sliceElements,
        path: props.path,
        profileUrl: slice.typeSchema?.url,
      });
    }
    return undefined;
  }, [parentContext, props.path, slice.typeSchema?.url, sliceElements]);

  return maybeWrapWithContext(
    ElementsContext.Provider,
    contextValue,
    <>
      {props.value.map((value, valueIndex) => {
        return (
          <div key={`${valueIndex}-${props.value.length}`}>
            <ResourcePropertyDisplay
              property={property}
              path={props.path}
              arrayElement={true}
              elementDefinitionType={slice.type[0]}
              propertyType={slice.type[0].code}
              value={value}
              ignoreMissingValues={props.ignoreMissingValues}
              link={props.link}
            />
          </div>
        );
      })}
    </>
  );
}
