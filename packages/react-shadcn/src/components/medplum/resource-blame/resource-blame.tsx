// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceBlame/ResourceBlame.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { MedplumLink } from '@/components/medplum/medplum-link';
import { getTimeString, getVersionUrl } from '@/components/medplum/resource-blame/resource-blame-utils';
import { ResourceName } from '@/components/medplum/resource-name';
import { blame } from '@/lib/medplum/blame';
import type { Bundle, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export interface ResourceBlameProps {
  readonly history?: Bundle;
  readonly resourceType?: ResourceType;
  readonly id?: string;
}

export function ResourceBlame(props: ResourceBlameProps): JSX.Element | null {
  const medplum = useMedplum();
  const [value, setValue] = useState(props.history);

  useEffect(() => {
    if (!props.history && props.resourceType && props.id) {
      medplum.readHistory(props.resourceType, props.id).then(setValue).catch(console.log);
    }
  }, [medplum, props.history, props.resourceType, props.id]);

  if (!value) {
    return <div>Loading...</div>;
  }

  const resource = value.entry?.[0]?.resource as Resource;

  if (!resource) {
    return null;
  }

  const table = blame(value);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-spacing-0 rounded-sm border border-border text-xs [&_td]:whitespace-nowrap [&_td]:px-1 [&_td]:pt-0.5 [&_td]:align-top">
        <tbody>
          {table.map((row, index) => (
            <tr
              key={'row-' + index}
              className={row.span > 0 ? 'whitespace-nowrap border-t border-border' : 'whitespace-nowrap border-t-0'}
            >
              {row.span > 0 && (
                <>
                  <td className="leading-[10px]" rowSpan={row.span}>
                    <ResourceName value={row.meta.author} link={true} className="text-xs" />
                    {row.meta.onBehalfOf && (
                      <div className="onBehalfOf text-xs leading-[10px] text-muted-foreground">
                        {'on behalf of '}
                        <ResourceName
                          value={row.meta.onBehalfOf}
                          link={true}
                          className="text-xs text-muted-foreground"
                        />
                      </div>
                    )}
                  </td>
                  <td className="border-r border-border text-right leading-[10px]" rowSpan={row.span}>
                    <MedplumLink to={getVersionUrl(resource, row.meta.versionId as string)} className="text-xs">
                      {getTimeString(row.meta.lastUpdated as string)}
                    </MedplumLink>
                  </td>
                </>
              )}
              <td className="border-0 bg-muted px-3 py-2 text-right font-mono text-muted-foreground">{index + 1}</td>
              <td className="px-3 py-2 font-mono text-xs">
                <pre className="m-0">{row.value}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
