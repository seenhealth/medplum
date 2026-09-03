// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceTimeline/ResourceTimeline.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AttachmentButton } from '@/components/medplum/attachment-button';
import { AttachmentDisplay } from '@/components/medplum/attachment-display/attachment-display';
import { DiagnosticReportDisplay } from '@/components/medplum/diagnostic-report-display';
import { Form } from '@/components/medplum/form/form';
import { Panel } from '@/components/medplum/panel';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { ResourceDiffTable } from '@/components/medplum/resource-diff-table';
import { ResourceTable } from '@/components/medplum/resource-table';
import type { TimelineItemProps } from '@/components/medplum/timeline';
import { Timeline, TimelineItem, TimelineItemMenu } from '@/components/medplum/timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { sortByDateAndPriority } from '@/lib/medplum/date';
import { notify } from '@/lib/medplum/notify';
import type { MedplumClient, ProfileResource } from '@medplum/core';
import { createReference, normalizeErrorString } from '@medplum/core';
import type {
  Attachment,
  AuditEvent,
  Bundle,
  Communication,
  DiagnosticReport,
  Media,
  OperationOutcome,
  Reference,
  Resource,
  ResourceType,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import { IconCloudUpload, IconMessage } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ResourceTimelineMenuItemContext {
  readonly primaryResource: Resource;
  readonly currentResource: Resource;
  readonly reloadTimeline: () => void;
}

export interface ResourceTimelineProps<T extends Resource> {
  readonly value: T | Reference<T>;
  readonly loadTimelineResources: (
    medplum: MedplumClient,
    resourceType: ResourceType,
    id: string
  ) => Promise<PromiseSettledResult<Bundle>[]>;
  readonly createCommunication?: (resource: T, sender: ProfileResource, text: string) => Communication;
  readonly createMedia?: (resource: T, operator: ProfileResource, attachment: Attachment) => Media;
  readonly getMenu?: (context: ResourceTimelineMenuItemContext) => ReactNode;
}

export function ResourceTimeline<T extends Resource>(props: ResourceTimelineProps<T>): JSX.Element {
  const medplum = useMedplum();
  const sender = medplum.getProfile() as ProfileResource;
  const inputRef = useRef<HTMLInputElement>(null);
  const resource = useResource(props.value);
  const [history, setHistory] = useState<Bundle>();
  const [items, setItems] = useState<Resource[]>([]);
  const [countToShow, setCountToShow] = useState(10);
  const loadTimelineResources = props.loadTimelineResources;
  const uploadNotificationId = useRef<string | number | undefined>(undefined);

  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  });

  /**
   * Sorts and sets the items.
   *
   * Sorting is primarily a function of meta.lastUpdated, but there are special cases.
   * When displaying connected resources, for example a Communication in the context of an Encounter,
   * the Communication.sent time is used rather than Communication.meta.lastUpdated.
   *
   * Other examples of special cases:
   * - DiagnosticReport.issued
   * - Media.issued
   * - Observation.issued
   * - DocumentReference.date
   *
   * See "sortByDateAndPriority()" for more details.
   */
  const sortAndSetItems = useCallback(
    (newItems: Resource[]): void => {
      sortByDateAndPriority(newItems, resource);
      newItems.reverse();
      setItems(newItems);
    },
    [resource]
  );

  /**
   * Handles a batch request response.
   * @param batchResponse - The batch response.
   */
  const handleBatchResponse = useCallback(
    (batchResponse: PromiseSettledResult<Bundle>[]): void => {
      const newItems: Resource[] = [];

      for (const settledResult of batchResponse) {
        if (settledResult.status !== 'fulfilled') {
          // User may not have access to all resource types
          continue;
        }

        const bundle = settledResult.value;
        if (bundle.type === 'history') {
          setHistory(bundle);
        }

        if (bundle.entry) {
          for (const entry of bundle.entry) {
            newItems.push(entry.resource as Resource);
          }
        }
      }

      sortAndSetItems(newItems);
    },
    [sortAndSetItems]
  );

  /**
   * Adds an array of resources to the timeline.
   * @param resource - Resource to add.
   */
  const addResource = useCallback(
    (resource: Resource): void => sortAndSetItems([...itemsRef.current, resource]),
    [sortAndSetItems]
  );

  /**
   * Loads the timeline.
   */
  const loadTimeline = useCallback(() => {
    let resourceType: ResourceType;
    let id: string;
    if ('resourceType' in props.value) {
      resourceType = props.value.resourceType;
      id = props.value.id as string;
    } else {
      [resourceType, id] = props.value.reference?.split('/') as [ResourceType, string];
    }
    loadTimelineResources(medplum, resourceType, id).then(handleBatchResponse).catch(console.error);
  }, [medplum, props.value, loadTimelineResources, handleBatchResponse]);

  useEffect(() => loadTimeline(), [loadTimeline]);

  /**
   * Adds a Communication resource to the timeline.
   * @param contentString - The comment content.
   */
  function createComment(contentString: string): void {
    if (!resource || !props.createCommunication) {
      // Encounter not loaded yet
      return;
    }
    medplum
      .createResource(props.createCommunication(resource, sender, contentString))
      .then((result) => addResource(result))
      .catch(console.error);
  }

  /**
   * Adds a Media resource to the timeline.
   * @param attachment - The media attachment.
   */
  function createMedia(attachment: Attachment): void {
    if (!resource || !props.createMedia) {
      // Encounter not loaded yet
      return;
    }
    medplum
      .createResource(props.createMedia(resource, sender, attachment))
      .then((result) => addResource(result))
      .then(() =>
        notify.update(String(uploadNotificationId.current), {
          color: 'green',
          title: 'Upload complete',
          message: '',
          autoClose: 2000,
        })
      )
      .catch((reason) =>
        notify.update(String(uploadNotificationId.current), {
          color: 'red',
          title: 'Upload error',
          message: normalizeErrorString(reason),
          autoClose: 2000,
        })
      );
  }

  function onUploadStart(): void {
    uploadNotificationId.current = notify.show({
      loading: true,
      title: 'Initializing upload...',
      message: 'Please wait...',
      autoClose: false,
    });
  }

  function onUploadProgress(e: ProgressEvent): void {
    notify.update(String(uploadNotificationId.current), {
      loading: true,
      title: 'Uploading...',
      message: getProgressMessage(e),
      autoClose: false,
    });
  }

  function onUploadError(outcome: OperationOutcome): void {
    notify.update(String(uploadNotificationId.current), {
      color: 'red',
      title: 'Upload error',
      message: normalizeErrorString(outcome),
      autoClose: 2000,
    });
  }

  if (!resource) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // TODO: Handle null history items for deleted versions.
  const itemsToShow = items.filter((item) => item).slice(0, countToShow);

  return (
    <Timeline>
      {props.createCommunication && (
        <Panel>
          <Form
            testid="timeline-form"
            onSubmit={(formData: Record<string, string>) => {
              createComment(formData.text);

              const input = inputRef.current;
              if (input) {
                input.value = '';
                input.focus();
              }
            }}
          >
            <div className="flex w-full flex-nowrap gap-2">
              <ResourceAvatar value={sender} />
              <Input name="text" ref={inputRef} placeholder="Add comment" className="w-full max-w-[300px]" />
              <Button type="submit" size="icon" className="rounded-full">
                <IconMessage size={16} />
              </Button>
              <AttachmentButton
                securityContext={createReference(resource)}
                onUpload={createMedia}
                onUploadStart={onUploadStart}
                onUploadProgress={onUploadProgress}
                onUploadError={onUploadError}
              >
                {(buttonProps) => (
                  <Button type="button" size="icon" className="rounded-full" {...buttonProps}>
                    <IconCloudUpload size={16} />
                  </Button>
                )}
              </AttachmentButton>
            </div>
          </Form>
        </Panel>
      )}
      {itemsToShow.map((item) => {
        const key = `${item.resourceType}/${item.id}/${item.meta?.versionId}`;
        const menu = props.getMenu
          ? props.getMenu({
              primaryResource: resource,
              currentResource: item,
              reloadTimeline: loadTimeline,
            })
          : undefined;
        if (item.resourceType === resource.resourceType && item.id === resource.id) {
          return <HistoryTimelineItem key={key} history={history as Bundle} resource={item} menu={menu} />;
        }
        switch (item.resourceType) {
          case 'AuditEvent':
            return <AuditEventTimelineItem key={key} resource={item} menu={menu} />;
          case 'Communication':
            return <CommunicationTimelineItem key={key} resource={item} menu={menu} />;
          case 'DiagnosticReport':
            return <DiagnosticReportTimelineItem key={key} resource={item} menu={menu} />;
          case 'Media':
            return <MediaTimelineItem key={key} resource={item} menu={menu} />;
          default:
            return (
              <TimelineItem key={key} resource={item} padding={true}>
                {menu ? <TimelineItemMenu>{menu}</TimelineItemMenu> : undefined}
                <ResourceTable value={item} ignoreMissingValues={true} />
              </TimelineItem>
            );
        }
      })}
      {countToShow < items.length && (
        <div className="flex justify-center pb-8">
          <Button onClick={() => setCountToShow(countToShow + 10)}>Show More</Button>
        </div>
      )}
    </Timeline>
  );
}

