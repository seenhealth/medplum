// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/OperationOutcomeAlert/OperationOutcomeAlert.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isOk, operationOutcomeIssueToString } from '@medplum/core';
import type { OperationOutcome, OperationOutcomeIssue } from '@medplum/fhirtypes';
import { IconAlertCircle } from '@tabler/icons-react';
import type { ComponentProps, JSX, ReactNode } from 'react';

export interface OperationOutcomeAlertProps extends Omit<ComponentProps<typeof Alert>, 'title'> {
  readonly outcome?: OperationOutcome;
  readonly issues?: OperationOutcomeIssue[];
  readonly displayOkOutcomes?: boolean;
  readonly title?: ReactNode;
}

export function OperationOutcomeAlert(props: OperationOutcomeAlertProps): JSX.Element | null {
  const { outcome, issues: issuesProp, displayOkOutcomes, title, ...spacingProps } = props;

  const issues = outcome?.issue || issuesProp;
  if (!issues || issues.length === 0) {
    return null;
  }

  if (outcome && isOk(outcome) && !displayOkOutcomes) {
    return null;
  }

  return (
    <Alert variant="destructive" {...spacingProps}>
      <IconAlertCircle />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>
        {issues.map((issue) => (
          <div data-testid="text-field-error" key={issue.details?.text}>
            {operationOutcomeIssueToString(issue)}
          </div>
        ))}
      </AlertDescription>
    </Alert>
  );
}
