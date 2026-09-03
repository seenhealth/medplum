// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PeriodInput/PeriodInput.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { PeriodInput } from '@/components/medplum/period-input';
import { act, fireEvent, render, screen } from '@/test/render';
import type { Period } from '@medplum/fhirtypes';

const startDateTime = '2021-01-01T00:00:00.000Z';
const endDateTime = '2021-01-02T00:00:00.000Z';

describe('PeriodInput', () => {
  test('Renders undefined value', () => {
    render(<PeriodInput path="" name="a" />);
    expect(screen.getByPlaceholderText('Start')).toBeDefined();
    expect(screen.getByPlaceholderText('End')).toBeDefined();
  });

  test('Renders', () => {
    render(<PeriodInput path="" name="a" defaultValue={{ start: startDateTime, end: endDateTime }} />);
    expect(screen.getByPlaceholderText('Start')).toBeDefined();
    expect(screen.getByPlaceholderText('End')).toBeDefined();
  });

  test('Set value', async () => {
    render(<PeriodInput path="" name="a" />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Start'), {
        target: { value: startDateTime },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('End'), {
        target: { value: endDateTime },
      });
    });

    expect(screen.getByDisplayValue(startDateTime)).toBeInTheDocument();
    expect(screen.getByDisplayValue(endDateTime)).toBeInTheDocument();
  });

  test('Change event', async () => {
    let lastValue: Period | undefined = undefined;

    render(<PeriodInput path="" name="a" onChange={(value) => (lastValue = value)} />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Start'), {
        target: { value: startDateTime },
      });
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('End'), {
        target: { value: endDateTime },
      });
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({ start: startDateTime, end: endDateTime });
  });
});
