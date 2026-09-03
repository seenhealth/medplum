// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  {
    name: 'address-display',
    title: 'AddressDisplay',
    description: 'Render a FHIR Address with formatAddress options.',
    files: ['components/medplum/address-display.tsx'],
    upstream: 'AddressDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'codeable-concept-display',
    title: 'CodeableConceptDisplay',
    description: 'Render a FHIR CodeableConcept via formatCodeableConcept.',
    files: ['components/medplum/codeable-concept-display.tsx'],
    upstream: 'CodeableConceptDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'coding-display',
    title: 'CodingDisplay',
    description: 'Render a FHIR Coding via formatCoding, optionally including the code.',
    files: ['components/medplum/coding-display.tsx'],
    upstream: 'CodingDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'contact-detail-display',
    title: 'ContactDetailDisplay',
    description: 'Render a FHIR ContactDetail name and telecom ContactPointDisplays.',
    files: ['components/medplum/contact-detail-display.tsx'],
    upstream: 'ContactDetailDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'contact-point-display',
    title: 'ContactPointDisplay',
    description: 'Render a FHIR ContactPoint value with optional use and system.',
    files: ['components/medplum/contact-point-display.tsx'],
    upstream: 'ContactPointDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'identifier-display',
    title: 'IdentifierDisplay',
    description: 'Render a FHIR Identifier system and value.',
    files: ['components/medplum/identifier-display.tsx'],
    upstream: 'IdentifierDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'money-display',
    title: 'MoneyDisplay',
    description: 'Render a FHIR Money amount via formatMoney.',
    files: ['components/medplum/money-display.tsx'],
    upstream: 'MoneyDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'quantity-display',
    title: 'QuantityDisplay',
    description: 'Render a FHIR Quantity via formatQuantity, with optional precision.',
    files: ['components/medplum/quantity-display.tsx'],
    upstream: 'QuantityDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'range-display',
    title: 'RangeDisplay',
    description: 'Render a FHIR Range via formatRange, with optional precision and exclusive bounds.',
    files: ['components/medplum/range-display.tsx'],
    upstream: 'RangeDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'ratio-display',
    title: 'RatioDisplay',
    description: 'Render a FHIR Ratio as numerator / denominator QuantityDisplays.',
    files: ['components/medplum/ratio-display.tsx'],
    upstream: 'RatioDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'reference-display',
    title: 'ReferenceDisplay',
    description: 'Render a FHIR Reference as text or a MedplumLink.',
    files: ['components/medplum/reference-display.tsx'],
    upstream: 'ReferenceDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
];