interface HistoryTimelineItemProps {
  readonly history: Bundle;
  readonly resource: Resource;
  readonly menu?: ReactNode;
}

function HistoryTimelineItem(props: HistoryTimelineItemProps): JSX.Element {
  const { history, resource, menu } = props;
  const previous = getPrevious(history, resource);
  if (previous) {
    return (
      <TimelineItem resource={resource} padding={true}>
        {menu ? <TimelineItemMenu>{menu}</TimelineItemMenu> : undefined}
        <ResourceDiffTable original={previous} revised={props.resource} />
      </TimelineItem>
    );
  } else {
    return (
      <TimelineItem resource={resource} padding={true}>
        {menu ? <TimelineItemMenu>{menu}</TimelineItemMenu> : undefined}
        <h3>Created</h3>
        <ResourceTable value={resource} ignoreMissingValues forceUseInput />
      </TimelineItem>
    );
  }
}

function getPrevious(history: Bundle, version: Resource): Resource | undefined {
  const entries = history.entry ?? [];
  const index = entries.findIndex((entry) => entry.resource?.meta?.versionId === version.meta?.versionId);
  // If not found index is -1, -1 === 0 - 1 so this returns undefined
  if (index >= entries.length - 1) {
    return undefined;
  }
  return entries[index + 1].resource;
}

