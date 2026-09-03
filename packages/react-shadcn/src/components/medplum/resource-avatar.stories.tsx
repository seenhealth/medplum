// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceAvatar/ResourceAvatar.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Document } from '@/components/medplum/document';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { HomerSimpson } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/ResourceAvatar',
  component: ResourceAvatar,
} as Meta;

export const Image = (): JSX.Element => (
  <Document>
    <div className="flex w-[168px] justify-between">
      <ResourceAvatar alt="George Washington" src="./avatars/1.jpg" />
      <ResourceAvatar alt="Mona Lisa" src="./avatars/2.jpg" />
      <ResourceAvatar alt="Elmo" src="./avatars/3.jpg" />
    </div>
  </Document>
);

export const Letter = (): JSX.Element => (
  <Document>
    <div className="flex w-[168px] justify-between">
      <ResourceAvatar alt="George Washington" />
      <ResourceAvatar alt="Mona Lisa" className="bg-blue-100 text-blue-800" />
      <ResourceAvatar alt="Elmo" className="bg-violet-100 text-violet-800" />
    </div>
  </Document>
);

export const Sizes = (): JSX.Element => (
  <Document>
    <div className="flex w-[168px] justify-between">
      <ResourceAvatar alt="Mona Lisa" src="/avatars/2.jpg" className="size-6" />
      <ResourceAvatar alt="Mona Lisa" src="/avatars/2.jpg" />
      <ResourceAvatar alt="Mona Lisa" src="/avatars/2.jpg" className="size-10" />
    </div>
  </Document>
);

export const LetterSizes = (): JSX.Element => (
  <Document>
    <div className="flex w-[168px] justify-between">
      <ResourceAvatar alt="George Washington" className="size-6" />
      <ResourceAvatar alt="George Washington" className="bg-blue-100 text-blue-800" />
      <ResourceAvatar alt="George Washington" className="size-10 bg-violet-100 text-violet-800" />
    </div>
  </Document>
);

export const Resource = (): JSX.Element => (
  <Document>
    <ResourceAvatar value={HomerSimpson} />
  </Document>
);

export const WithText = (): JSX.Element => (
  <Document>
    <a href="#" className="text-primary underline-offset-4 hover:underline">
      <div className="flex w-[180px] justify-between">
        <ResourceAvatar alt="George Washington" src="/avatars/1.jpg" />
        George Washington
      </div>
    </a>
    <hr />
    <a href="#" className="text-primary underline-offset-4 hover:underline">
      <div className="flex w-[180px] justify-between">
        <ResourceAvatar alt="George Washington" src="/avatars/1.jpg" />
        George Washington
        <br />
        View profile
      </div>
    </a>
  </Document>
);
