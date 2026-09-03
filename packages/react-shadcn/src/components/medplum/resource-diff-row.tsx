// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiffRow/ResourceDiffRow.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ResourcePropertyDisplay } from '@/components/medplum/resource-property-display';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import type { InternalSchemaElement, TypedValue } from '@medplum/core';
import type { JSX } from 'react';
import { useState } from 'react';

export interface ResourceDiffRowProps {
  name: string;
  path: string;
  property: InternalSchemaElement | undefined;
  originalValue: TypedValue | undefined;
  revisedValue: TypedValue | undefined;
}

export function ResourceDiffRow(props: ResourceDiffRowProps): JSX.Element {
  const { name, path, property, originalValue, revisedValue } = props;
  const isAttachmentType = !!property?.type?.find((t) => t.code === 'Attachment');
  const [isCollapsed, setIsCollapsed] = useState(isAttachmentType);
  const toggleCollapse = (): void => setIsCollapsed((prev) => !prev);

  return (
    <>
      {(isAttachmentType && !isCollapsed) || !isAttachmentType ? (
        <>
          <TableRow>
            <TableCell>{name}</TableCell>
            <TableCell className="removed text-red-600 line-through">
              {originalValue && (
                <ResourcePropertyDisplay
                  path={path}
                  property={property}
                  propertyType={originalValue.type}
                  value={originalValue.value}
                  ignoreMissingValues={true}
                />
              )}
            </TableCell>
            <TableCell className="added text-green-600">
              {revisedValue && (
                <ResourcePropertyDisplay
                  path={path}
                  property={property}
                  propertyType={revisedValue.type}
                  value={revisedValue.value}
                  ignoreMissingValues={true}
                />
              )}
            </TableCell>
          </TableRow>
        </>
      ) : (
        <TableRow>
          <TableCell>{name}</TableCell>
          <TableCell colSpan={2} style={{ textAlign: 'right' }}>
            <Button onClick={toggleCollapse} variant="secondary">
              Expand
            </Button>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
