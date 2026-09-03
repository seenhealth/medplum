// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientAccountsForm/PatientAccountsForm.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { ReferenceInput } from '@/components/medplum/reference-input';
import { ResourceBadge } from '@/components/medplum/resource-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { notify } from '@/lib/medplum/notify';
import { extractAccountReferences, normalizeErrorString } from '@medplum/core';
import type { Patient, Reference, ResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import { IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useCallback, useMemo, useState } from 'react';

export interface PatientAccountsFormProps {
  readonly patient: Patient;
  readonly onSaved?: () => void;
}

const NOTIFICATION_ID = 'patient-accounts';
const NOTIFICATION_TITLE = 'Patient Accounts';
const ACCOUNT_TARGET_TYPES: ResourceType[] = ['Organization', 'HealthcareService', 'CareTeam'];

interface AccountChange {
  readonly reference: Reference;
  readonly type: 'addition' | 'removal';
}

export function PatientAccountsForm(props: PatientAccountsFormProps): JSX.Element {
  const { patient } = props;
  const medplum = useMedplum();
  const isAdmin = medplum.isProjectAdmin() || medplum.isSuperAdmin();

  const originalAccounts = useMemo<Reference[]>(() => extractAccountReferences(patient.meta) ?? [], [patient.meta]);

  const [pendingAccounts, setPendingAccounts] = useState(originalAccounts);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [propagate, setPropagate] = useState(true);
  const [saving, setSaving] = useState(false);

  const changes = useMemo<AccountChange[]>(() => {
    const result: AccountChange[] = [];

    // Find additions (in pending but not in original)
    for (const account of pendingAccounts) {
      if (!originalAccounts.some((o) => o.reference === account.reference)) {
        result.push({ reference: account, type: 'addition' });
      }
    }

    // Find removals (in original but not in pending)
    for (const account of originalAccounts) {
      if (!pendingAccounts.some((p) => p.reference === account.reference)) {
        result.push({ reference: account, type: 'removal' });
      }
    }

    return result;
  }, [originalAccounts, pendingAccounts]);

  const hasChanges = changes.length > 0;

  const handleAddAccount = useCallback(
    (value: Reference | undefined) => {
      if (!value?.reference) {
        return;
      }
      // Don't add duplicates
      if (pendingAccounts.some((a) => a.reference === value.reference)) {
        return;
      }
      setPendingAccounts((prev) => [...prev, value]);
    },
    [pendingAccounts]
  );

  const handleRemoveAccount = useCallback((referenceString: string) => {
    setPendingAccounts((prev) => prev.filter((a) => a.reference !== referenceString));
  }, []);

  const handleSave = useCallback(async () => {
    const patientId = patient.id;
    if (!patientId) {
      notify.show({
        id: NOTIFICATION_ID,
        title: NOTIFICATION_TITLE,
        color: 'red',
        message: 'Cannot update accounts: Patient resource has no ID.',
        autoClose: false,
      });
      return;
    }

    setSaving(true);
    setConfirmModalOpen(false);

    const url = medplum.fhirUrl('Patient', patientId, '$set-accounts');

    const parameters = {
      resourceType: 'Parameters' as const,
      parameter: [
        ...pendingAccounts.map((account) => ({
          name: 'accounts' as const,
          valueReference: { reference: account.reference },
        })),
        { name: 'propagate' as const, valueBoolean: propagate },
      ],
    };

    notify.show({
      id: NOTIFICATION_ID,
      title: NOTIFICATION_TITLE,
      loading: true,
      message: propagate ? 'Saving account changes and propagating to compartment...' : 'Saving account changes...',
      autoClose: false,
    });

    try {
      const headers: Record<string, string> = {};
      if (propagate) {
        headers['Prefer'] = 'respond-async';
      }
      await medplum.post(url, parameters, undefined, { headers });

      // Invalidate the cached Patient so useResource re-fetches with updated meta.accounts
      medplum.invalidateUrl(medplum.fhirUrl('Patient', patientId));

      notify.update(NOTIFICATION_ID, {
        title: NOTIFICATION_TITLE,
        color: 'green',
        message: propagate ? 'Account changes saved. Compartment updates are being applied.' : 'Account changes saved.',
        loading: false,
      });

      props.onSaved?.();
    } catch (err) {
      notify.update(NOTIFICATION_ID, {
        title: NOTIFICATION_TITLE,
        color: 'red',
        message: normalizeErrorString(err),
        loading: false,
        autoClose: false,
      });
    } finally {
      setSaving(false);
    }
  }, [medplum, patient, pendingAccounts, propagate, props]);

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTitle>Admin access required</AlertTitle>
        <AlertDescription>You need project admin access to manage patient account assignments.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Current Accounts</h3>
        {pendingAccounts.length === 0 ? (
          <p className="text-muted-foreground">No accounts assigned to this patient.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAccounts.map((account) => (
                <TableRow key={account.reference}>
                  <TableCell>
                    <AccountTypeBadge reference={account} />
                  </TableCell>
                  <TableCell>
                    <ResourceBadge value={account} link />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      aria-label={`Remove ${account.reference}`}
                      onClick={() => handleRemoveAccount(account.reference as string)}
                    >
                      <IconX size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Separator />

        <h4 className="text-base font-semibold">Add Account</h4>
        <ReferenceInput
          name="newAccount"
          placeholder="Search for Organization, HealthcareService, or CareTeam..."
          targetTypes={ACCOUNT_TARGET_TYPES}
          onChange={(value) => {
            if (value) {
              handleAddAccount(value);
            }
          }}
        />

        {hasChanges && (
          <>
            <Separator />
            <h4 className="text-base font-semibold">Pending Changes</h4>
            <div className="flex flex-col gap-2">
              {changes.map((change) => (
                <div key={`${change.type}-${change.reference.reference}`} className="flex items-center gap-2">
                  {change.type === 'addition' ? (
                    <Badge className="border-transparent bg-green-100 text-green-800">
                      <IconPlus size={12} />
                      Add
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <IconMinus size={12} />
                      Remove
                    </Badge>
                  )}
                  <ResourceBadge value={change.reference} link />
                </div>
              ))}
            </div>
          </>
        )}

        <div>
          <Button disabled={!hasChanges || saving} onClick={() => setConfirmModalOpen(true)}>
            Save Changes
          </Button>
        </div>
      </div>

      <Modal open={confirmModalOpen} onOpenChange={setConfirmModalOpen} size="md">
        <ModalHeader>
          <ModalTitle>Confirm Account Changes</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p>
              The following changes will be applied to Patient{' '}
              <strong>
                {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
              </strong>
              :
            </p>

            {changes.filter((c) => c.type === 'addition').length > 0 && (
              <div>
                <p className="font-semibold text-green-600">Adding:</p>
                <div className="mt-2 flex flex-col gap-2">
                  {changes
                    .filter((c) => c.type === 'addition')
                    .map((c) => (
                      <div key={c.reference.reference} className="flex items-center gap-2">
                        <IconPlus size={14} className="text-green-600" />
                        <ResourceBadge value={c.reference} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {changes.filter((c) => c.type === 'removal').length > 0 && (
              <div>
                <p className="font-semibold text-red-600">Removing:</p>
                <div className="mt-2 flex flex-col gap-2">
                  {changes
                    .filter((c) => c.type === 'removal')
                    .map((c) => (
                      <div key={c.reference.reference} className="flex items-center gap-2">
                        <IconMinus size={14} className="text-red-600" />
                        <ResourceBadge value={c.reference} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Field orientation="horizontal">
              <Checkbox
                id="propagate"
                checked={propagate}
                onCheckedChange={(checked) => setPropagate(checked === true)}
              />
              <FieldLabel htmlFor="propagate">
                Propagate changes to all resources in this patient's compartment
              </FieldLabel>
            </Field>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Spinner />}
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function AccountTypeBadge({ reference }: { readonly reference: Reference }): JSX.Element {
  const type = reference.reference?.split('/')[0] ?? 'Unknown';
  const colorMap: Record<string, string> = {
    Organization: 'border-transparent bg-blue-100 text-blue-800',
    HealthcareService: 'border-transparent bg-teal-100 text-teal-800',
    CareTeam: 'border-transparent bg-violet-100 text-violet-800',
  };
  return (
    <Badge variant="secondary" className={colorMap[type] ?? 'border-transparent bg-muted text-muted-foreground'}>
      {type}
    </Badge>
  );
}
