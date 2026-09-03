// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/GoalDialog.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeInput } from '@/components/medplum/code-input';
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createReference } from '@medplum/core';
import type { Goal, Patient } from '@medplum/fhirtypes';
import { IconTrash } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface GoalDialogProps {
  readonly patient: Patient;
  readonly goal?: Goal;
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (goal: Goal) => void;
  /** When editing an existing goal, called to delete it. */
  readonly onDelete?: () => void;
}

const GOAL_STATUS_VALUESET = 'http://hl7.org/fhir/ValueSet/goal-status';

export function GoalDialog(props: GoalDialogProps): JSX.Element {
  const { patient, goal, opened, onClose, onSubmit, onDelete } = props;
  const [lifecycleStatus, setLifecycleStatus] = useState<Goal['lifecycleStatus']>(goal?.lifecycleStatus ?? 'active');

  const handleSubmit = useCallback(
    (formData: Record<string, string>) => {
      onSubmit({
        ...goal,
        resourceType: 'Goal',
        lifecycleStatus: lifecycleStatus ?? 'active',
        description: { text: formData.description ?? goal?.description?.text ?? '' },
        subject: createReference(patient),
        startDate: formData.startDate || undefined,
        target: formData.dueDate ? [{ ...goal?.target?.[0], dueDate: formData.dueDate }] : goal?.target,
      });
    },
    [patient, goal, lifecycleStatus, onSubmit]
  );

  return (
    <Modal open={opened} onOpenChange={(next) => !next && onClose()} size="md">
      <ModalHeader>
        <ModalTitle>{goal ? 'Edit Goal' : 'Add Goal'}</ModalTitle>
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <FormSection htmlFor="description">
              <FormSectionLabel required>Goal</FormSectionLabel>
              <Input
                id="description"
                name="description"
                data-autofocus={true}
                required
                defaultValue={goal?.description?.text}
              />
            </FormSection>
            <CodeInput
              name="lifecycleStatus"
              label="Status"
              binding={GOAL_STATUS_VALUESET}
              maxValues={1}
              defaultValue={goal?.lifecycleStatus ?? 'active'}
              onChange={(value) => setLifecycleStatus((value as Goal['lifecycleStatus']) ?? undefined)}
            />
            <FormSection htmlFor="startDate">
              <FormSectionLabel>Start Date</FormSectionLabel>
              <Input id="startDate" type="date" name="startDate" defaultValue={goal?.startDate} />
            </FormSection>
            <FormSection htmlFor="dueDate">
              <FormSectionLabel>Target Date</FormSectionLabel>
              <Input id="dueDate" type="date" name="dueDate" defaultValue={goal?.target?.[0]?.dueDate} />
            </FormSection>
          </div>
        </ModalBody>
        <ModalFooter>
          <SubmitButton>Save</SubmitButton>
          {goal?.id && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              <IconTrash size={16} />
              Delete
            </Button>
          )}
        </ModalFooter>
      </Form>
    </Modal>
  );
}
