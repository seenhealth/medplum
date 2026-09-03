// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Labs.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { DiagnosticReportDisplay } from '@/components/medplum/diagnostic-report-display';
import { Modal, ModalBody, ModalHeader, ModalTitle } from '@/components/medplum/modal';
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import SummaryItem from '@/components/medplum/patient-summary/summary-item';
import { StatusBadge } from '@/components/medplum/status-badge';
import { formatDate, getDisplayString } from '@medplum/core';
import type { CodeableConcept, DiagnosticReport, Patient, Resource, ServiceRequest } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useCallback, useState } from 'react';

export interface LabsProps {
  readonly patient: Patient;
  readonly serviceRequests: ServiceRequest[];
  readonly diagnosticReports: DiagnosticReport[];
  readonly onClickResource?: (resource: Resource) => void;
  readonly onRequestLabs?: () => void;
}

export function Labs(props: LabsProps): JSX.Element {
  const { serviceRequests, diagnosticReports, onClickResource, onRequestLabs } = props;
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | undefined>();
  const [reportDialogOpened, setReportDialogOpened] = useState(false);
  const openReportDialog = useCallback(() => setReportDialogOpened(true), []);
  const closeReportDialog = useCallback(() => setReportDialogOpened(false), []);

  // Get all Diagnostic Reports that are code LAB.
  // Build a set of all Service Requests that are based on these Diagnostic Reports.
  const diagnosticReportsRequests = new Set<string>();
  const filteredDiagnosticReports = diagnosticReports.filter((report) => {
    const flag = isLaboratoryReport(report);
    if (flag && report.basedOn) {
      report.basedOn.forEach((basedOn) => {
        if (basedOn.reference?.startsWith('ServiceRequest/')) {
          const [, id] = basedOn.reference.split('/');
          diagnosticReportsRequests.add(id);
        }
      });
    }
    return flag;
  });

  // Filter out Service Requests that are based on Diagnostic Reports.
  // Filter out multiple service requests with the same requisition number.
  const completedRequisitionNumbers = new Set<string>();
  const filteredServiceRequests = serviceRequests.filter((request) => {
    if (request.id && diagnosticReportsRequests.has(request.id)) {
      return false;
    }

    // If the ServiceRequest is also based on a parent ServiceRequest, skip it.
    if (request.basedOn) {
      const basedOn = request.basedOn.find((basedOn) => {
        if (basedOn.reference?.startsWith('ServiceRequest/')) {
          const [, id] = basedOn.reference.split('/');
          return diagnosticReportsRequests.has(id);
        }
        return false;
      });
      if (basedOn) {
        return false;
      }
    }

    const shouldFilter = shouldFilterRequest(request, completedRequisitionNumbers);
    if (!shouldFilter && request.requisition?.value) {
      completedRequisitionNumbers.add(request.requisition?.value);
    }
    return !shouldFilter;
  });

  const handleDiagnosticReportClick = (report: DiagnosticReport): void => {
    setSelectedReport(report);
    openReportDialog();
  };

  return (
    <>
      <CollapsibleSection title="Labs" onAdd={() => onRequestLabs?.()}>
        <div className="flex flex-col gap-2">
          {filteredServiceRequests.map((serviceRequest) => (
            <SummaryItem key={serviceRequest.id} onClick={() => onClickResource?.(serviceRequest)}>
              <div>
                <p className="truncate overflow-hidden font-medium whitespace-nowrap">
                  {getDisplayString(serviceRequest)}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  {serviceRequest.status && <StatusBadge status={serviceRequest.status} />}
                  <p className="text-xs font-medium text-muted-foreground">{formatDate(serviceRequest.authoredOn)}</p>
                </div>
              </div>
            </SummaryItem>
          ))}

          {filteredDiagnosticReports.map((report) => (
            <SummaryItem key={report.id} onClick={() => handleDiagnosticReportClick(report)}>
              <div>
                <p className="truncate overflow-hidden font-medium whitespace-nowrap">{getDisplayString(report)}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  {report.status && <StatusBadge status={report.status} />}
                  <p className="text-xs font-medium text-muted-foreground">{formatDate(report.issued)}</p>
                </div>
              </div>
            </SummaryItem>
          ))}

          {filteredServiceRequests.length === 0 && filteredDiagnosticReports.length === 0 && <p>(none)</p>}
        </div>
      </CollapsibleSection>
      <Modal open={reportDialogOpened} onOpenChange={(next) => !next && closeReportDialog()} className="sm:max-w-[80%]">
        <ModalHeader>
          <ModalTitle>Lab Results</ModalTitle>
        </ModalHeader>
        <ModalBody>{selectedReport && <DiagnosticReportDisplay value={selectedReport} hideSubject={true} />}</ModalBody>
      </Modal>
    </>
  );
}

function hasLaboratoryCategory(category: CodeableConcept): boolean {
  if (!category.coding || !Array.isArray(category.coding)) {
    return false;
  }

  for (const coding of category.coding) {
    if (coding.code === 'LAB') {
      return true;
    }
  }

  return false;
}

function isLaboratoryReport(report: DiagnosticReport): boolean {
  if (!report.category || !Array.isArray(report.category)) {
    return false;
  }
  for (const category of report.category) {
    if (hasLaboratoryCategory(category)) {
      return true;
    }
  }

  return false;
}

function shouldFilterRequest(request: ServiceRequest, completedRequisitionNumbers: Set<string>): boolean {
  if (['completed', 'draft', 'entered-in-error'].includes(request.status)) {
    return true;
  }

  const requisitionNumber = request.requisition?.value;
  if (requisitionNumber && completedRequisitionNumbers.has(requisitionNumber)) {
    return true;
  }

  return false;
}
