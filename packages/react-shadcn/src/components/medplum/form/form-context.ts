// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Form/Form.context.ts for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { createContext, useContext } from 'react';

export const FormContext = createContext<{ submitting: boolean }>({
  submitting: false,
});
FormContext.displayName = 'FormContext';

export function useFormContext(): { submitting: boolean } {
  return useContext(FormContext);
}
