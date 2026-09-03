// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/RequestGroupDisplay/RequestGroupDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ResourceName } from '@/components/medplum/resource-name';
import { StatusBadge } from '@/components/medplum/status-badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, getReferenceString } from '@medplum/core';
import type { Bundle, BundleEntry, Reference, RequestGroup, Resource, Task } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import { IconCheckbox, IconSquare } from '@tabler/icons-react';
import type { JSX } from 'react';
import { Fragment, useEffect, useState } from 'react';

export interface RequestGroupDisplayProps {
  readonly value?: RequestGroup | Reference<RequestGroup>;
  readonly onStart: (task: Task, input: Reference) => void;
  readonly onEdit: (task: Task, input: Reference, output: Reference) => void;
}

export function RequestGroupDisplay(props: RequestGroupDisplayProps): JSX.Element | null {
  const medplum = useMedplum();
  const requestGroup = useResource(props.value);
  const [startedLoading, setStartedLoading] = useState(false);
  const [responseBundle, setResponseBundle] = useState<Bundle>();

  useEffect(() => {
    if (requestGroup && !startedLoading) {
      medplum.executeBatch(buildBatchRequest(requestGroup)).then(setResponseBundle).catch(console.log);
      setStartedLoading(true);
    }
  }, [medplum, requestGroup, startedLoading]);

  if (!requestGroup || !responseBundle) {
    return null;
  }

  return (
    <div className="grid grid-cols-12">
      {requestGroup.action?.map((action, index) => {
        const task = action.resource && findBundleEntry(action.resource as Reference<Task>);
        const taskInput = task?.input?.[0]?.valueReference;
        const taskOutput = task?.output?.[0]?.valueReference;
        return (
          <Fragment key={`action-${index}`}>
            <div className="col-span-1 p-4">
              {task?.status === 'completed' ? <IconCheckbox /> : <IconSquare color="gray" />}
            </div>
            <div className="col-span-9 p-2">
              <p className="font-medium">{action.title}</p>
              {action.description && <div>{action.description}</div>}
              <div>
                Last edited by&nbsp;
                <ResourceName value={task?.meta?.author} />
                &nbsp;on&nbsp;
                {formatDateTime(task?.meta?.lastUpdated)}
              </div>
              <div>
                Status: <StatusBadge status={task?.status || 'unknown'} />
              </div>
            </div>
            <div className="col-span-2 p-4">
              {taskInput && !taskOutput && (
                <Button type="button" onClick={() => props.onStart(task, taskInput)}>
                  Start
                </Button>
              )}
              {taskInput && taskOutput && (
                <Button type="button" onClick={() => props.onEdit(task, taskInput, taskOutput)}>
                  Edit
                </Button>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );

  function buildBatchRequest(request: RequestGroup): Bundle {
    const batchEntries: BundleEntry[] = [];
    if (request.action) {
      for (const action of request.action) {
        if (action.resource?.reference) {
          batchEntries.push({ request: { method: 'GET', url: action.resource.reference } });
        }
      }
    }

    return {
      resourceType: 'Bundle',
      type: 'batch',
      entry: batchEntries,
    };
  }

  function findBundleEntry<T extends Resource>(reference: Reference<T>): T | undefined {
    for (const entry of responseBundle?.entry ?? []) {
      if (entry.resource && reference.reference === getReferenceString(entry.resource)) {
        return entry.resource as T;
      }
    }
    return undefined;
  }
}
