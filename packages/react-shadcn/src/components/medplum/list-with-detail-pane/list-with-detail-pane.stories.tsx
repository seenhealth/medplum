// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ListWithDetailPane/ListWithDetailPane.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ListWithDetailPane } from '@/components/medplum/list-with-detail-pane/list-with-detail-pane';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { WithId } from '@medplum/core';
import type { Communication } from '@medplum/fhirtypes';
import type { Meta } from '@storybook/react';
import { IconPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState } from 'react';

export default {
  title: 'Medplum/ListWithDetailPane',
  component: ListWithDetailPane,
} as Meta;

const sampleItems: WithId<Communication>[] = [
  {
    resourceType: 'Communication',
    id: 'comm-1',
    status: 'in-progress',
    topic: { text: 'Lab results follow-up' },
    payload: [{ contentString: 'Please review the latest lab results.' }],
  },
  {
    resourceType: 'Communication',
    id: 'comm-2',
    status: 'in-progress',
    topic: { text: 'Medication refill request' },
    payload: [{ contentString: 'Refill request for lisinopril 10mg.' }],
  },
  {
    resourceType: 'Communication',
    id: 'comm-3',
    status: 'completed',
    topic: { text: 'Appointment reschedule' },
    payload: [{ contentString: 'Patient asked to move the visit to next week.' }],
  },
];

const tabs = [
  { value: 'in-progress', label: 'In Progress', uri: '/in-progress' },
  { value: 'completed', label: 'Completed', uri: '/completed' },
];

// The component fills its container, so the stories just give it a fixed height
// (no Document/Panel wrapper, which would add card padding around it).
function Frame(props: { readonly children: JSX.Element }): JSX.Element {
  return <div style={{ height: 600 }}>{props.children}</div>;
}

function ItemRow(props: { readonly item: Communication }): JSX.Element {
  return (
    <div className="p-3">
      <p className="truncate font-medium">{props.item.topic?.text}</p>
      <p className="truncate text-sm text-muted-foreground">{props.item.payload?.[0]?.contentString}</p>
    </div>
  );
}

function DetailPanel(props: { readonly item: Communication }): JSX.Element {
  return (
    <div className="min-w-0 flex-1 rounded-md bg-card p-8">
      <p className="text-lg font-extrabold">{props.item.topic?.text}</p>
      <p className="mt-4">{props.item.payload?.[0]?.contentString}</p>
    </div>
  );
}

export const Basic = (): JSX.Element => {
  const tabs = [
    { value: 'in-progress', label: 'In Progress', uri: '/in-progress' },
    { value: 'completed', label: 'Completed', uri: '/completed' },
  ];

  const headerActions = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon-sm" className="rounded-full" aria-label="New item">
          <IconPlus size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">New item</TooltipContent>
    </Tooltip>
  );

  const [selectedId, setSelectedId] = useState<string | undefined>('comm-1');
  const [page, setPage] = useState(1);

  const selected = sampleItems.find((item) => item.id === selectedId);

  return (
    <Frame>
      <ListWithDetailPane<WithId<Communication>>
        items={sampleItems}
        loading={false}
        selectedKey={selectedId}
        selected={selected}
        refresh={async () => {}}
        tabs={tabs}
        activeTab="in-progress"
        headerActions={headerActions}
        renderItem={(item) => (
          <div onClick={() => setSelectedId(item.id)} onKeyDown={() => {}} role="presentation">
            <ItemRow item={item} />
          </div>
        )}
        renderDetail={(item) => <DetailPanel item={item} />}
        page={page}
        pageCount={3}
        onPageChange={setPage}
      />
    </Frame>
  );
};

export const Loading = (): JSX.Element => {
  return (
    <Frame>
      <ListWithDetailPane<WithId<Communication>>
        items={[]}
        loading={true}
        selected={undefined}
        refresh={async () => {}}
        tabs={tabs}
        activeTab="in-progress"
        renderItem={(item) => <ItemRow item={item} />}
        renderDetail={(item) => <DetailPanel item={item} />}
      />
    </Frame>
  );
};

export const Empty = (): JSX.Element => {
  return (
    <Frame>
      <ListWithDetailPane<WithId<Communication>>
        items={[]}
        loading={false}
        selected={undefined}
        refresh={async () => {}}
        renderItem={(item) => <ItemRow item={item} />}
        renderDetail={(item) => <DetailPanel item={item} />}
      />
    </Frame>
  );
};
