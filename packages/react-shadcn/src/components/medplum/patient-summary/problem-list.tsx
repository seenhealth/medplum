// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/ProblemList.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { ConditionDialog } from '@/components/medplum/patient-summary/condition-dialog';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate, getDisplayString } from '@medplum/core';
import type { Condition, Encounter, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';

export interface ProblemListProps {
  readonly patient: Patient;
  readonly encounter?: Encounter;
  readonly problems: Condition[];
  readonly onClickResource?: (resource: Condition) => void;
}

function getCodeKey(condition: Condition): string | undefined {
  const coding = condition.code?.coding?.[0];
  if (coding?.system && coding?.code) {
    return `${coding.system}|${coding.code}`;
  }
  if (coding?.code) {
    return coding.code;
  }
  return condition.code?.text ?? condition.id;
}

export function ProblemList(props: ProblemListProps): JSX.Element {
  const medplum = useMedplum();
  const { patient, encounter } = props;
  const [problems, setProblems] = useState(
    props.problems.filter((c) => c.verificationStatus?.coding?.[0]?.code !== 'entered-in-error')
  );
  const [editCondition, setEditCondition] = useState<Condition>();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  const groupedProblems = useMemo(() => {
    const groups = new Map<string, Condition[]>();
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const key = getCodeKey(problem) ?? `ungrouped-${i}`;
      const existing = groups.get(key);
      if (existing) {
        existing.push(problem);
      } else {
        groups.set(key, [problem]);
      }
    }
    return Array.from(groups.entries());
  }, [problems]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (condition: Condition) => {
      if (condition.id) {
        const updatedCondition = await medplum.updateResource(condition);
        setProblems(problems.map((p) => (p.id === updatedCondition.id ? updatedCondition : p)));
      } else {
        const newCondition = await medplum.createResource(condition);
        setProblems([newCondition, ...problems]);
      }
      setEditCondition(undefined);
      close();
    },
    [medplum, problems, close]
  );

  return (
    <>
      <CollapsibleSection
        title="Problems"
        onAdd={() => {
          setEditCondition(undefined);
          open();
        }}
      >
        {problems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {groupedProblems.map(([key, group], groupIndex) => {
              const isExpanded = expandedGroups.has(key);
              const displayProblems = isExpanded ? group : [group[0]];
              const groupContentId = `problem-group-content-${groupIndex}`;
              return (
                <div key={key}>
                  <div className="flex flex-col gap-1" id={groupContentId}>
                    {displayProblems.map((problem) => (
                      <SummaryItem
                        key={problem.id}
                        onClick={() => {
                          setEditCondition(problem);
                          open();
                        }}
                      >
                        <div>
                          <div className="flex flex-nowrap items-center gap-1.5">
                            <p className="truncate overflow-hidden font-medium whitespace-nowrap">
                              {getDisplayString(problem)}
                            </p>
                            {!isExpanded && group.length > 1 && (
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                +{group.length - 1}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1">
                            {problem.clinicalStatus?.coding?.[0]?.code && (
                              <StatusBadge
                                data-testid="status-badge"
                                status={problem.clinicalStatus?.coding?.[0]?.code}
                              />
                            )}
                            <p className="text-xs font-medium text-muted-foreground">
                              {formatDate(problem.onsetDateTime)}
                            </p>
                          </div>
                        </div>
                      </SummaryItem>
                    ))}
                  </div>
                  {group.length > 1 && (
                    <button
                      type="button"
                      onClick={() => toggleGroup(key)}
                      aria-expanded={isExpanded}
                      aria-controls={groupContentId}
                      className="pt-0.5 pl-1 text-xs text-muted-foreground"
                    >
                      {isExpanded ? 'Show less' : `Show all ${group.length} entries`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>(none)</p>
        )}
      </CollapsibleSection>
      <Modal open={opened} onOpenChange={(next) => !next && close()}>
        <ModalHeader>
          <ModalTitle>{editCondition ? 'Edit Problem' : 'Add Problem'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ConditionDialog patient={patient} encounter={encounter} condition={editCondition} onSubmit={handleSubmit} />
        </ModalBody>
      </Modal>
    </>
  );
}
