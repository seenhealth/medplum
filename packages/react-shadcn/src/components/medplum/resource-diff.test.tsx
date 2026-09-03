// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ResourceDiff/ResourceDiff.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ResourceDiff } from '@/components/medplum/resource-diff';
import { render, screen } from '@/test/render';
import type { Patient } from '@medplum/fhirtypes';

describe('ResourceDiff', () => {
  test('Renders', () => {
    const original: Patient = {
      resourceType: 'Patient',
      birthDate: '1990-01-01',
      active: false,
    };

    const revised: Patient = {
      resourceType: 'Patient',
      birthDate: '1990-01-01',
      active: true,
    };

    render(<ResourceDiff original={original} revised={revised} />);

    const removed = screen.getByText('"active": false');
    expect(removed).toBeDefined();
    expect(removed).toHaveClass('removed');

    const added = screen.getByText('"active": true');
    expect(added).toBeDefined();
    expect(added).toHaveClass('added');
  });

  test('Handles empty original', () => {
    const original = {} as Patient;

    const revised: Patient = {
      resourceType: 'Patient',
      id: '123',
    };

    render(<ResourceDiff original={original} revised={revised} />);

    const added = screen.getByText(/"resourceType": "Patient",\s+"id": "123"/, { exact: false });
    expect(added).toBeDefined();
    expect(added).toHaveClass('added');
  });

  test('Handles empty revised', () => {
    const original: Patient = {
      resourceType: 'Patient',
      id: '123',
    };

    const revised = {} as Patient;

    render(<ResourceDiff original={original} revised={revised} />);

    const removed = screen.getByText(/"resourceType": "Patient",\s+"id": "123"/, { exact: false });
    expect(removed).toBeDefined();
    expect(removed).toHaveClass('removed');
  });
});
