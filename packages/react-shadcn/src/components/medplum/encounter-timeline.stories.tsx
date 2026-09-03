// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/EncounterTimeline/EncounterTimeline.stories.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { EncounterTimeline } from '@/components/medplum/encounter-timeline';
import { HomerEncounter } from '@medplum/mock';
import type { Meta } from '@storybook/react';
import type { JSX } from 'react';

export default {
  title: 'Medplum/EncounterTimeline',
  component: EncounterTimeline,
} as Meta;

export const Encounter = (): JSX.Element => <EncounterTimeline encounter={HomerEncounter} />;
