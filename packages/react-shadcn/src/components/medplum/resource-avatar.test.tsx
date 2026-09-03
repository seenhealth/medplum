// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceAvatar/ResourceAvatar.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { ResourceAvatarProps } from '@/components/medplum/resource-avatar';
import { ResourceAvatar } from '@/components/medplum/resource-avatar';
import { getInitials } from '@/components/medplum/resource-avatar-utils';
import { act, render, screen } from '@/test/render';
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';

const medplum = new MockClient();

describe('ResourceAvatar', () => {
  async function setup(args: ResourceAvatarProps): Promise<void> {
    await act(async () => {
      render(
        <MedplumProvider medplum={medplum}>
          <ResourceAvatar {...args} />
        </MedplumProvider>
      );
    });
  }

  test('Avatar renders image', async () => {
    await setup({ src: 'https://example.com/profile.jpg', alt: 'Profile' });
    expect(screen.getByAltText<HTMLImageElement>('Profile').src).toEqual('https://example.com/profile.jpg');
  });

  test('Avatar renders system', async () => {
    await setup({ value: { reference: 'system' } });
    expect(screen.getByTitle('System')).toBeDefined();
  });

  test('Avatar renders initials', async () => {
    await setup({ alt: 'Homer Simpson' });
    expect(screen.getByTitle('Homer Simpson')).toBeDefined();
  });

  test('Avatar renders resource directly', async () => {
    await setup({
      value: HomerSimpson,
    });

    expect(await screen.findByAltText('Homer Simpson')).toBeInTheDocument();
  });

  test('Avatar renders resource directly as link', async () => {
    await setup({
      value: HomerSimpson,
      link: true,
    });

    expect(await screen.findByAltText('Homer Simpson')).toBeInTheDocument();
  });

  test('Avatar renders after loading the resource', async () => {
    await setup({
      value: createReference(HomerSimpson),
    });

    expect(await screen.findByAltText('Homer Simpson')).toBeInTheDocument();
  });

  test('getInitials', () => {
    expect(getInitials('Homer Simpson')).toEqual('HS');
    expect(getInitials('Homer')).toEqual('H');
    expect(getInitials('Homer J Simpson')).toEqual('HS');
    expect(getInitials('')).toEqual('');
  });
});