function CommunicationTimelineItem(
  props: TimelineItemProps<Communication> & { readonly menu?: ReactNode }
): JSX.Element {
  const routine = !props.resource.priority || props.resource.priority === 'routine';
  const className = routine ? undefined : 'bg-blue-50 dark:bg-blue-950';
  return (
    <TimelineItem
      resource={props.resource}
      profile={props.resource.sender}
      dateTime={props.resource.sent}
      padding={true}
      className={className}
    >
      {props.menu ? <TimelineItemMenu>{props.menu}</TimelineItemMenu> : undefined}
      <p>{props.resource.payload?.[0]?.contentString}</p>
    </TimelineItem>
  );
}

function MediaTimelineItem(props: TimelineItemProps<Media> & { readonly menu?: ReactNode }): JSX.Element {
  const contentType = props.resource.content?.contentType;
  const padding =
    contentType &&
    !contentType.startsWith('image/') &&
    !contentType.startsWith('video/') &&
    contentType !== 'application/pdf';
  return (
    <TimelineItem resource={props.resource} padding={!!padding}>
      {props.menu ? <TimelineItemMenu>{props.menu}</TimelineItemMenu> : undefined}
      <AttachmentDisplay value={props.resource.content} />
    </TimelineItem>
  );
}

function AuditEventTimelineItem(props: TimelineItemProps<AuditEvent> & { readonly menu?: ReactNode }): JSX.Element {
  return (
    <TimelineItem resource={props.resource} padding={true}>
      {props.menu ? <TimelineItemMenu>{props.menu}</TimelineItemMenu> : undefined}
      <ScrollArea>
        <pre>{props.resource.outcomeDesc}</pre>
      </ScrollArea>
    </TimelineItem>
  );
}

function DiagnosticReportTimelineItem(
  props: TimelineItemProps<DiagnosticReport> & { readonly menu?: ReactNode }
): JSX.Element {
  return (
    <TimelineItem resource={props.resource} padding={true}>
      {props.menu ? <TimelineItemMenu>{props.menu}</TimelineItemMenu> : undefined}
      <DiagnosticReportDisplay value={props.resource} />
    </TimelineItem>
  );
}

function getProgressMessage(e: ProgressEvent): string {
  if (e.lengthComputable) {
    const percent = (100 * e.loaded) / e.total;
    return `Uploaded: ${formatFileSize(e.loaded)} / ${formatFileSize(e.total)} ${percent.toFixed(2)}%`;
  }
  return `Uploaded: ${formatFileSize(e.loaded)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0.00 B';
  }
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
}
