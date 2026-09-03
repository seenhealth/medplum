// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientHeader/PatientHeader.utils.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { Patient } from '@medplum/fhirtypes';

export function getDefaultColor(patient: Patient): string | undefined {
  if (patient.gender === 'male') {
    return 'blue';
  }
  if (patient.gender === 'female') {
    return 'pink';
  }
  return undefined;
}
