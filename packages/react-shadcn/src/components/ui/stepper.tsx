// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { cn } from '@/lib/utils';
import { IconCheck } from '@tabler/icons-react';
import { cva } from 'class-variance-authority';
import type { ComponentProps, JSX, ReactNode } from 'react';
import { Children, cloneElement, createContext, isValidElement, useContext } from 'react';

type StepState = 'completed' | 'active' | 'upcoming';

interface StepperContextValue {
  readonly active: number;
  readonly allowNextStepsSelect: boolean;
  readonly onStepClick?: (index: number) => void;
}

const StepperContext = createContext<StepperContextValue>({ active: 0, allowNextStepsSelect: true });

export interface StepperProps extends Omit<ComponentProps<'ol'>, 'children'> {
  readonly active: number;
  readonly onStepClick?: (index: number) => void;
  readonly allowNextStepsSelect?: boolean;
  readonly children: ReactNode;
}

export function Stepper({
  active,
  onStepClick,
  allowNextStepsSelect = true,
  className,
  children,
  ...props
}: StepperProps): JSX.Element {
  const stepCount = Children.count(children);
  return (
    <StepperContext.Provider value={{ active, allowNextStepsSelect, onStepClick }}>
      <ol data-slot="stepper" role="list" className={cn('flex items-start', className)} {...props}>
        {Children.map(children, (child, index) =>
          isValidElement<StepperStepProps>(child)
            ? cloneElement(child, { index, isLast: index === stepCount - 1 })
            : child
        )}
      </ol>
    </StepperContext.Provider>
  );
}

const stepIconVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
  {
    variants: {
      state: {
        completed: 'border-primary bg-primary text-primary-foreground',
        active: 'border-primary text-primary',
        upcoming: 'border-muted-foreground/30 text-muted-foreground',
      },
    },
    defaultVariants: { state: 'upcoming' },
  }
);

export interface StepperStepProps extends Omit<ComponentProps<'li'>, 'children'> {
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly index?: number;
  readonly isLast?: boolean;
}

export function StepperStep({
  label,
  description,
  index = 0,
  isLast = false,
  className,
  ...props
}: StepperStepProps): JSX.Element {
  const { active, allowNextStepsSelect, onStepClick } = useContext(StepperContext);
  const state: StepState = index < active ? 'completed' : index === active ? 'active' : 'upcoming';
  const clickable = !!onStepClick && (index <= active || allowNextStepsSelect);

  const content = (
    <>
      <span data-slot="stepper-step-icon" className={cn(stepIconVariants({ state }))}>
        {state === 'completed' ? <IconCheck size={16} /> : index + 1}
      </span>
      {(label || description) && (
        <span className="flex flex-col text-left">
          {label && (
            <span data-slot="stepper-step-label" className="text-sm font-medium">
              {label}
            </span>
          )}
          {description && (
            <span data-slot="stepper-step-description" className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      )}
    </>
  );

  return (
    <li
      data-slot="stepper-step"
      data-state={state}
      aria-current={state === 'active' ? 'step' : undefined}
      className={cn(
        'flex flex-1 items-center',
        !isLast && 'after:mx-2 after:h-px after:flex-1 after:bg-border',
        className
      )}
      {...props}
    >
      {clickable ? (
        <button type="button" onClick={() => onStepClick?.(index)} className="flex items-center gap-2">
          {content}
        </button>
      ) : (
        <div className="flex items-center gap-2">{content}</div>
      )}
    </li>
  );
}

export function StepperContent({ children }: { readonly children: ReactNode }): JSX.Element {
  return <div data-slot="stepper-content">{children}</div>;
}
