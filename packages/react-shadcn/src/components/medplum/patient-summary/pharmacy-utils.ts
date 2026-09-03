// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/pharmacy-utils.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)

// Re-export generic pharmacy utilities from @medplum/core
export {
  PATIENT_PREFERRED_PHARMACY_URL,
  PHARMACY_PREFERENCE_TYPE_SYSTEM,
  PHARMACY_TYPE_PREFERRED,
  PHARMACY_TYPE_PRIMARY,
  addPreferredPharmacyToPatient,
  createPreferredPharmacyExtension,
  getPreferredPharmaciesFromPatient,
  isAddPharmacyResponse,
  isOrganizationArray,
  removePreferredPharmacyFromPatient,
} from '@medplum/core';
export type { AddFavoriteParams, AddPharmacyResponse, PharmacySearchParams, PreferredPharmacy } from '@medplum/core';
