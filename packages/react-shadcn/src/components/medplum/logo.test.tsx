// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Logo/Logo.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Logo } from '@/components/medplum/logo';
import { render, screen } from '@/test/render';

describe('Logo', () => {
  test('Renders', () => {
    render(<Logo size={100} />);
    expect(screen.getByTitle('Medplum Logo')).toBeDefined();
  });

  test('Renders with overrideUrl', async () => {
    (import.meta.env as any).MEDPLUM_LOGO_URL = 'https://example.com/custom-logo.png';

    vi.resetModules();
    const { Logo: LogoWithOverride } = await import('@/components/medplum/logo');

    render(<LogoWithOverride size={100} />);
    const img = screen.getByAltText('Logo');
    expect(img).toBeDefined();
    expect(img).toHaveAttribute('src', 'https://example.com/custom-logo.png');
    expect(img).toHaveStyle({ maxHeight: '100px' });
  });
});
