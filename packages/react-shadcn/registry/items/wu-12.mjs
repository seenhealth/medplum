// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  {
    name: 'attachment-display',
    title: 'AttachmentDisplay',
    description:
      'Render a FHIR Attachment (image, video, PDF, text, C-CDA) with a download link and retrying scanned images.',
    files: [
      'components/medplum/attachment-display/attachment-display.tsx',
      'components/medplum/attachment-display/scanned-image.tsx',
    ],
    upstream: 'AttachmentDisplay',
    categories: ['fhir', 'attachment', 'display'],
  },
  {
    name: 'attachment-array-display',
    title: 'AttachmentArrayDisplay',
    description: 'Render a list of FHIR Attachments, optionally as a DescriptionList entry.',
    files: ['components/medplum/attachment-array-display.tsx'],
    upstream: 'AttachmentArrayDisplay',
    categories: ['fhir', 'attachment', 'display'],
  },
  {
    name: 'attachment-button',
    title: 'AttachmentButton',
    description: 'Hidden file input that uploads via medplum.createAttachment and renders a custom trigger.',
    files: ['components/medplum/attachment-button.tsx'],
    upstream: 'AttachmentButton',
    categories: ['fhir', 'attachment', 'input'],
  },
  {
    name: 'attachment-input',
    title: 'AttachmentInput',
    description: 'Single FHIR Attachment upload/remove control.',
    files: ['components/medplum/attachment-input.tsx'],
    upstream: 'AttachmentInput',
    categories: ['fhir', 'attachment', 'input'],
  },
  {
    name: 'attachment-array-input',
    title: 'AttachmentArrayInput',
    description: 'Add and remove a list of FHIR Attachments.',
    files: ['components/medplum/attachment-array-input.tsx'],
    upstream: 'AttachmentArrayInput',
    categories: ['fhir', 'attachment', 'input'],
  },
  {
    name: 'signature-input',
    title: 'SignatureInput',
    description: 'Canvas signature pad that writes a FHIR Signature (base64 PNG).',
    files: ['components/medplum/signature-input.tsx'],
    upstream: 'SignatureInput',
    categories: ['fhir', 'input'],
  },
  {
    name: 'qr-code-scanner',
    title: 'QrCodeScanner',
    description: 'Camera QR scanner using getUserMedia and jsqr.',
    files: ['components/medplum/qr-code-scanner.tsx'],
    upstream: 'QrCodeScanner',
    categories: ['input'],
  },
  {
    name: 'ccda-display',
    title: 'CcdaDisplay',
    description: 'Embed the C-CDA viewer iframe and optionally validate the document.',
    files: ['components/medplum/ccda-display.tsx'],
    upstream: 'CcdaDisplay',
    categories: ['fhir', 'display'],
  },
];
