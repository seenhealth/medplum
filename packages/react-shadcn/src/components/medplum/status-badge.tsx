// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/StatusBadge/StatusBadge.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentProps, JSX } from 'react';

/*
 * Request status: https://hl7.org/fhir/valueset-request-status.html
 * draft, active, on-hold, revoked, completed, entered-in-error, unknown
 *
 * Publication status: https://hl7.org/fhir/valueset-publication-status.html
 * draft, active, retired, unknown
 *
 * Observation status: https://www.hl7.org/fhir/valueset-observation-status.html
 * registered, preliminary, final, amended,  corrected, cancelled, entered-in-error, unknown
 *
 * DiagnosticReport status: https://hl7.org/fhir/valueset-diagnostic-report-status.html
 * registered, preliminary, final, amended, corrected, appended, cancelled, entered-in-error, unknown
 *
 * Task status: https://hl7.org/fhir/valueset-task-status.html
 * draft, requested, received, accepted, rejected, ready, cancelled, in-progress, on-hold, failed, completed, entered-in-error
 *
 * Appointment status: https://www.hl7.org/fhir/valueset-appointmentstatus.html
 * proposed, pending, booked, arrived, fulfilled, cancelled, noshow, entered-in-error, chcked-in, waitlist
 *
 * Immunization status: https://hl7.org/fhir/r4/valueset-immunization-status.html
 * completed, entered-in-error, not-done
 */

const blue = 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
const yellow = 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
const red = 'border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200';
const green = 'border-transparent bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200';
const gray = 'border-transparent bg-muted text-muted-foreground';

const statusBadgeVariants = cva('', {
  variants: {
    status: {
      draft: blue,
      active: blue,
      'on-hold': yellow,
      revoked: red,
      completed: green,
      'entered-in-error': red,
      unknown: gray,
      retired: gray,
      registered: blue,
      preliminary: blue,
      final: green,
      amended: yellow,
      corrected: yellow,
      cancelled: red,
      requested: blue,
      received: blue,
      accepted: blue,
      rejected: red,
      ready: blue,
      'in-progress': blue,
      failed: red,
      proposed: blue,
      pending: blue,
      booked: blue,
      arrived: blue,
      fulfilled: green,
      noshow: red,
      'checked-in': blue,
      waitlist: gray,
      routine: gray,
      urgent: red,
      asap: red,
      stat: red,
      'not-done': red,
      connected: green,
      disconnected: red,
      finished: green,
      planned: gray,
    },
  },
});

export interface StatusBadgeProps extends Omit<ComponentProps<typeof Badge>, 'children'> {
  readonly status: string;
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element {
  const { status, className, ...badgeProps } = props;

  return (
    <Badge
      className={cn(
        statusBadgeVariants({ status: status as VariantProps<typeof statusBadgeVariants>['status'] }),
        className
      )}
      {...badgeProps}
    >
      {status.replaceAll('-', ' ')}
    </Badge>
  );
}
