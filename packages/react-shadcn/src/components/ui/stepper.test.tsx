// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Stepper, StepperStep } from '@/components/ui/stepper';
import { render, screen } from '@/test/render';
import userEvent from '@testing-library/user-event';

describe('Stepper', () => {
  test('marks completed, active and upcoming states with aria-current on the active step', () => {
    render(
      <Stepper active={1}>
        <StepperStep label="Step 1" />
        <StepperStep label="Step 2" />
        <StepperStep label="Step 3" />
      </Stepper>
    );

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);

    expect(steps[0]).toHaveAttribute('data-state', 'completed');
    expect(steps[0]).not.toHaveAttribute('aria-current');
    expect(steps[0].querySelector('svg')).not.toBeNull();

    expect(steps[1]).toHaveAttribute('data-state', 'active');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');

    expect(steps[2]).toHaveAttribute('data-state', 'upcoming');
    expect(steps[2]).not.toHaveAttribute('aria-current');
  });

  test('clicking a reachable step invokes onStepClick, but an unreachable step is not clickable', async () => {
    const onStepClick = vi.fn();
    render(
      <Stepper active={1} onStepClick={onStepClick} allowNextStepsSelect={false}>
        <StepperStep label="Step 1" />
        <StepperStep label="Step 2" />
        <StepperStep label="Step 3" />
      </Stepper>
    );

    const completedButton = screen.getByText('Step 1').closest('button');
    expect(completedButton).not.toBeNull();
    await userEvent.click(completedButton as HTMLButtonElement);
    expect(onStepClick).toHaveBeenCalledWith(0);

    expect(screen.getByText('Step 3').closest('button')).toBeNull();
  });

  test('allowNextStepsSelect makes future steps clickable', async () => {
    const onStepClick = vi.fn();
    render(
      <Stepper active={0} onStepClick={onStepClick} allowNextStepsSelect>
        <StepperStep label="Step 1" />
        <StepperStep label="Step 2" />
      </Stepper>
    );

    const nextButton = screen.getByText('Step 2').closest('button');
    expect(nextButton).not.toBeNull();
    await userEvent.click(nextButton as HTMLButtonElement);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  test('without onStepClick, no step renders as a button', () => {
    render(
      <Stepper active={0}>
        <StepperStep label="Step 1" />
        <StepperStep label="Step 2" />
      </Stepper>
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
