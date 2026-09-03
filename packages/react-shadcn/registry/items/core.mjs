// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
//
// Source of truth for the registry. `scripts/build-registry.mjs` turns this into the root registry.json,
// deriving `type` from the file location, `registryDependencies`/`dependencies` from the imports in each
// file, and `meta.storyIds` from the sibling *.stories.tsx.
//
// name        kebab-case, unique across the registry (and not one of shadcn's built-in item names)
// Each work unit adds registry/items/wu-XX.mjs exporting `items` with the same shape; registry/items.mjs aggregates.
// files       paths relative to packages/react-shadcn/src; the first file is the entry point
// upstream    directory under packages/react/src this item ports (drives parity, ledger, upstream-diff)
// categories  free-form tags

/** @typedef {{ name: string, title: string, description: string, files: string[], upstream?: string, categories?: string[] }} RegistryItemSpec */

/** @type {RegistryItemSpec[]} */
export const items = [
  // --- lib (pure TypeScript ported from packages/react/src/utils) ---
  {
    name: 'constants',
    title: 'Constants',
    description: 'Default ignored FHIR properties for schema-driven forms.',
    files: ['lib/medplum/constants.ts'],
    upstream: 'constants.ts',
    categories: ['lib'],
  },
  {
    name: 'outcomes',
    title: 'OperationOutcome helpers',
    description: 'Map OperationOutcome issues to form fields (getErrorsForInput, getIssuesForExpression).',
    files: ['lib/medplum/outcomes.ts'],
    upstream: 'utils/outcomes.ts',
    categories: ['lib', 'forms'],
  },
  {
    name: 'dom',
    title: 'DOM helpers',
    description: 'killEvent, isAuxClick, isCheckboxCell, sendCommand, exportJsonFile.',
    files: ['lib/medplum/dom.ts'],
    upstream: 'utils/dom.ts',
    categories: ['lib'],
  },
  {
    name: 'date',
    title: 'Date sorting helpers',
    description: 'compareByLastUpdatedDescending and sortByDateAndPriority for timelines.',
    files: ['lib/medplum/date.ts'],
    upstream: 'utils/date.ts',
    categories: ['lib'],
  },
  {
    name: 'diff',
    title: 'Resource diff',
    description: 'Line-level diff of two FHIR resources.',
    files: ['lib/medplum/diff.ts'],
    upstream: 'utils/diff.ts',
    categories: ['lib'],
  },
  {
    name: 'blame',
    title: 'Resource blame',
    description: 'Attribute each line of a resource to the history version that introduced it.',
    files: ['lib/medplum/blame.ts'],
    upstream: 'utils/blame.ts',
    categories: ['lib'],
  },
  {
    name: 'pagination-controls',
    title: 'Pagination control props',
    description: 'aria-labels for pagination controls (Next page, Previous page, First page, Last page).',
    files: ['lib/medplum/pagination-controls.ts'],
    upstream: 'utils/pagination.ts',
    categories: ['lib'],
  },
  {
    name: 'recaptcha',
    title: 'reCAPTCHA helpers',
    description: 'initRecaptcha and getRecaptcha for the auth forms.',
    files: ['lib/medplum/recaptcha.ts'],
    upstream: 'utils/recaptcha.ts',
    categories: ['lib', 'auth'],
  },
  {
    name: 'script',
    title: 'createScriptTag',
    description: 'Append a script tag to the document once.',
    files: ['lib/medplum/script.ts'],
    upstream: 'utils/script.ts',
    categories: ['lib'],
  },
  {
    name: 'app',
    title: 'App helpers',
    description: 'getAppName from MEDPLUM_APP_NAME.',
    files: ['lib/medplum/app.ts'],
    upstream: 'utils/app.ts',
    categories: ['lib'],
  },
  {
    name: 'load-state',
    title: 'LoadState type',
    description: 'Loading/loaded/error state discriminator.',
    files: ['lib/medplum/load-state.ts'],
    upstream: 'utils/loadState.ts',
    categories: ['lib'],
  },
  {
    name: 'maybe-wrap-with-context',
    title: 'maybeWrapWithContext',
    description: 'Wrap children in a context provider only when a value is present.',
    files: ['lib/medplum/maybe-wrap-with-context.tsx'],
    upstream: 'utils/maybeWrapWithContext.tsx',
    categories: ['lib'],
  },
  {
    name: 'maybe-wrap-with-tooltip',
    title: 'maybeWrapWithTooltip',
    description: 'Wrap an element in a Tooltip only when tooltip text is present; exports READ_ONLY_TOOLTIP_TEXT.',
    files: ['lib/medplum/maybe-wrap-with-tooltip.tsx'],
    upstream: 'utils/maybeWrapWithTooltip.tsx',
    categories: ['lib'],
  },

  {
    name: 'notify',
    title: 'notify',
    description: 'Toast helper over sonner covering fire-and-forget, persistent and update-by-id notifications.',
    files: ['lib/medplum/notify.ts'],
    categories: ['lib'],
  },

  // --- hooks replacing the @mantine/hooks the ports used ---
  {
    name: 'use-debounced-callback',
    title: 'useDebouncedCallback',
    description: 'Trailing-edge debounced callback with a stable identity.',
    files: ['hooks/medplum/use-debounced-callback.ts'],
    categories: ['hook'],
  },
  {
    name: 'use-local-storage',
    title: 'useLocalStorage',
    description: 'JSON-serialized localStorage state.',
    files: ['hooks/medplum/use-local-storage.ts'],
    categories: ['hook'],
  },
  {
    name: 'use-resize-observer',
    title: 'useResizeObserver',
    description: 'Element ref plus its observed content rect.',
    files: ['hooks/medplum/use-resize-observer.ts'],
    categories: ['hook'],
  },
  {
    name: 'use-clipboard',
    title: 'useClipboard',
    description: 'Copy text to the clipboard with a timed copied flag.',
    files: ['hooks/medplum/use-clipboard.ts'],
    categories: ['hook'],
  },

  // --- primitives shadcn does not ship ---
  {
    name: 'stepper',
    title: 'Stepper',
    description: 'Numbered step indicator (Stepper, StepperStep, StepperContent) used for paginated questionnaires.',
    files: ['components/ui/stepper.tsx'],
    categories: ['ui'],
  },
  {
    name: 'ring-progress',
    title: 'RingProgress',
    description: 'SVG ring chart with colored sections and a center label.',
    files: ['components/ui/ring-progress.tsx'],
    categories: ['ui'],
  },

  // --- schema-driven form engine seams ---
  {
    name: 'elements-input-utils',
    title: 'ElementsContext',
    description: 'React context carrying the FHIR schema elements for the form engine, plus getElementsToRender.',
    files: ['components/medplum/elements-input-utils.ts'],
    upstream: 'ElementsInput/ElementsInput.utils.ts',
    categories: ['forms'],
  },
  {
    name: 'resource-property-input-utils',
    title: 'Input prop contracts',
    description: 'BaseInputProps, ComplexTypeInputProps, PrimitiveTypeInputProps and getValuePath.',
    files: ['components/medplum/resource-property-input-utils.ts'],
    upstream: 'ResourcePropertyInput/ResourcePropertyInput.utils.ts',
    categories: ['forms'],
  },
  {
    name: 'form-section',
    title: 'FormSection',
    description:
      'Labeled form field wrapper with description, OperationOutcome error mapping and read-only tooltip (FormSection, FormSectionLabel, FormSectionDescription, FormSectionContent, FormSectionError).',
    files: ['components/medplum/form-section.tsx'],
    upstream: 'FormSection',
    categories: ['forms'],
  },
  {
    name: 'checkbox-form-section',
    title: 'CheckboxFormSection',
    description: 'FormSection laid out horizontally for a leading checkbox.',
    files: ['components/medplum/checkbox-form-section.tsx'],
    upstream: 'CheckboxFormSection',
    categories: ['forms'],
  },

  // --- layout ---
  {
    name: 'container',
    title: 'Container',
    description: 'Centered max-width page container.',
    files: ['components/medplum/container.tsx'],
    upstream: 'Container',
    categories: ['layout'],
  },
  {
    name: 'panel',
    title: 'Panel',
    description: 'Bordered card surface used by every Medplum page and story.',
    files: ['components/medplum/panel.tsx'],
    upstream: 'Panel',
    categories: ['layout'],
  },
  {
    name: 'document',
    title: 'Document',
    description: 'Container + Panel: the standard Medplum page body.',
    files: ['components/medplum/document.tsx'],
    upstream: 'Document',
    categories: ['layout'],
  },

  {
    name: 'modal',
    title: 'Modal',
    description:
      'Dialog with a scrolling body and pinned footer (Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter).',
    files: ['components/medplum/modal.tsx'],
    upstream: 'Modal',
    categories: ['layout'],
  },

  // --- FHIR datatype display / input ---
  {
    name: 'human-name-display',
    title: 'HumanNameDisplay',
    description: 'Render a FHIR HumanName with formatHumanName options.',
    files: ['components/medplum/human-name-display.tsx'],
    upstream: 'HumanNameDisplay',
    categories: ['fhir', 'display', 'datatype'],
  },
  {
    name: 'human-name-input',
    title: 'HumanNameInput',
    description: 'Edit a FHIR HumanName (use, prefix, given, family, suffix) with OperationOutcome error mapping.',
    files: ['components/medplum/human-name-input.tsx'],
    upstream: 'HumanNameInput',
    categories: ['fhir', 'input', 'datatype'],
  },
];
