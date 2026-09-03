// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Pharmacies.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { getPreferredPharmaciesFromPatient } from '@/components/medplum/patient-summary/pharmacy-utils';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { Spinner } from '@/components/ui/spinner';
import type { LoadState } from '@/lib/medplum/load-state';
import { formatAddress, getReferenceString, OperationOutcomeError } from '@medplum/core';
import type { Organization, Patient } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import type { ComponentType, JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Base props that any pharmacy dialog component must accept.
 */
export interface PharmacyDialogBaseProps {
  readonly patient: Patient;
  readonly onSubmit: (pharmacy: Organization) => void;
  readonly onClose: () => void;
}

export interface PharmaciesProps {
  readonly patient: Patient;
  readonly pharmacies?: Organization[];
  readonly onClickResource?: (resource: Organization) => void;
  readonly pharmacyDialogComponent?: ComponentType<PharmacyDialogBaseProps>;
}

interface PharmacyWithPrimary extends Organization {
  isPrimary?: boolean;
}

export function Pharmacies(props: PharmaciesProps): JSX.Element {
  const { patient: patientProp, onClickResource, pharmacyDialogComponent } = props;
  const PharmacyDialogComponent = pharmacyDialogComponent;
  const medplum = useMedplum();
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const [resolvedPharmacies, setResolvedPharmacies] = useState<PharmacyWithPrimary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');

  // Use useResource to get the latest patient data (in case it's updated)
  const patient = useResource(patientProp);

  // Extract pharmacy references from Patient extensions
  const pharmacyRefs = useMemo(() => {
    if (!patient) {
      return [];
    }
    return getPreferredPharmaciesFromPatient(patient);
  }, [patient]);

  // Resolve Organization references
  useEffect(() => {
    let cancelled = false;

    const fetchPharmacies = async (): Promise<void> => {
      if (props.pharmacies) {
        // If pharmacies were provided as props, use them directly
        if (!cancelled) {
          setResolvedPharmacies(props.pharmacies);
          setLoadState('loaded');
        }
        return;
      }

      if (pharmacyRefs.length === 0) {
        if (!cancelled) {
          setResolvedPharmacies([]);
          setLoadState('loaded');
        }
        return;
      }

      setLoadState('loading');

      try {
        const results = await Promise.all(
          pharmacyRefs.map(async (pharmacyRef) => {
            try {
              const org = await medplum.readReference(pharmacyRef.organizationRef);
              return { ...org, isPrimary: pharmacyRef.isPrimary };
            } catch (error) {
              if (!isNotFoundError(error)) {
                // Error logged by Medplum error handler
              }
              return null;
            }
          })
        );
        if (!cancelled) {
          const validResults = results.filter((result): result is NonNullable<typeof result> => result !== null);
          setResolvedPharmacies(validResults);
          // If all references failed to resolve, show error state
          // If some resolved successfully, show loaded state with partial results
          setLoadState(validResults.length === 0 && pharmacyRefs.length > 0 ? 'error' : 'loaded');
        }
      } catch (_error) {
        // Promise.all error indicates a critical failure
        // Set error state to show failure message to user
        // The specific error is not critical since UI properly handles all error states
        if (!cancelled) {
          setLoadState('error');
        }
        // Note: Not re-throwing as error is already handled via UI state
      }
    };

    fetchPharmacies().catch(() => {
      // Error is handled in the component's error state
    });

    return () => {
      cancelled = true;
    };
  }, [medplum, pharmacyRefs, props.pharmacies]);

  const handleSubmit = useCallback(
    async (_pharmacy: Organization) => {
      // After adding a pharmacy, the patient extension is updated by the bot
      // Invalidate only the patient resource to trigger a refresh
      if (patient?.id) {
        medplum.invalidateUrl(getReferenceString(patient));
      }
      close();
    },
    [medplum, patient, close]
  );

  if (!patient) {
    return <></>;
  }

  const renderPharmacyList = (): JSX.Element => {
    if (loadState === 'loading') {
      return <Spinner />;
    }
    if (loadState === 'error') {
      return <p className="text-sm text-destructive">Failed to load pharmacies</p>;
    }
    if (resolvedPharmacies.length === 0) {
      return <p>(none)</p>;
    }
    return (
      <div>
        <div className="flex flex-col gap-2">
          {resolvedPharmacies.map((pharmacy, index) => (
            <SummaryItem key={pharmacy.id || index} onClick={() => onClickResource?.(pharmacy)}>
              <div>
                <p className="truncate overflow-hidden font-medium whitespace-nowrap">{pharmacy.name}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  {pharmacy.isPrimary && <StatusBadge status="primary" />}
                  {pharmacy.address?.[0] && (
                    <p className="text-xs text-muted-foreground">{formatAddress(pharmacy.address[0])}</p>
                  )}
                </div>
              </div>
            </SummaryItem>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <CollapsibleSection title="Pharmacies" onAdd={pharmacyDialogComponent ? open : undefined}>
        {renderPharmacyList()}
      </CollapsibleSection>
      {PharmacyDialogComponent ? (
        <Modal open={opened} onOpenChange={(next) => !next && close()} size="lg">
          <ModalHeader>
            <ModalTitle>Add Pharmacy</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <PharmacyDialogComponent patient={patient} onSubmit={handleSubmit} onClose={close} />
          </ModalBody>
        </Modal>
      ) : null}
    </>
  );
}

function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof OperationOutcomeError)) {
    return false;
  }

  return (
    error.outcome.issue?.some((issue: unknown) => (issue as Record<string, unknown>).code === 'not-found') ?? false
  );
}
