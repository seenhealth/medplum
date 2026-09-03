// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormStepper.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Button } from '@/components/ui/button';
import { Stepper, StepperContent, StepperStep } from '@/components/ui/stepper';
import type { QuestionnaireFormPaginationState } from '@medplum/react-hooks';
import type { JSX, ReactNode } from 'react';

export interface QuestionnaireFormStepperProps {
  readonly formState: QuestionnaireFormPaginationState;
  readonly submitButtonText?: string;
  readonly excludeButtons?: boolean;
  readonly children?: ReactNode;
}

export function QuestionnaireFormStepper(props: QuestionnaireFormStepperProps): JSX.Element {
  const { formState, submitButtonText, excludeButtons, children } = props;
  const pages = formState.pages;
  const activePage = formState.activePage;
  const showBackButton = activePage > 0;
  const showNextButton = activePage < pages.length - 1;
  const showSubmitButton = activePage === pages.length - 1;

  return (
    <>
      <Stepper active={activePage} allowNextStepsSelect={false} className="p-1.5">
        {pages.map((page) => (
          <StepperStep key={page.linkId} label={page.title} />
        ))}
      </Stepper>
      <StepperContent>{children}</StepperContent>
      {!excludeButtons && (
        <div className="mt-6 flex justify-end gap-2">
          {showBackButton && (
            <Button type="button" onClick={formState.onPrevPage}>
              Back
            </Button>
          )}
          {showNextButton && (
            <Button
              type="button"
              onClick={(e) => {
                const form = e.currentTarget.closest('form') as HTMLFormElement;
                if (form.reportValidity()) {
                  formState.onNextPage();
                }
              }}
            >
              Next
            </Button>
          )}
          {showSubmitButton && <SubmitButton>{submitButtonText ?? 'Submit'}</SubmitButton>}
        </div>
      )}
    </>
  );
}
