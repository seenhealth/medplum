// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  {
    name: 'address-input',
    title: 'AddressInput',
    description: 'Edit a FHIR Address (use, type, line, city, state, postalCode) with profile read-only fields.',
    files: ['components/medplum/address-input.tsx'],
    upstream: 'AddressInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'annotation-input',
    title: 'AnnotationInput',
    description: 'Edit a FHIR Annotation (text, author from the current profile, time).',
    files: ['components/medplum/annotation-input.tsx'],
    upstream: 'AnnotationInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'contact-detail-input',
    title: 'ContactDetailInput',
    description: 'Edit a FHIR ContactDetail (name plus a ContactPoint telecom).',
    files: ['components/medplum/contact-detail-input.tsx'],
    upstream: 'ContactDetailInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'contact-point-input',
    title: 'ContactPointInput',
    description: 'Edit a FHIR ContactPoint (system, use, value) with OperationOutcome error mapping.',
    files: ['components/medplum/contact-point-input.tsx'],
    upstream: 'ContactPointInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'identifier-input',
    title: 'IdentifierInput',
    description: 'Edit a FHIR Identifier (system, value) with OperationOutcome error mapping.',
    files: ['components/medplum/identifier-input.tsx'],
    upstream: 'IdentifierInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'money-input',
    title: 'MoneyInput',
    description: 'Edit a FHIR Money amount with a currency NativeSelect addon.',
    files: ['components/medplum/money-input.tsx'],
    upstream: 'MoneyInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'period-input',
    title: 'PeriodInput',
    description: 'Edit a FHIR Period as start and end DateTimeInput fields.',
    files: ['components/medplum/period-input.tsx'],
    upstream: 'PeriodInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'quantity-input',
    title: 'QuantityInput',
    description: 'Edit a FHIR Quantity (comparator, value, unit) with optional wheel disable.',
    files: ['components/medplum/quantity-input.tsx'],
    upstream: 'QuantityInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'range-input',
    title: 'RangeInput',
    description: 'Edit a FHIR Range as low and high QuantityInput fields.',
    files: ['components/medplum/range-input.tsx'],
    upstream: 'RangeInput',
    categories: ['fhir', 'input', 'datatype'],
  },
  {
    name: 'ratio-input',
    title: 'RatioInput',
    description: 'Edit a FHIR Ratio as numerator and denominator QuantityInput fields.',
    files: ['components/medplum/ratio-input.tsx'],
    upstream: 'RatioInput',
    categories: ['fhir', 'input', 'datatype'],
  },
];
