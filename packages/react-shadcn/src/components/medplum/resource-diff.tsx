// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiff/ResourceDiff.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { Delta } from '@/lib/medplum/diff';
import { diff } from '@/lib/medplum/diff';
import { stringify } from '@medplum/core';
import type { Resource } from '@medplum/fhirtypes';
import type { JSX } from 'react';

export interface ResourceDiffProps {
  readonly original: Resource;
  readonly revised: Resource;
  readonly ignoreMeta?: boolean;
}

export function ResourceDiff(props: ResourceDiffProps): JSX.Element {
  let originalResource = props.original;
  let revisedResource = props.revised;

  if (props.ignoreMeta) {
    originalResource = { ...originalResource, meta: undefined };
    revisedResource = { ...revisedResource, meta: undefined };
  }

  const original = stringify(originalResource, true).match(/[^\r\n]+/g) ?? ['{', '}'];
  const revised = stringify(revisedResource, true).match(/[^\r\n]+/g) ?? ['{', '}'];
  const deltas = diff(original, revised);
  return (
    <pre style={{ color: 'gray' }}>
      {deltas.map((delta, index) => (
        <ChangeDiff key={'delta' + index} delta={delta} />
      ))}
    </pre>
  );
}

function ChangeDiff(props: { delta: Delta }): JSX.Element {
  return (
    <>
      ...
      <br />
      {props.delta.original.lines.length > 0 && (
        <div className="removed text-red-600 line-through">{props.delta.original.lines.join('\n')}</div>
      )}
      {props.delta.revised.lines.length > 0 && (
        <div className="added text-green-600">{props.delta.revised.lines.join('\n')}</div>
      )}
      ...
      <br />
    </>
  );
}
