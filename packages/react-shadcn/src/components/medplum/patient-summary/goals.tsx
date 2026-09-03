// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Goals.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { GoalDialog } from '@/components/medplum/patient-summary/goal-dialog';
import { isEnteredInError } from '@/components/medplum/patient-summary/patient-summary-utils';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { formatCodeableConcept, formatDate } from '@medplum/core';
import type { Goal, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface GoalsProps {
  readonly patient: Patient;
  readonly goals: Goal[];
}

export function Goals(props: GoalsProps): JSX.Element {
  const medplum = useMedplum();
  const { patient } = props;
  const [goals, setGoals] = useState(props.goals);
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [editGoal, setEditGoal] = useState<Goal>();

  const handleSubmit = useCallback(
    async (goal: Goal) => {
      if (goal.id) {
        const updated = await medplum.updateResource(goal);
        setGoals(goals.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await medplum.createResource(goal);
        setGoals([created, ...goals]);
      }
      setEditGoal(undefined);
      close();
    },
    [medplum, goals, close]
  );

  // Hide entered-in-error goals (still reachable by direct URL).
  const visibleGoals = goals.filter((goal) => !isEnteredInError(goal));

  const handleDelete = useCallback(async () => {
    if (!editGoal?.id) {
      return;
    }
    await medplum.deleteResource('Goal', editGoal.id);
    setGoals(goals.filter((g) => g.id !== editGoal.id));
    setEditGoal(undefined);
    close();
  }, [medplum, goals, editGoal, close]);

  return (
    <>
      <CollapsibleSection
        title="Goals"
        onAdd={() => {
          setEditGoal(undefined);
          open();
        }}
      >
        {visibleGoals.length > 0 ? (
          <div className="flex flex-col gap-2">
            {visibleGoals.map((goal) => (
              <SummaryItem
                key={goal.id}
                onClick={() => {
                  setEditGoal(goal);
                  open();
                }}
              >
                <div>
                  <p className="truncate overflow-hidden font-medium whitespace-nowrap">{getGoalDisplay(goal)}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {goal.lifecycleStatus && <StatusBadge status={goal.lifecycleStatus} />}
                    {getGoalDateText(goal) && (
                      <p className="text-xs font-medium text-muted-foreground">{getGoalDateText(goal)}</p>
                    )}
                  </div>
                </div>
              </SummaryItem>
            ))}
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      {/* Mounted only while open so every open is a fresh instance, with no leftover form state. */}
      {opened && (
        <GoalDialog
          patient={patient}
          goal={editGoal}
          opened={opened}
          onClose={close}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function getGoalDisplay(goal: Goal): string {
  return (goal.description && formatCodeableConcept(goal.description)) || 'Goal';
}

function getGoalDateText(goal: Goal): string | undefined {
  const dueDate = goal.target?.find((target) => target.dueDate)?.dueDate;
  if (dueDate) {
    return `Target ${formatDate(dueDate)}`;
  }
  return goal.startDate ? `Started ${formatDate(goal.startDate)}` : undefined;
}
