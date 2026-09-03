// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/constants.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
export const DEFAULT_IGNORED_PROPERTIES = ['meta', 'implicitRules', 'contained', 'extension', 'modifierExtension'];

// Ignored only when they are top-level properties
// e.g. Patient.language is ignored, but Patient.communication.language is not ignored
export const DEFAULT_IGNORED_NON_NESTED_PROPERTIES = ['language', 'text'];
