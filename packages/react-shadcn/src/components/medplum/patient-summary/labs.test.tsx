// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/Labs.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Labs } from '@/components/medplum/patient-summary/labs';
import { act, fireEvent, render, screen } from '@/test/render';
import type { DiagnosticReport, ServiceRequest } from '@medplum/fhirtypes';
import { HomerServiceRequest, HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import type { ReactNode } from 'react';

const medplum = new MockClient();

describe('PatientSummary - Labs', () => {
  async function setup(children: ReactNode): Promise<void> {
    await act(async () => {
      render(<MedplumProvider medplum={medplum}>{children}</MedplumProvider>);
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  test('Renders empty', async () => {
    await setup(<Labs patient={HomerSimpson} serviceRequests={[]} diagnosticReports={[]} />);
    expect(screen.getByText('Labs')).toBeInTheDocument();
  });

  test('Renders ServiceRequest', async () => {
    const mockOnClickResource = vi.fn();
    await setup(
      <Labs
        patient={HomerSimpson}
        serviceRequests={[HomerServiceRequest]}
        diagnosticReports={[]}
        onClickResource={mockOnClickResource}
      />
    );
    expect(screen.getByText('active')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('SERVICE_REQUEST_CODE'));
    });
    expect(mockOnClickResource).toHaveBeenCalled();
  });

  test('Renders DiagnosticReport', async () => {
    const reports: DiagnosticReport[] = [
      {
        resourceType: 'DiagnosticReport',
        id: 'report1',
        status: 'final',
        code: { text: 'Test Report' },
        category: [{ coding: [{ code: 'LAB' }] }],
      },
    ];

    await setup(<Labs patient={HomerSimpson} serviceRequests={[]} diagnosticReports={reports} />);
    expect(screen.getByText('final')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('Test Report'));
    });

    expect(await screen.findByText('Lab Results')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Report')).toBeInTheDocument();
  });

  test('Renders only first ServiceRequest when multiple have same requisition number', async () => {
    const requests: ServiceRequest[] = [
      {
        resourceType: 'ServiceRequest',
        id: 'sr1',
        status: 'active',
        code: { text: 'Test Request Active 1' },
        requisition: {
          value: '123456',
        },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
      {
        resourceType: 'ServiceRequest',
        id: 'sr2',
        status: 'active',
        code: { text: 'Test Request Active 2' },
        requisition: {
          value: '123456',
        },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
      {
        resourceType: 'ServiceRequest',
        id: 'sr3',
        status: 'active',
        code: { text: 'Test Request Active 3' },
        requisition: {
          value: '123456',
        },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
    ];

    await setup(<Labs patient={HomerSimpson} serviceRequests={requests} diagnosticReports={[]} />);

    expect(screen.getByText('Test Request Active 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Request Active 2')).not.toBeInTheDocument();
  });

  test('Skips ServiceRequest when DiagnosticReport is present', async () => {
    const requests: ServiceRequest[] = [
      {
        id: '1',
        resourceType: 'ServiceRequest',
        status: 'active',
        code: { text: 'Test Request Active' },
        requisition: {
          value: '123456',
        },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
    ];

    const reports: DiagnosticReport[] = [
      {
        resourceType: 'DiagnosticReport',
        id: 'report1',
        status: 'final',
        code: { text: 'Test Report Final' },
        category: [{ coding: [{ code: 'LAB' }] }],
        basedOn: [{ reference: 'ServiceRequest/1' }],
      },
    ];

    await setup(<Labs patient={HomerSimpson} serviceRequests={requests} diagnosticReports={reports} />);
    expect(screen.queryByText('Test Request Active')).not.toBeInTheDocument();
    expect(screen.getByText('Test Report Final')).toBeInTheDocument();
  });

  test('HG skip child ServiceRequest when parent DiagnosticReport is present', async () => {
    const requests: ServiceRequest[] = [
      {
        id: '1',
        resourceType: 'ServiceRequest',
        status: 'active',
        code: { text: 'Test Request Parent' },
        requisition: {
          value: '123456',
        },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
      {
        id: '2',
        resourceType: 'ServiceRequest',
        status: 'active',
        code: { text: 'Test Request Child' },
        requisition: {
          value: '123456',
        },
        basedOn: [{ reference: 'ServiceRequest/1' }],
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
    ];

    const reports: DiagnosticReport[] = [
      {
        resourceType: 'DiagnosticReport',
        id: 'report1',
        status: 'final',
        code: { text: 'Test Report Final' },
        category: [{ coding: [{ code: 'LAB' }] }],
        basedOn: [{ reference: 'ServiceRequest/1' }],
      },
    ];

    await setup(<Labs patient={HomerSimpson} serviceRequests={requests} diagnosticReports={reports} />);
    expect(screen.queryByText('Test Request Parent')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Request Child')).not.toBeInTheDocument();
    expect(screen.getByText('Test Report Final')).toBeInTheDocument();
  });

  test('Status Badge colors', async () => {
    const requests: ServiceRequest[] = [
      {
        resourceType: 'ServiceRequest',
        id: 'sr1',
        status: 'active',
        code: { text: 'Test Request Active' },
        intent: 'order',
        subject: {
          reference: 'Patient/123',
        },
      },
    ];

    const reports: DiagnosticReport[] = [
      {
        resourceType: 'DiagnosticReport',
        id: 'report1',
        status: 'final',
        code: { text: 'Test Report Final' },
        category: [{ coding: [{ code: 'LAB' }] }],
      },
      {
        resourceType: 'DiagnosticReport',
        id: 'report2',
        status: 'cancelled',
        code: { text: 'Test Report Cancelled' },
        category: [{ coding: [{ code: 'LAB' }] }],
      },
      {
        resourceType: 'DiagnosticReport',
        id: 'report3',
        status: 'preliminary',
        code: { text: 'Test Report Preliminary' },
        category: [{ coding: [{ code: 'LAB' }] }],
      },
    ];
    await setup(<Labs patient={HomerSimpson} serviceRequests={requests} diagnosticReports={reports} />);

    const activeBadge = screen.getByText('active').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(activeBadge).toBeInTheDocument();

    const cancelledBadge = screen.getByText('cancelled').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(cancelledBadge).toBeInTheDocument();

    const preliminaryBadge = screen.getByText('preliminary').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(preliminaryBadge).toBeInTheDocument();

    const finalBadge = screen.getByText('final').closest('[data-slot="badge"]');
    // @ts-expect-error Mantine CSS custom property
    expect(finalBadge).toBeInTheDocument();
  });
});
