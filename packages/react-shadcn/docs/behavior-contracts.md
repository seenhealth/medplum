# @medplum/react → shadcn/ui: Behavior Contracts & Migration Notes

Source of truth: `packages/react/src` at `medplum/medplum@8d589869f` (upstream main, @medplum/react 5.1.36).
Mechanical inventory: `appendix-a-component-inventory.md` — 128 directories, 29,318 source LOC,
36,160 test LOC, 108 story files, 154 test files, 44 CSS modules.

All line numbers below were read from the worktree during this pass. LOC figures are `wc -l` on the
non-test, non-story file unless stated otherwise.

**Global conclusion up front.** The Mantine coupling in this library is much shallower than the import
counts suggest. Roughly 80% of `@mantine/core` usage is `Group`/`Stack`/`Box`/`Flex`/`Text`/`Title`
layout, which maps to Tailwind flex utilities with no behavior at stake. The load-bearing surfaces are
exactly six:

1. `AsyncAutocomplete` — `Combobox` + `useCombobox` + `PillsInput` (keyboard, dropdown store, pills).
2. `AppShell` — `AppShell`/`AppShell.Header`/`AppShell.Navbar` layout config + `@mantine/spotlight`.
3. `SearchControl` — `Menu` focus management per column, `Pagination`, `Table`.
4. `QuestionnaireForm` — `Stepper` for pagination (visual + `active` index only; the state is in the hook).
5. `Modal` (and every dialog built on it) — Mantine `Modal` portal/focus-trap/scroll-lock.
6. `@mantine/notifications` — 20 call sites across 14 files (§C.4).

Everything else is `cva` + `cn()` restyling of components whose logic is already framework-free.

---

## Table of contents

- [Group 1 — Schema-driven form engine](#group-1)
- [Group 2 — Questionnaire engine](#group-2)
- [Group 3 — Search table](#group-3)
- [Group 4 — AppShell and layout leaves](#group-4)
- [Group 5 — PatientSummary](#group-5)
- [Group 6 — Chat](#group-6)
- [Group 7 — Timelines](#group-7)
- [Group 8 — Autocomplete family](#group-8)
- [Group 9 — Date/time](#group-9)
- [Group 10 — Auth and the long tail](#group-10)
- [Cross-cutting concerns](#cross-cutting)

---

<a name="group-1"></a>

## Group 1 — Schema-driven form engine

`ResourceForm/` · `BackboneElementInput/` · `ElementsInput/` · `ResourcePropertyInput/` ·
`ResourceArrayInput/` · `SliceInput/` · `ResourcePropertyDisplay/` (+ `FormSection/`,
`CheckboxFormSection/`, `Form/`, `utils/outcomes.ts`)

### 1.0 How the engine works

The engine is a recursive descent over FHIR schema metadata from `@medplum/core`. Nothing in it is
Mantine-aware except the leaf widgets and two layout wrappers.

```
ResourceForm                     loads schema/profile, owns the resource value
  └── BackboneElementInput       resolves a type name → typeSchema, builds ElementsContext
        └── ElementsInput        iterates elements, wraps each in FormSection
              └── ResourcePropertyInput   dispatches on FHIR type
                    ├── ElementDefinitionInputSelector   (polymorphic value[x])
                    ├── ResourceArrayInput               (max > 1)
                    │     └── SliceInput → ElementDefinitionTypeInput
                    └── ElementDefinitionTypeInput        (single type → leaf widget)
                          └── BackboneElementInput        (recursion for complex types)
```

**Schema drive.** `BackboneElementInput` (`BackboneElementInput/BackboneElementInput.tsx:36`) calls
`tryGetDataType(props.typeName, profileUrl)`; if it returns nothing the component renders
`<div>{type}&nbsp;not implemented</div>` (line 54). On success it calls `buildElementsContext({
parentContext, elements: typeSchema.elements, path, profileUrl: typeSchema.url, accessPolicyResource })`
(lines 43–49) and provides the result through `ElementsContext`
(`ElementsInput/ElementsInput.utils.ts:8`).

**`ElementsContext` shape** (`ElementsInput/ElementsInput.utils.ts:8-19`, type from `@medplum/core`):
`path`, `profileUrl`, `elements` (`Record<string, ExtendedInternalSchemaElement>`), `elementsByPath`,
`getExtendedProps(path) => { readonly, hidden }`, `accessPolicyResource`, `debugMode`,
`isDefaultContext`.

**Element filtering.** `getElementsToRender()` (`ElementsInput.utils.ts:27-63`) drops: elements with no
`type`, `max === 0`, fixed `Extension.url`, `extension`/`modifierExtension` without
`slicing.slices`, `IGNORED_PROPERTIES` (`id` + `DEFAULT_IGNORED_PROPERTIES`),
`DEFAULT_IGNORED_NON_NESTED_PROPERTIES` at depth 2, and any key containing `.` (profile-flattened
nested elements handled by their parent).

**Value/onChange flow.** Each level holds its own `useState` seeded from `defaultValue` and calls the
parent's `onChange`. In `ElementsInput` (`ElementsInput.tsx:53-56`) the child's `onChange(newValue,
propName)` becomes
`setValueWrapper(setPropertyValue({ ...value }, key, propName ?? key, element, newValue))`.
`setPropertyValue` (`ResourceForm/ResourceForm.utils.ts:7`) deletes every sibling `value[x]` variant
before assigning, which is what makes polymorphic switching correct. Values are never controlled from
above after mount — `BackboneElementInput` freezes the default with
`useState(() => props.defaultValue ?? {})` (line 33). Callers that need to replace the value must
remount (the AI questionnaire form does exactly this, §2.6).

**Path vs valuePath.** `BaseInputProps` (`ResourcePropertyInput/ResourcePropertyInput.utils.ts:5-12`):
`path` is the schema path (`Patient.identifier.system`), `valuePath` is the instance FHIRPath
(`Patient.identifier[0].system`), `outcome` is the last `OperationOutcome`. `ElementsInput` extends
`valuePath` only when the parent supplied one (line 45).

**Error mapping.** `getErrorsForInput(outcome, expression)` (`utils/outcomes.ts:5-13`) filters
`outcome.issue` by `isExpressionMatch(issue.expression[0], expression)` and joins `details.text` with
newlines. `isExpressionMatch` (lines 22-47) strips `[\d+]` from both sides when only one is indexed,
then accepts an exact match or a match after dropping one leading `resourceType.` segment. This
index-tolerance is the subtle part and must port verbatim; `utils/outcomes.test.ts` (59 LOC) pins it.

**Profiles.** `ResourceForm` (`ResourceForm.tsx:43-59`): when `profileUrl` is set it calls
`medplum.requestProfileSchema(profileUrl, { expandProfile: true })`, then `tryGetProfile(profileUrl)`,
then `applyDefaultValuesToResource(defaultValue, profile)`. Without a profile it calls
`medplum.requestSchema(resourceType)` and uses the value as-is. Profile mode is what activates slicing
in `ResourceArrayInput`.

**disabled / readonly semantics.** Three distinct mechanisms:

- `ExtendedInternalSchemaElement.readonly` — computed by `buildElementsContext` from
  `accessPolicyResource.readonlyFields`. Read in `ResourcePropertyInput` at lines 69 (`disabled=`),
  108 and 162 (`readOnly=`), and in `ResourceArrayInput` at lines 76, 118, 132 (suppresses
  add/remove buttons and shows `(empty)`).
- `hidden` — `getExtendedProps().hidden`; hidden fields never reach `getElementsToRender`.
- Visual affordance — `FormSection`/`CheckboxFormSection` take `readonly?: boolean` and wrap the label
  with `maybeWrapWithTooltip(READ_ONLY_TOOLTIP_TEXT, …)` (`utils/maybeWrapWithTooltip.tsx:8`, uses
  `Tooltip.Floating`).
- `canWrite` — `ResourceForm.tsx:76-95` short-circuits the whole form to a red `Alert` when
  `canWriteResourceType(accessPolicy, resourceType)` is false and the user is not super admin.

### 1.1 Public props

| Interface                          | File:line                                                 |
| ---------------------------------- | --------------------------------------------------------- |
| `BaseInputProps`                   | `ResourcePropertyInput/ResourcePropertyInput.utils.ts:5`  |
| `ComplexTypeInputProps<ValueType>` | `ResourcePropertyInput/ResourcePropertyInput.utils.ts:14` |
| `PrimitiveTypeInputProps`          | `ResourcePropertyInput/ResourcePropertyInput.utils.ts:21` |
| `ResourcePropertyInputProps`       | `ResourcePropertyInput/ResourcePropertyInput.tsx:45`      |
| `ElementDefinitionSelectorProps`   | `ResourcePropertyInput/ResourcePropertyInput.tsx:114`     |
| `ElementDefinitionTypeInputProps`  | `ResourcePropertyInput/ResourcePropertyInput.tsx:169`     |
| `ResourcePropertyDisplayProps`     | `ResourcePropertyDisplay/ResourcePropertyDisplay.tsx:37`  |
| `ElementsInputProps`               | `ElementsInput/ElementsInput.tsx:16`                      |
| `BackboneElementInputProps`        | `BackboneElementInput/BackboneElementInput.tsx:16`        |
| `ResourceArrayInputProps`          | `ResourceArrayInput/ResourceArrayInput.tsx:20`            |
| `SliceInputProps`                  | `SliceInput/SliceInput.tsx:18`                            |
| `ResourceFormProps`                | `ResourceForm/ResourceForm.tsx:22`                        |
| `FormProps`                        | `Form/Form.tsx:8`                                         |
| `FormSectionProps`                 | `FormSection/FormSection.tsx:13`                          |
| `CheckboxFormSectionProps`         | `CheckboxFormSection/CheckboxFormSection.tsx:10`          |

```ts
// ResourcePropertyInput/ResourcePropertyInput.utils.ts:5
export interface BaseInputProps {
  readonly path: string;
  readonly valuePath?: string;
  readonly outcome?: OperationOutcome;
}
export interface ComplexTypeInputProps<ValueType> extends BaseInputProps {
  readonly name: string;
  readonly defaultValue?: ValueType;
  readonly onChange?: (value: ValueType, propName?: string) => void;
  readonly disabled?: boolean;
}

// ResourceForm/ResourceForm.tsx:22
export interface ResourceFormProps {
  readonly defaultValue: Partial<Resource> | Reference;
  readonly outcome?: OperationOutcome;
  readonly onSubmit: (resource: Resource) => void;
  readonly onPatch?: (resource: Resource) => void;
  readonly onDelete?: (resource: Resource) => void;
  readonly profileUrl?: string; // takes priority over schemaName
}
```

`ComplexTypeInputProps` is the contract every complex-type leaf (`AddressInput`, `HumanNameInput`,
`CodeableConceptInput`, `PeriodInput`, `TimingInput`, …) implements. It is Mantine-free and should be
preserved byte-for-byte — it is the seam that keeps the port to leaf-by-leaf restyling.

### 1.2 Behavior contract

- **`ResourceForm`**: `useResource(props.defaultValue)` resolves a `Reference`; two `useEffect`
  branches load schema (§1.0); renders `<div>Loading...</div>` until `schemaLoaded && value`. Renders
  disabled `resourceType` and `id` `TextInput`s in `FormSection`s, then `BackboneElementInput`, then a
  submit button. When `onPatch` or `onDelete` is passed, the submit button gains
  `classes.splitButton` and a Mantine `Menu` with an `ActionIcon` trigger
  (`aria-label="More actions"`) offering Patch and Delete items (`ResourceForm.tsx:132-170`).
  Native `<form noValidate autoComplete="off">` with `e.preventDefault()`.
- **`ResourceArrayInput`**: `useEffect` calls `prepareSlices({ medplum, property })` then
  `assignValuesIntoSlices(defaultValue, slices, property.slicing, ctx.profileUrl)` then
  `addPlaceholderValues` (pads each slice to `slice.min` with `undefined`)
  (`ResourceArrayInput.tsx:39-56`). State: `loading`, `slices`, frozen `defaultValue`,
  `slicedValues: any[][]` where index `slices.length` is the non-sliced bucket.
  `setValuesWrapper` flattens and filters `undefined` before calling `onChange`
  (lines 57-66) — placeholders never escape. Non-sliced values hidden when
  `hideNonSliceValues ?? (typeCode === 'Extension' && slices.length > 0)` (line 77). Add button
  gated on `slicedValues.flat().length < property.max` (line 132). Test ids:
  `slice-<name>`, `nonsliced-add`, `nonsliced-remove-<i>`.
- **`SliceInput`**: own `useState(props.defaultValue)`; reads
  `slice.typeSchema?.elements ?? slice.elements` (line 30); re-wraps children in a nested
  `ElementsContext` via `maybeWrapWithContext` when the slice has elements; respects
  `slice.min`/`slice.max` for add/remove affordances.
- **`ResourcePropertyInput`**: if `property.max > 1 && !arrayElement` → `ResourceArrayInput`; if
  `property.type.length > 1` → `ElementDefinitionInputSelector`; else
  `ElementDefinitionTypeInput`. The selector holds `useState(initialPropertyType)` seeded from
  `defaultPropertyType` with fallback to `type[0]` (lines 120-127) and renders a `NativeSelect` of
  type codes beside the input; changing it calls `onChange(value, propName)` so
  `setPropertyValue` can clear the sibling variants.
- **`ElementsInput`**: three render branches per element (`ElementsInput.tsx:62-96`) — raw input for
  `type === 'Extension'` or extension keys, `CheckboxFormSection` for a lone `boolean`,
  `FormSection` otherwise. `required = element.min > 0` → `withAsterisk`.
- **`FormSection`**: Mantine `Input.Wrapper` with `label`, `description`,
  `error={getErrorsForInput(outcome, errorExpression ?? htmlFor)}`; when
  `ElementsContext.debugMode` is on it appends the `fhirPath` to the label.
- **`ResourcePropertyDisplay`**: mirror dispatch for read-only rendering. Secret fields get
  `SecretFieldDisplay` (`ResourcePropertyDisplay.tsx:221`) — a masked value with a visibility toggle
  and a `CopyButton`, wrapped in `Tooltip`/`ActionIcon`. `id` properties get a copy button.
- **A11y / test selectors**: tests lean on `data-testid` (`slice-*`, `nonsliced-*`, `testId` props)
  and label text via `getByLabelText`; the arrays use `aria-label`ed icon buttons from
  `buttons/ArrayAddButton.tsx` / `ArrayRemoveButton.tsx`.

### 1.3 Mantine: load-bearing vs cosmetic

| Usage                                                                                               | Verdict                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Stack` (`ElementsInput`), `Group` (`ResourceArrayInput`, selector), `Box` (`BackboneElementInput`) | Cosmetic — `flex flex-col gap-*` / `flex items-center gap-*`                                                                                                                        |
| `Input.Wrapper` (`FormSection`, `CheckboxFormSection`)                                              | Cosmetic structure, but it wires `label`↔`id`↔`aria-describedby`↔`error`. Replace with shadcn `Field`/`FormItem`+`FormLabel`+`FormDescription`+`FormMessage` and keep the id wiring |
| `NativeSelect` (type selector)                                                                      | Cosmetic; a native `<select>` styled by `cva` is fine and keeps `fireEvent.change` tests working                                                                                    |
| `TextInput`/`Checkbox`/`Textarea` leaves                                                            | Cosmetic                                                                                                                                                                            |
| `Menu` in `ResourceForm` split button                                                               | Load-bearing focus/roving-tabindex → Radix `DropdownMenu`                                                                                                                           |
| `Tooltip.Floating` in `maybeWrapWithTooltip`                                                        | Semi — floating follows the cursor; Radix `Tooltip` anchors to the trigger. Accept the visual difference                                                                            |
| `useMantineTheme()` for `theme.primaryColor` (`ResourceForm.tsx:40`)                                | Cosmetic — drop, use `variant="default"`                                                                                                                                            |
| `Alert` (permission denied)                                                                         | Cosmetic → shadcn `Alert`                                                                                                                                                           |

### 1.4 shadcn targets

`Form`/`FormField`/`FormItem`/`FormLabel`/`FormMessage` (or the newer `Field` primitive) ·
`Input` · `Textarea` · `Checkbox` · `Select` (or native `select` + `cva`) · `DropdownMenu` ·
`Tooltip` · `Alert` · `Button`. CSS modules `BackboneElementInput.module.css` (`.nested`, 5 LOC),
`ResourceArrayInput.module.css` (`.indented`, 5 LOC), `FormSection.module.css` (7 LOC),
`ResourceForm.module.css` (`.splitButton`, `.menuControl`, 11 LOC) all become Tailwind classes.

### 1.5 Difficulty and effort

**4/5.** The logic is intricate but Mantine-free; the risk is regression in the 60k+ LOC of tests
that pin it (`ResourcePropertyInput.test.tsx` alone is large, `ResourceArrayInput` ~9.7k test LOC,
`ResourceForm` ~16k test LOC). Port surface: ~1,050 LOC of engine
(`ResourcePropertyInput` 410 + `ResourcePropertyDisplay` 270 + `ElementsInput` 100+64 +
`BackboneElementInput` 72 + `ResourceArrayInput` 162 + `SliceInput` 129 + `ResourceForm` 179+40 +
`FormSection` 51 + `CheckboxFormSection` 47 + `Form` 42) plus ~800 LOC of leaf inputs/displays.
**~1,900 LOC touched, of which perhaps 400 are real rewrites**; the rest is import and className
churn. Budget another ~500 LOC of test-selector updates.

---

<a name="group-2"></a>

## Group 2 — Questionnaire engine

`QuestionnaireForm/` (8 files, 1,668 LOC) · `QuestionnaireBuilder/` (679) ·
`QuestionnaireResponseDisplay/` (23 + 89)

### 2.0 Hook vs component split

**Everything stateful lives in `@medplum/react-hooks`.** `useQuestionnaireForm`
(`packages/react-hooks/src/useQuestionnaireForm/useQuestionnaireForm.ts`, 331
LOC) plus `utils.ts` (666 LOC) own: response construction, page splitting, answer mutation,
`enableWhen`, calculated expressions, `optionExclusive`, and the signature extension. The React
components are a pure rendering layer. **This is the single most important fact for the port: group 2
is a restyling job, not a logic job.**

Public types (`useQuestionnaireForm.ts`):

```ts
// :42
export interface UseQuestionnaireFormProps {
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
  readonly defaultValue?: QuestionnaireResponse | Reference<QuestionnaireResponse>;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly source?: QuestionnaireResponse['source'];
  readonly disablePagination?: boolean;
  readonly onChange?: (response: QuestionnaireResponse) => void;
}
// :52  QuestionnaireFormPage { linkId, title, group }
// :58  QuestionnaireFormLoadingState { loading: true }
// :63  QuestionnaireFormLoadedState  { loading: false, questionnaire, questionnaireResponse,
//        subject?, encounter?, items, responseItems, onAddGroup, onAddAnswer, onChangeAnswer,
//        onChangeSignature, ... }
// :122 QuestionnaireFormPaginationState extends LoadedState
//        { pagination: true, pages, activePage, onNextPage, onPrevPage }
// :130 QuestionnaireFormState = Loading | SinglePage | Pagination
```

Hook internals worth knowing: state lives in a `useRef<Partial<QuestionnaireFormPaginationState>>`
seeded `{ activePage: 0 }` (line 138) and re-renders are forced with
`useReducer((x) => x + 1, 0)` (line 136). Prop changes after the first load are **ignored** —
`state.current.questionnaire` is only set when unset (lines 143-157). Pages come from
`getPages(questionnaire)` unless `disablePagination`.

### 2.1 `QuestionnaireForm`

`QuestionnaireForm/QuestionnaireForm.tsx:20` (202 LOC):

```ts
export interface QuestionnaireFormProps {
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
  readonly questionnaireResponse?: QuestionnaireResponse | Reference<QuestionnaireResponse>;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly source?: QuestionnaireResponse['source'];
  readonly disablePagination?: boolean;
  readonly excludeButtons?: boolean;
  readonly submitButtonText?: string;
  readonly afterHeader?: ReactNode;
  readonly onChange?: (response: QuestionnaireResponse) => void;
  readonly onSubmit?: (response: QuestionnaireResponse) => void;
}
```

- Defers `onChange` out of the render phase: the hook's change lands in
  `pendingChangeRef` (lines 39-46) and a `props` mirror lives in `propsRef` updated in
  `useLayoutEffect` (lines 38-42); the pending response is flushed in an effect. **Preserve this** —
  it exists to avoid render-phase parent updates.
- Signature: `getExtension(formState.questionnaire, QUESTIONNAIRE_SIGNATURE_REQUIRED_URL)` (line 94)
  decides whether a `SignatureInput` renders; `formState.questionnaireResponse.extension` is checked
  for `QUESTIONNAIRE_SIGNATURE_RESPONSE_URL` (line 101) to know whether it is satisfied.
  `signatureRequiredSubmitted` local state (line 37) blocks submit until signed.
- Renders `QuestionnaireFormStepper` when `formState.pagination`, else `QuestionnaireFormItemArray`.

### 2.2 Pagination / Stepper

`QuestionnaireForm/QuestionnaireFormStepper.tsx` (52 LOC) is trivially small and holds no state:
`<Stepper active={activePage} allowNextStepsSelect={false}>` with one `Stepper.Step` per page,
rendering `children` only for `index === activePage`. Buttons: Back (`activePage > 0`), Next
(`activePage < pages.length - 1`), Submit (last page). **The Next button calls
`e.currentTarget.closest('form').reportValidity()` and only advances if it returns true** (lines
36-42) — native constraint validation gating page advance. That is the one behavior that must survive.

shadcn: there is no `Stepper`. Build one: an `<ol>` of steps with `aria-current="step"` plus
`cva` variants for done/active/upcoming, and render only the active panel. ~90 LOC of new component.

### 2.3 Item dispatch table

`QuestionnaireForm/QuestionnaireFormItem.tsx` (787 LOC) — one `switch` on
`QuestionnaireItemType` at lines 130-290:

| `item.type`            | line    | rendered input                                           |
| ---------------------- | ------- | -------------------------------------------------------- |
| `display`              | 130     | `<p>{item.text}</p>`                                     |
| `boolean`              | 133     | `Checkbox`                                               |
| `decimal`              | 146     | `TextInput type=number` (step)                           |
| `integer`              | 161     | `TextInput type=number`                                  |
| `date`                 | 176     | `TextInput type=date`                                    |
| `dateTime`             | 188     | `DateTimeInput`                                          |
| `time`                 | 198     | `TextInput type=time`                                    |
| `string`, `url`        | 210-211 | `TextInput`                                              |
| `text`                 | 225     | `Textarea`                                               |
| `attachment`           | 239     | `AttachmentInput`                                        |
| `reference`            | 251     | `ReferenceInput` (target types + filter from extensions) |
| `quantity`             | 263     | `QuantityInput`                                          |
| `choice`, `openChoice` | 275-276 | via `resolveChoiceControl(item)` (line 735)              |

`resolveChoiceControl` reads the `QUESTIONNAIRE_ITEM_CONTROL_URL` extension and returns
`{ widget, multiselect }`, routing to `QuestionnaireChoiceDropDownInput` /
`QuestionnaireChoiceRadioInput` / `QuestionnaireChoiceCheckboxInput` / multi-select. Options come
from `item.answerOption` or an expanded `item.answerValueSet`.

`QuestionnaireFormItemArray.tsx` (120 LOC) filters with
`isQuestionEnabled(item, questionnaireResponse)` (the `enableWhen` evaluator lives in the hook's
`utils.ts`) and routes groups → `QuestionnaireFormGroup` (33 LOC) and repeatables →
`QuestionnaireFormRepeatableGroup` (33) / `QuestionnaireFormRepeatableItem` (41, "Add Item"
`Anchor`).

### 2.4 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `Stepper` (visual only, but no shadcn equivalent → new component);
  `MultiSelect`/`Combobox` inside choice inputs (keyboard — see group 8); `Radio.Group` (arrow-key
  roving focus → Radix `RadioGroup` gives this for free); `Collapse` in the AI form.
- **Cosmetic:** `Stack`, `Group`, `Divider`, `Text`, `Title`, `Anchor`, `Checkbox`, `TextInput`,
  `Textarea`, `NativeSelect`.

### 2.5 `QuestionnaireBuilder`

`QuestionnaireBuilder/QuestionnaireBuilder.tsx:34` (679 LOC):

```ts
export interface QuestionnaireBuilderProps {
  readonly questionnaire: Partial<Questionnaire> | Reference<Questionnaire>;
  readonly onSubmit: (result: Questionnaire) => void;
  readonly autoSave?: boolean;
}
```

- State: `schemaLoaded`, `value`, `selectedKey`, `hoverKey` (lines 43-46).
- Click-outside/hover-out are implemented with **document-level listeners**
  (`handleDocumentMouseOver`, `handleDocumentClick`, lines 48-54) rather than Mantine
  `useClickOutside`. That is framework-free and ports as-is.
- `ensureQuestionnaireKeys(defaultValue ?? { resourceType:'Questionnaire', status:'active' })`
  (line 64) assigns stable react keys to every item.
- Recursive `ItemBuilder` with inline editing (`Textarea`, `NativeSelect`) and `Anchor` add/remove
  links. `QuestionnaireBuilder.module.css` (76 LOC) does the selected/hovered highlight — the only
  real styling asset.

### 2.6 `AIRealTimeQuestionnaireForm`

`QuestionnaireForm/AIRealTimeQuestionnaireForm.tsx:40` (442 LOC, 191 LOC CSS module, 451 test LOC):

```ts
export interface AIRealTimeQuestionnaireFormProps extends QuestionnaireFormProps {
  readonly aiModel?: string;
  readonly onTranscript?: (fullTranscript: string, chunk: string) => void;
  readonly voiceInstructions?: ReactNode;
  readonly silenceDebounceMs?: number;
}
```

- State (lines 50-62): `questionnaireResponse`, `isProcessing`, `transcript`, `displayTranscript`
  (seeded from `getStoredTranscript(...)`), `expanded`, `isStopping`, `responseVersion`.
- **`responseVersion` is a remount key.** Comment at lines 60-61: bumped only when the AI replaces
  the response, so `QuestionnaireForm` remounts and picks up the new `defaultValue`, because the
  inner hook ignores later prop changes (§2.0). Any port that "fixes" this by making the form
  controlled will break the AI flow.
- Refs (lines 64-70): `questionnaireRef`, `inputRef` (accumulating transcript), `inFlightRef`
  (single-flight guard), `responseRef`, `flushTranscriptRef`, `transcriptViewportRef`
  (auto-scroll).
- `useWhisper` from `@medplum/react-hooks` produces transcript chunks; a silence debounce
  (`silenceDebounceMs`, default 500) triggers a flush which calls
  `medplum.executeBot(...)` with a `Parameters` resource carrying the questionnaire and transcript,
  and parses the returned `QuestionnaireResponse` JSON.
- Errors surface via `showNotification` at lines 186, 236, 270 (§C.4).
- Mantine: `Collapse` (load-bearing animated disclosure → Radix `Collapsible`), plus
  `Button`/`Text`/`Group`/`Flex`/`Loader`/`ActionIcon`/`Divider` (cosmetic).

### 2.7 `QuestionnaireResponseDisplay`

`QuestionnaireResponseDisplay/QuestionnaireResponseDisplay.tsx:9` — `{ questionnaireResponse:
QuestionnaireResponse | Reference<...> }`, resolves with `useResource`, renders `Stack gap={0}` of
`QuestionnaireResponseItemDisplay` (89 LOC) which recurses and switches on the answer's `value*`
field. Pure cosmetic Mantine (`Stack`, `Text`). **1/5.**

### 2.8 Difficulty and effort

**4/5** overall, driven by `QuestionnaireFormItem`'s breadth (787 LOC of dispatch touching every
input in group 8) and the new `Stepper`. Builder is **3/5**, AI form **3/5** (websocket/bot logic is
already framework-free), response display **1/5**.
**~1,900 LOC touched; ~250 LOC genuinely new (Stepper + Collapsible wiring).**

---

<a name="group-3"></a>

## Group 3 — Search table

`SearchControl/` (647 + 146 + 620) · `SearchPopupMenu/` (368) · `SearchFieldEditor/` (157) ·
`SearchFilterEditor/` (186) · `SearchFilterValueInput/` (134) · `SearchFilterValueDialog/` (56) ·
`SearchFilterValueDisplay/` (32) · `SearchExportDialog/` (55) · `BookmarkDialog/` (83) ·
`Modal/` (102)

### 3.1 Public API

```ts
// SearchControl/SearchControl.tsx:51,60,69 — DOM Event subclasses, not plain objects
export class SearchChangeEvent extends Event {
  readonly definition: SearchRequest;
}
export class SearchLoadEvent extends Event {
  readonly response: Bundle;
}
export class SearchClickEvent extends Event {
  readonly resource: Resource;
  readonly browserEvent: MouseEvent;
}

// :89
export interface SearchControlAdditionalColumn {
  readonly name: string;
  readonly renderCell: (resource: Resource) => ReactNode;
}

// :96
export interface SearchControlProps {
  readonly search: SearchRequest;
  readonly checkboxesEnabled?: boolean;
  readonly additionalColumns?: readonly SearchControlAdditionalColumn[];
  readonly hideToolbar?: boolean;
  readonly hideFilters?: boolean;
  readonly onLoad?: (e: SearchLoadEvent) => void;
  readonly onChange?: (e: SearchChangeEvent) => void;
  readonly onClick?: (e: SearchClickEvent) => void;
  readonly onAuxClick?: (e: SearchClickEvent) => void;
  readonly onNew?: () => void;
  readonly onExport?: () => void;
  readonly onExportCsv?: () => void;
  readonly onExportTransactionBundle?: () => void;
  readonly onDelete?: (ids: string[]) => void;
  readonly onBulk?: (ids: string[]) => void;
}

// :115 (internal)
interface SearchControlState {
  readonly searchResponse?: Bundle;
  readonly selected: { [id: string]: boolean };
  readonly fieldEditorVisible: boolean;
  readonly filterEditorVisible: boolean;
  readonly filterDialogVisible: boolean;
  readonly exportDialogVisible: boolean;
  readonly filterDialogFilter?: Filter;
  readonly filterDialogSearchParam?: SearchParameter;
  readonly dialogOpenTime?: number;
}
```

Others: `SearchControlField` (`SearchControl/SearchControlField.ts:39` — `{ name,
elementDefinition?, searchParams? }`, built by `getFieldDefinitions(search)` at `:49`);
`SearchPopupMenuProps` (`SearchPopupMenu.tsx:39` — `search`, `searchParams?`,
`onPrompt(searchParam, filter)`, `onChange(definition)`); `SearchFieldEditorProps` /
`SearchFilterEditorProps` (both `{ visible, search, onOk(search), onCancel }`, at
`SearchFieldEditor.tsx:12` and `SearchFilterEditor.tsx:24`);
`SearchFilterValueInputProps` (`:11`); `SearchFilterValueDialogProps` (`:12`);
`SearchFilterValueDisplayProps` (`:8`); `ModalProps`
(`Modal/Modal.tsx:35`, `extends Omit<MantineModalProps, 'children'|'onSubmit'|'scrollAreaComponent'>`).

### 3.2 Behavior contract

- **`SearchRequest` is owned by the parent.** `SearchControl` never mutates it; every interaction
  produces a new `SearchRequest` through a pure helper in `SearchUtils.tsx` (620 LOC) and emits
  `props.onChange(new SearchChangeEvent(newSearch))` (`SearchControl.tsx:241-245`). `SearchUtils`
  exports the filter mutators (`setFilters`, `clearFilters`, `clearFiltersOnField`, `addFilter`,
  `deleteFilter`, `addMissingFilter`), date shortcuts (`addTodayFilter`, `addYesterdayFilter`,
  `addTomorrowFilter`, `addNext24HoursFilter`, `addLastMonthFilter`, …), sort helpers (`setSort`,
  `toggleSort`, `getSortField`, `isSortDescending`), pagination (`setOffset`, `setPage`),
  `renderValue(resource, field)`, and `getSearchOperators(searchParam)`. All pure, 497 test LOC.
- **Loading**: `medplum.search(...)` into `state.searchResponse`, `props.onLoad(new
SearchLoadEvent(response))`; errors set `outcome` and the component returns
  `<OperationOutcomeAlert>` (line 281). Before the datatype is loaded it renders a centered
  `Loader` (lines 285-291).
- **Row click** (`handleRowClick`, lines 252-274): returns early if
  `isCheckboxCell(e.target)` (`utils/dom.ts:32`) or `e.button === 2` (right click); otherwise
  `killEvent(e)` then `isAuxClick(e)` (`utils/dom.ts:22`: middle click or ctrl/cmd) chooses between
  `props.onClick` and `props.onAuxClick`. **Both handlers receive the raw `MouseEvent`** so callers
  can decide about new tabs.
- **Checkbox selection**: header checkbox `aria-label="all-checkbox"`
  `data-testid="all-checkbox"` (lines 396-405) toggles all ids; row checkbox
  `aria-label={`Checkbox for ${resource.id}`}` `data-testid="row-checkbox"` (lines 478-488).
  "All checked" is derived by scanning `searchResponse.entry` against `state.selected`
  (lines 228-236) — not stored.
- **Column header menus**: each `Table.Th` (line 408) wraps a Mantine `Menu` whose dropdown is
  `SearchPopupMenu`. `SearchPopupMenu` returns `null` without `searchParams` (line 47) and otherwise
  picks a submenu by `searchParam.type`: `DateFilterSubMenu`, `NumericFilterSubMenu`,
  `ReferenceFilterSubMenu`, `TextFilterSubMenu`, `TokenFilterSubMenu`, `UriFilterSubMenu`, plus
  shared `CommonMenuItems` (missing / not-missing / clear filters). `onPrompt(searchParam, filter)`
  is how a menu item asks the control to open `SearchFilterValueDialog`.
- **Second header row** (lines 448-465) renders the active filter chips per column when
  `!hideFilters`.
- **Toolbar** (`!hideToolbar`): New / Export (CSV or transaction bundle, guarded by
  `isExportPassed()` at line 277) / Delete / Bulk, plus a `count-display`
  (`data-testid="count-display"`, line 379).
- **Pagination** (line 512): Mantine `Pagination` with
  `getControlProps={getPaginationControlProps}` (`utils/pagination.ts:11`) supplying
  `aria-label` of `Next page` / `Previous page` / `First page` / `Last page` — the exact strings
  tests query.
- **Root**: `<div className={classes.root} data-testid="search-control">` (line 306).
- **Editors**: `SearchFieldEditor` uses `Modal` + `MultiSelect` and tracks
  `wasDropdownOpen` in a ref (line 20) so the modal's close-on-outside-click doesn't fire while the
  select dropdown is open — a real bug fix worth preserving. `SearchFilterEditor` deep-clones the
  search (`deepClone(props.search)`, line 32), holds a `searchRef` mirror, and renders one
  `FilterRowInput` per filter with a `Table`, `NativeSelect`s and a delete `ActionIcon`.
  `SearchFilterValueInput` dispatches by `getSearchParameterDetails(...).type`:
  reference→`ReferenceInput`, boolean→`Checkbox`, date→`type=date`, datetime→`DateTimeInput`,
  number→`type=number`, quantity→`QuantityInput`, default→`TextInput`.
- **`BookmarkDialog`** (83 LOC): `Modal` + `NativeSelect` + `TextInput`; on submit appends to
  `UserConfiguration.menu[].link[]` and calls `medplum.updateResource`, then
  `showNotification({color:'green', message:'Success'})` / red on error (lines 37, 41).
  `closeButtonProps={{ 'aria-label': 'Close' }}` (line 48).
- **`Modal`** (102 LOC): the house dialog. Owns "bold title above a border, one scrolling body,
  actions pinned to the bottom" and deliberately blocks `scrollAreaComponent` because it breaks the
  flex chain the pinned footer needs (doc comment lines 42-51). `Modal.module.css` is 54 LOC of that
  flex layout.

### 3.3 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `Menu` per column header (focus management, arrow keys, nested submenus →
  Radix `DropdownMenu` + `DropdownMenuSub`); `Modal` (portal, focus trap, scroll lock → Radix
  `Dialog`); `Pagination` (page-window math + control props → shadcn `Pagination` needs the
  `aria-label`s wired manually); `MultiSelect` in the field editor (group 8).
- **Cosmetic:** `Table` (shadcn `Table` is a thin `<table>` wrapper — direct swap),
  `Group`/`Stack`/`Center`/`Text`, `ActionIcon`, `Loader` (→ spinner), `Checkbox` (native
  `type="checkbox"` is already used inline, so tests keep working).
- `SearchControl.module.css` (35 LOC) is row-hover, control-hover and icon sizing — Tailwind
  `hover:bg-muted` etc.

### 3.4 shadcn targets

`Table` · `DropdownMenu` (+ `DropdownMenuSub`, `DropdownMenuRadioGroup` for sort) · `Dialog` ·
`Pagination` · `Checkbox` · `Select` · `Command`+`Popover` for the field multi-select · `Alert`.

### 3.5 Difficulty and effort

**3/5.** Concerns are unusually well separated: `SearchUtils.tsx` (620) and `SearchControlField.ts`
(146) are pure and port untouched; the rewrite is confined to markup. **~1,300 LOC touched,
~350 real.** The one thing to design deliberately is the shared `Modal` — nine dialogs depend on its
exact chrome, so port `Modal` first and the dialogs become mechanical.

---

<a name="group-4"></a>

## Group 4 — AppShell and layout leaves

`AppShell/` (7 files, 1,640 LOC, 7 CSS modules totalling 522 LOC) · `LinkTabs/` (71) ·
`MedplumLink/` (84) · `NotificationIcon/` (49) · `ResourceAvatar/` (42) · `ResourceBadge/` (21) ·
`ResourceName/` (40) · `ScrollToTop/` (19)

### 4.1 Public API

```ts
// AppShell/AppShell.tsx:25
export interface AppShellProps {
  readonly logo: ReactNode;
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly headerSearchDisabled?: boolean;
  readonly version?: string;
  readonly menus?: NavbarMenu[];
  readonly children: ReactNode;
  readonly displayAddBookmark?: boolean;
  readonly resourceTypeSearchDisabled?: boolean;
  readonly notifications?: ReactNode;
  readonly announcements?: AppShellAnnouncement[];
  readonly layoutVersion?: 'v1' | 'v2';
  readonly showLayoutVersionToggle?: boolean;
  readonly spotlightPatientsOnly?: boolean;
  readonly spotlightActions?: SpotlightLinkAction[];
}

// AppShell/Navbar.tsx:31
export interface NavbarLink {
  readonly icon?: JSX.Element;
  readonly label?: string;
  readonly href: string;
  readonly count?: number; // ignored when notificationCount is set
  readonly alert?: boolean; // red dot collapsed / red count expanded
  readonly notificationCount?: { resourceType: ResourceType; countCriteria: string; subscriptionCriteria: string };
  readonly onDismiss?: () => void; // renders an X on hover when present
}
// :49 NavbarMenu { title?, links? }
// :54 NavbarProps { pathname?, searchParams?, logo?, menus?, navbarToggle, closeNavbar,
//        spotlightEnabled?, patientsOnly?, spotlightActions?, userMenuEnabled?,
//        displayAddBookmark?, resourceTypeSearchDisabled?, opened?, version?,
//        showLayoutVersionToggle? }

// AppShell/AnnouncementBanners.tsx:8
export interface AppShellAnnouncement {
  readonly id?: string;
  readonly message: ReactNode;
  readonly color?: MantineColor; // ← Mantine-typed public API
  readonly icon?: ReactNode;
  readonly dismissible?: boolean;
  readonly onDismiss?: (announcement: AppShellAnnouncement) => void;
  readonly role?: AriaRole;
}

// AppShell/Spotlight.tsx:26
export interface SpotlightLinkAction extends SpotlightActionData {
  readonly href?: string;
}
// :35 SpotlightProps { patientsOnly?, staticActions? }
```

Leaves: `LinkTabsProps` (`LinkTabs.tsx:18`, `extends Omit<TabsProps,'value'|'onChange'>`);
`MedplumLinkProps` (`MedplumLink.tsx:11`, `extends AnchorProps, ElementProps<'a', keyof
AnchorProps>` — `to?: Resource | Reference | string`, `suffix?`, `label?`, `onClick?`);
`NotificationIconProps` (`NotificationIcon.tsx:8`); `ResourceAvatarProps`
(`ResourceAvatar.tsx:12`, `extends AvatarProps`); `ResourceBadgeProps`
(`ResourceBadge.tsx:9`); `ResourceNameProps` (`ResourceName.tsx:12`, `extends TextProps`).

### 4.2 Behavior contract

- **Two layouts.** `AppShell.tsx:44-47`: `navbarOpen` seeded from `localStorage['navbarOpen'] ===
'true'`; `layoutVersion` from `props.layoutVersion ?? localStorage['appShellLayoutVersion'] ??
'v1'`, captured once in `useState` (so toggling requires reload). v1 = 60px header +
  announcements, 250px navbar with `breakpoint='sm'`. v2 = no top header (header height is just the
  announcement strip), navbar 250px open / 59px icon rail closed, no breakpoint.
- **Announcements**: dismissed ids persisted to `localStorage` as JSON (lines 50+); each banner is a
  `Box` whose colors are inline
  `var(--mantine-color-${color ?? 'yellow'}-light)` / `-light-color`
  (`AnnouncementBanners.tsx:31-32`) — this is the most direct CSS-variable coupling in the library.
- **Children** are wrapped in `ErrorBoundary` + `Suspense` with a `Loading` fallback.
- **`Navbar`** (425 LOC): active link chosen by a scoring function
  `getActiveLink(pathname, searchParams, menus)` (line 76) that matches pathname and then
  query-param overlap — port verbatim. `NavbarLinkContent` renders icon + label + count badge +
  hover dismiss button; `NavbarLinkWithSubscription` wraps the link with
  `useNotificationCount` for live counts. Every link gets a `Tooltip` with
  `transitionProps={{ duration: 0 }}` (instant, so tests can assert immediately). Clicking a link
  calls `navigate()` then `closeNavbar()` on mobile. Search button:
  `<UnstyledButton onClick={() => spotlight.open()} aria-label="Search">` (line 119).
  Also hosts `ResourceTypeInput` for quick nav and `BookmarkDialog` when `displayAddBookmark`.
- **`Header`** (99 LOC) + **`HeaderSearchInput`** (270 LOC): v1 only. The search input is an
  `AsyncAutocomplete` with a custom `itemComponent` (avatar + display string) that searches
  Patients/ServiceRequests and navigates to `/${resourceType}/${id}` on select.
- **`HeaderDropdown`** (185 LOC): the user menu. Active login, then recent logins as `Menu.Item`s;
  a `SegmentedControl` bound to `useMantineColorScheme()` (line 76,
  `setColorScheme(value as MantineColorScheme)` at line 141) for light/auto/dark with
  `IconSunHigh`/`IconDeviceDesktop`/`IconMoon`; an optional `SegmentedControl` for layout version;
  sign out → `medplum.signOut()` + `navigate('/signin')`.
- **`Spotlight`** (412 LOC, 735 test LOC): built on `@mantine/spotlight`'s composable API
  (`Spotlight.Root/Search/ActionsList/ActionsGroup/Action/Empty/Footer`) plus the imperative
  `spotlight.open()/close()` store. Notable: it reimplements filtering because
  `defaultSpotlightFilter` is internal (`filterActionGroups`, line 120); `SpotlightActionItem`
  (line 75) renders `MantineSpotlight.Action` with `closeSpotlightOnTrigger={false}` and calls
  `spotlight.close()` itself (line 93) after `navigate(href)` or `onClick()`; anchors are rendered
  when `href` is set so browser aux-click works. Query is debounced with
  `useDebouncedCallback` (200ms) and dispatches a GraphQL query — UUID input searches `_id`,
  text searches name/identifier plus a ValueSet expansion for resource types.
- **`MedplumLink`**: `onAuxClick` only `stopPropagation()`s (letting the browser open a new tab,
  `MedplumLink.tsx:32-35`); `onClick` prevents default and calls `navigate(href)` unless a custom
  `onClick` is supplied. `getHref(to)` resolves resource/reference/string, then appends `suffix`.
- **`LinkTabs`**: `Tabs.Tab` containing an `Anchor`; `preventDefault` + `navigate()` except on aux
  clicks; active tab derived from the current pathname.
- **`NotificationIcon`**: composition ladder — icon, wrapped in `ActionIcon` if `onClick`
  (`aria-label={props.label}`, line 28), then `Tooltip`, then `Indicator` when the
  `useNotificationCount` result is > 0.
- **`ResourceName`**: on error renders `[${normalizeErrorString(outcome)}]` (line 24); returns
  `null` while the resource is unresolved (line 28); `link` switches between `MedplumLink` and
  `<Text component="span">`.
- **`ScrollToTop`** (19 LOC): `useEffect` on `useLocation().pathname` → `window.scrollTo(0,0)`.
  Zero Mantine.

### 4.3 Mantine: load-bearing vs cosmetic

- **Load-bearing / no drop-in:** `AppShell` + `AppShellHeaderConfiguration` +
  `AppShellNavbarConfiguration` (the whole responsive breakpoint/collapse system — must be rebuilt,
  either on shadcn's `Sidebar` block or hand-rolled CSS grid); `@mantine/spotlight` (**no shadcn
  equivalent**; rebuild on `CommandDialog` + a small `open/close` store + a `useHotkeys`-style
  ⌘K listener); `Menu` (user menu → Radix `DropdownMenu`); `SegmentedControl` (→ Radix
  `ToggleGroup` or `Tabs`); `Tooltip`; `ScrollArea`; `Indicator` (→ absolutely-positioned badge);
  `useMantineColorScheme` (→ `next-themes`-style provider or a local `useTheme`).
- **Cosmetic:** `Box`, `Flex`, `Group`, `Stack`, `Text`, `Divider`, `CloseButton`, `Kbd`,
  `UnstyledButton` (→ `<button>` + `cn()`).
- **CSS modules to convert:** `Navbar.module.css` (253), `HeaderDropdown.module.css` (107),
  `Spotlight.module.css` (90), `Header.module.css` (42), `HeaderSearchInput.module.css` (19),
  `AppShell.module.css` (11), `AppShell.stories.module.css` (20). Navbar's is the largest single
  styling asset in the library.

### 4.4 shadcn targets

`Sidebar` (or custom grid shell) · `CommandDialog` for Spotlight · `DropdownMenu` · `Tabs` ·
`Tooltip` · `ScrollArea` · `Avatar` · `Badge` · `Alert` for announcements · `ToggleGroup`.

### 4.5 Difficulty and effort

**4/5** for `AppShell` + `Spotlight` (the two places with genuinely no shadcn counterpart);
**1-2/5** for every leaf. **~1,900 LOC touched; ~600 real**, concentrated in the shell layout
(~250 new LOC) and Spotlight (~250 new LOC). The `MantineColor` in `AppShellAnnouncement` and
`AnchorProps`/`TextProps`/`AvatarProps`/`TabsProps` in the leaves are public-API breaks (§C.7).

---

<a name="group-5"></a>

## Group 5 — PatientSummary

27 non-test files, ~2,700 source LOC, 4 CSS modules.

### 5.1 Public API

```ts
// PatientSummary/PatientSummary.types.ts (whole file, 31 LOC)
export type { FhirSearchDescriptor, SectionResults }; // re-exported from @medplum/react-hooks

export interface SectionRenderContext {
  readonly patient: Patient;
  readonly onClickResource?: (resource: Resource) => void;
  readonly results: SectionResults; // keyed by FhirSearchDescriptor.key
}

export interface PatientSummarySectionConfig {
  readonly key: string;
  readonly title: string;
  readonly searches?: FhirSearchDescriptor[];
  readonly component: ComponentType<SectionRenderContext>; // ComponentType, not a render prop,
} // so hooks work inside custom sections

// PatientSummary/PatientSummary.tsx:15
export interface PatientSummaryProps {
  readonly patient: Patient | Reference<Patient>;
  readonly onClickResource?: (resource: Resource) => void;
  readonly onRequestLabs?: () => void;
  readonly sections?: PatientSummarySectionConfig[];
}

// PatientSummary/SummaryResourceListSection.tsx:14
export interface SummaryResourceListOptions {
  readonly key: string;
  readonly title: string;
  readonly search: {
    readonly resourceType: ResourceType;
    readonly patientParam?: string; // defaults to 'subject'
    readonly query?: Record<string, string | number | boolean | undefined>;
  };
  readonly getDisplayString?: (resource: Resource) => string;
  readonly getStatus?: (resource: Resource) => { label: string; color: string } | undefined;
  readonly getSecondaryText?: (resource: Resource) => string | undefined;
  // + filter?, sort?, onAdd?
}
export function summaryResourceListSection(options): PatientSummarySectionConfig; // :47
```

Also `CollapsibleSectionProps` (`CollapsibleSection.tsx:10` — `{ title, children, onAdd? }`),
`PatientInfoItemProps` (`PatientInfoItem.tsx:9`), `AllergiesProps` (`Allergies.tsx:17`) and one
sibling per section.

### 5.2 Section registry

`sectionConfigs.tsx` (300 LOC) exports twelve entries, each either a const config or a factory:

| Export                               | line | searches                                |
| ------------------------------------ | ---- | --------------------------------------- |
| `DemographicsSection`                | 51   | none (reads the patient)                |
| `InsuranceSection`                   | 112  | Coverage                                |
| `AllergiesSection`                   | 122  | AllergyIntolerance                      |
| `ProblemListSection`                 | 136  | Condition                               |
| `MedicationsSection`                 | 150  | MedicationRequest + MedicationStatement |
| `ImmunizationsSection`               | 168  | Immunization                            |
| `GoalsSection`                       | 178  | Goal                                    |
| `createLabsSection(onRequestLabs?)`  | 193  | ServiceRequest + DiagnosticReport       |
| `LabsSection`                        | 214  | `= createLabsSection()`                 |
| `SexualOrientationSection`           | 217  | Observation LOINC 76690-7               |
| `SmokingStatusSection`               | 230  | Observation LOINC 72166-2               |
| `VitalsSection`                      | 241  | Observation (vitals panel)              |
| `createPharmaciesSection(dialog?)`   | 260  | patient pharmacy extensions             |
| `PharmaciesSection`                  | 277  | `= createPharmaciesSection()`           |
| `getDefaultSections(onRequestLabs?)` | 285  | assembles the default order             |

This registry is a **clean extension point that is entirely Mantine-free** and should be lifted
unchanged. Consumers already pass custom `sections` (e.g. `ThreadInbox` takes
`sections?: PatientSummarySectionConfig[]`, `chat/ThreadInbox/ThreadInbox.tsx:47`).

### 5.3 Behavior contract

- **`PatientSummary`** (111 LOC): `useResource(patient)`; `defaultSections` memoized on
  `onRequestLabs` (line 29); `usePatientSummaryData(propsPatient, sections)` (line 33) returns
  `{ sectionData, loading, error }`; `createdDate` fetched separately from patient history
  (line 26). Renders a header (avatar + name + created date) then each
  `section.component` with `{ patient, onClickResource, results: sectionData[i] }`, separated by
  `Divider`s inside a scrolling `Stack`.
- **`usePatientSummaryData`** (in `@medplum/react-hooks`): collects every `FhirSearchDescriptor`
  across sections, dedupes by `${resourceType}:${patientParam}:${queryStr}`, runs them with
  `Promise.allSettled`, and maps rejected searches to empty arrays so one failure cannot blank the
  panel. Framework-free; port untouched.
- **Section shape** (`Allergies.tsx` is the canonical example, 128 LOC): local `useState` seeded
  from props results; `useDisclosure(false)` for the dialog (`@mantine/hooks` — replace with plain
  `useState`); `editAllergy` state selects create vs edit; a `useMemo` sort putting `active` first
  (lines 32-39); render `CollapsibleSection` → `SummaryItem` per resource with a `StatusBadge`;
  clicking an item opens the dialog.
- **Dialogs**: one per domain — `AllergyDialog` (82), `ConditionDialog` (86), `MedicationDialog`
  (91), `GoalDialog` (83), `ImmunizationDialog` (94), plus `PharmacyDialog` (390, 616 test LOC, the
  outlier) and inline modals in `Vitals` (211), `SmokingStatus` (126), `SexualOrientation` (154).
  All are `Modal` + `Form` + a handful of typed inputs (`CodeableConceptInput`, `TextInput`,
  `DateTimeInput`, `Radio.Group`, `Checkbox`), submitting through
  `medplum.createResource`/`updateResource`.
- **`CollapsibleSection`** (66 LOC): `useState(collapsed=false)`, chevron `ActionIcon`, optional add
  `ActionIcon`, Mantine `Collapse` for the animation.
- **`SummaryItem`** (26 LOC): clickable `Box` with a gradient + hover chevron;
  `SummaryItem.module.css` is 73 LOC and is the most decorative asset in the group.
- **Pure utils to keep**: `PatientSummary.utils.ts` (115 LOC, 641 test LOC —
  gender/race/ethnicity/language/practitioner formatting), `Vitals.utils.ts` (110 —
  `createQuantity`, `createLoincCode`, `createObservation`, `createCompoundObservation`,
  `getObservationValue`), `pharmacy-utils.ts` (17).

### 5.4 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `Modal` (all ~10 dialogs → Radix `Dialog`); `Collapse` (→ Radix `Collapsible`);
  `Radio.Group` (arrow-key group semantics → Radix `RadioGroup`); `useDisclosure` (→ `useState`).
- **Cosmetic:** `Box`, `Flex`, `Group`, `Stack`, `Text`, `SimpleGrid` (→ `grid grid-cols-2`),
  `ActionIcon`, `Tooltip`, `Loader`, `Badge`.

### 5.5 shadcn targets

`Dialog` · `Collapsible` · `RadioGroup` · `Checkbox` · `Badge` · `Separator` · `ScrollArea` ·
`Button`/`Input`/`Textarea`.

### 5.6 Difficulty and effort

**2/5.** High file count, low conceptual risk — the registry, the hook and every util are already
portable, and the sections are repetitive. **~2,700 LOC touched, ~500 real**, most of it the same
dialog shell repeated. Do `Modal` and `CollapsibleSection` first; the other 24 files follow
mechanically. `PharmacyDialog` (390 LOC, 6 `showNotification` calls) is the only section needing
individual attention.

---

<a name="group-6"></a>

## Group 6 — Chat

`chat/` — 11 non-test files, 2,045 LOC, 6 CSS modules.

### 6.1 Public API

```ts
// chat/BaseChat/BaseChat.tsx:109
export interface BaseChatProps extends PaperProps {
  // ← Mantine-typed public API
  readonly title: string;
  readonly communications: Communication[];
  readonly setCommunications: (communications: Communication[]) => void;
  readonly query: string;
  readonly sendMessage: (content: string, file?: File, existingDocRef?: DocumentReference) => void;
  readonly onMessageReceived?: (message: Communication) => void;
  readonly onMessageUpdated?: (message: Communication) => void;
  readonly inputDisabled?: boolean;
  readonly excludeHeader?: boolean;
  readonly onError?: (err: Error) => void;
  readonly uploadEnabled?: boolean;
  readonly attachmentSubjectRef?: Reference;
  readonly onViewInDocuments?: (reference: Reference<DocumentReference>) => void;
}
// :128 doc comment: the component filters out Communications whose `sent` is undefined.

// chat/ChatModal/ChatModal.tsx:10   { open?, children }
// chat/ThreadChat/ThreadChat.tsx:10 { thread, title?, onMessageSent?, inputDisabled?,
//                                     excludeHeader?, uploadEnabled?, onError?, onViewInDocuments? }
// chat/ThreadInbox/ThreadInbox.tsx:42
//   { query, threadId, subject?, showPatientSummary?, sections?, onNew, onSelectFirst?,
//     getThreadUri, onChange, inProgressUri, completedUri, uploadEnabled?, onViewInDocuments?,
//     allowPatientSelection?, newTopicOpened?, onNewTopicOpen?, onNewTopicClose? }
// chat/ThreadInbox/NewTopicDialog.tsx:21
//   { subject, opened, onClose, onSubmit?, allowPatientSelection? }
```

### 6.2 Behavior contract

- **Realtime.** `BaseChat` uses `useSubscription` from `@medplum/react-hooks` and reacts to
  connection lifecycle: on disconnect it shows
  `showNotification({ color:'red', message:'Live chat disconnected. Attempting to reconnect...' })`
  (line 211) and on reconnect a green "Live chat reconnected." (line 215) **followed by a full
  `searchMessages()` re-fetch** (line 220) to close the gap. `searchMessages()` also runs on mount
  (line 185). All three paths funnel errors to `showNotification` (§C.4).
- Messages with `sent === undefined` are filtered out (documented at line 128) — a contract callers
  rely on.
- **`ThreadChat`** (137 LOC): `usePrevious(thread?.id)` (line 26) to detect thread switches and
  reset `communications`; memoized `profileRef`/`threadRef`; delegates rendering to `BaseChat`.
- **`ThreadInbox`** (329 LOC): master/detail. Uses `useThreadInbox`, drives a `SearchRequest`
  through `onChange`, supports in-progress vs completed tabs (`inProgressUri`/`completedUri`),
  optional embedded `PatientSummary` (accepting the group-5 `sections` registry), and
  `getThreadUri(topic)` for routing. Four `showNotification` sites (lines 145, 154, 183, 268).
  Children: `ThreadDetail` (153), `ThreadListItem` (48), `ThreadMessageForm` (79),
  `ParticipantFilter` (250), `NewTopicDialog` (95), `EditThreadDialog` (111).
- **`ChatModal`** (62 LOC): not a Mantine `Modal` at all — a `div` with
  `classes.chatModalContainer` gated on `useMedplumProfile()` and an `opened` state synced from the
  `open` prop (lines 18-22). Returns `null` without a profile.
- **Attachments**: `AttachmentButton` + a `DocumentPicker` (103 LOC) that can attach an existing
  `DocumentReference`; `onViewInDocuments` hands a reference back to the host app.
- Mantine hooks in play: `useDebouncedCallback`, `useDisclosure`, `useResizeObserver` (the last one
  drives the message-list autoscroll; replace with a `ResizeObserver` in `useEffect` — note
  `test.setup.ts:30-36` already stubs `ResizeObserver`).

### 6.3 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `ScrollArea` (message viewport + autoscroll), `Popover` (participant/document
  pickers), `Menu`, `Indicator` (unread), `LoadingOverlay`, `useResizeObserver`.
- **Cosmetic:** `Paper`/`PaperProps`, `Box`, `Center`, `Divider`, `Flex`, `Group`, `Stack`, `Text`,
  `Title`, `ThemeIcon`, `Skeleton`, `Loader`, `Tooltip`, `TextInput`, `Checkbox`, `CloseButton`,
  `UnstyledButton`.
- CSS modules: `BaseChat.module.css` (104 — bubble layout/alignment, the one with real design in
  it), `ChatModal.module.css` (28 — fixed positioning), plus four small ones
  (`ParticipantFilter` 8, `ThreadDetail` 3, `ThreadInbox` 7, `ThreadListItem` 6).

### 6.4 shadcn targets

`ScrollArea` · `Popover` · `DropdownMenu` · `Dialog` · `Skeleton` · `Badge` · `Card` (for
`PaperProps` call sites) · `sonner` for the connect/disconnect toasts. If the registry ships
AI-elements-style message primitives, `BaseChat`'s bubble list is the natural consumer.

### 6.5 Difficulty and effort

**3/5.** The websocket/subscription logic is framework-free; risk sits in the scroll-anchoring
behavior and the toast lifecycle (a _replaceable_ toast id is needed for the
disconnect→reconnect pair — `sonner`'s `toast.success(msg, { id })` covers it).
**~1,300 LOC touched, ~400 real.**

---

<a name="group-7"></a>

## Group 7 — Timelines

`ResourceTimeline/` (421) · `Timeline/` (87) · `PatientTimeline/` (57) · `EncounterTimeline/` (48) ·
`ServiceRequestTimeline/` (52) · `DefaultResourceTimeline/` (29)

### 7.1 Public API

```ts
// ResourceTimeline/ResourceTimeline.tsx:42
export interface ResourceTimelineProps<T extends Resource> {
  readonly value: T | Reference<T>;
  readonly loadTimelineResources: (
    medplum: MedplumClient,
    resourceType: ResourceType,
    id: string
  ) => Promise<PromiseSettledResult<Bundle>[]>;
  readonly createCommunication?: (resource: T, sender: ProfileResource, text: string) => Communication;
  readonly createMedia?: (resource: T, operator: ProfileResource, attachment: Attachment) => Media;
  readonly getMenu?: (context: ResourceTimelineMenuItemContext) => ReactNode;
}

// Timeline/Timeline.tsx:18  TimelineProps { children? }
// Timeline/Timeline.tsx:26
export interface TimelineItemProps<T extends Resource = Resource> extends PanelProps {
  // ← PaperProps
  readonly resource: T;
  readonly profile?: Reference;
  readonly dateTime?: string;
  readonly padding?: boolean;
  readonly popupMenuItems?: ReactNode;
}
```

The four concrete timelines are 29-57 LOC wrappers that only supply `loadTimelineResources` and the
`createCommunication`/`createMedia` factories, e.g. `ServiceRequestTimeline.tsx:19-30` fires six
parallel searches (`readHistory`, Communication, DiagnosticReport, Media, DocumentReference, Task)
via `Promise.allSettled`. Each also does `extends Pick<ResourceTimelineProps<T>, 'getMenu'>`, so
`getMenu` is the single customization channel.

### 7.2 Behavior contract

- `loadTimelineResources` returns `PromiseSettledResult<Bundle>[]` — **partial failure is the
  designed norm**; rejected entries are skipped and the rest render.
- State (`ResourceTimeline.tsx:57-64`): `history`, `items`, `countToShow` (starts at 10), an
  `itemsRef` mirror, and `inputRef` for the comment box.
- Ordering: `sortByDateAndPriority(newItems, resource)` (`utils/date.ts:36`, line 86 here) — a
  priority-aware sort that must port exactly; `utils/date.test.ts` (86 LOC) pins it.
- Paging: `itemsToShow = items.filter(Boolean).slice(0, countToShow)` (line 241); a "Show More"
  button adds 10 (line 318).
- `createComment(text)` (line 154) builds a `Communication` via `props.createCommunication` and
  posts it, then clears `inputRef.current` (line 252); `createMedia(attachment)` (line 169)
  requires `props.createMedia` and posts a `Media`.
- Upload progress is reported through the notification system:
  `showNotification` at line 200 then `updateNotification` at 178, 188, 211, 222 — a **single
  notification mutated across start/progress/success/error**. Any `sonner` abstraction must support
  a stable id + update, not just fire-and-forget.
- `TimelineItem` renders a `Panel` with `data-testid="timeline-item"`, resolving the author from
  `profile ?? resource.meta.author`, honoring `meta.onBehalfOf`, and defaulting `dateTime` to
  `meta.lastUpdated` (`Timeline.tsx:34-48`).

### 7.3 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `Menu` for the per-item popup (`popupMenuItems`/`getMenu`); the
  notification update lifecycle described above.
- **Cosmetic:** `Paper`/`Panel`, `Group`, `Text`, `Button`, `Container`.
- CSS modules: `ResourceTimeline.module.css` (3 LOC), `Timeline.module.css` (7 LOC) — trivial.

### 7.4 shadcn targets

`Card` (replacing `Panel`/`Paper`) · `DropdownMenu` · `Button` · `sonner` with `toast.loading` +
`toast.success(id)` for the upload lifecycle.

### 7.5 Difficulty and effort

**2/5.** `TimelineItemProps extends PanelProps` (which extends `PaperProps`) is the only public-API
break. **~700 LOC touched, ~150 real.**

---

<a name="group-8"></a>

## Group 8 — Autocomplete family

`AsyncAutocomplete/` (400) · `ValueSetAutocomplete/` (188) · `ReferenceInput/` (283) ·
`ResourceInput/` (55 + `MultiResourceInput` 245) · `CodeableConceptInput/` (67) ·
`CodingInput/` (55) · `CodeInput/` (43) · `ResourceTypeInput/` (49)

**This is the highest-risk port in the library.** `AsyncAutocomplete` is the only place where
Mantine behavior — not styling — is the product. Ten-plus components sit on top of it, and
`test-utils/asyncAutocomplete.ts` encodes its timing into every consumer's tests.

### 8.1 Public API

```ts
// AsyncAutocomplete/AsyncAutocomplete.tsx:13
export interface AsyncAutocompleteOption<T> extends ComboboxItem {
  // ← Mantine ComboboxItem
  readonly active?: boolean;
  readonly resource: T;
}

// :18
export interface AsyncAutocompleteProps<T> extends Omit<
  ComboboxProps, // ← Mantine ComboboxProps
  'data' | 'defaultValue' | 'loadOptions' | 'onChange' | 'onCreate' | 'searchable'
> {
  readonly name?: string;
  readonly label?: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly defaultValue?: T | T[];
  readonly toOption: (item: T) => AsyncAutocompleteOption<T>;
  readonly loadOptions: (input: string, signal: AbortSignal) => Promise<T[]>;
  readonly itemComponent?: (props: AsyncAutocompleteOption<T>) => JSX.Element | ReactNode;
  readonly pillComponent?: (props: {
    item: AsyncAutocompleteOption<T>;
    disabled?: boolean;
    onRemove: () => void;
  }) => JSX.Element;
  readonly emptyComponent?: (props: { search: string }) => JSX.Element | ReactNode;
  readonly onChange: (item: T[]) => void;
  readonly onCreate?: (input: string) => T;
  readonly creatable?: boolean;
  readonly clearable?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly placeholder?: string;
  readonly leftSection?: ReactNode;
  readonly maxValues?: number;
  readonly optionsDropdownMaxHeight?: number; // default 320
  readonly minInputLength?: number; // default 0
}
```

Descendants: `ValueSetAutocompleteProps` (`ValueSetAutocomplete.tsx:15`, `Omit<AsyncAutocompleteProps
<ValueSetExpansionContains>, 'loadOptions'|'toKey'|'toOption'>` + `binding`, `creatable`,
`clearable`, `expandParams`, `withHelpText`); `CodeableConceptInputProps`
(`CodeableConceptInput.tsx:10`, intersects `ValueSetAutocompleteProps` with
`ComplexTypeInputProps<CodeableConcept>`); `CodingInputProps` (`CodingInput.tsx:10`);
`CodeInputProps` (`CodeInput.tsx:9`); `ReferenceInputProps<T>` (`ReferenceInput.tsx:13`);
`ResourceInputProps<T>` (`ResourceInput.tsx:9`); `MultiResourceInputProps<T>`
(`MultiResourceInput.tsx:130`); `ResourceTypeInputProps` (`ResourceTypeInput.tsx:8`).

### 8.2 Behavior contract — exhaustively

Read from `AsyncAutocomplete.tsx` lines 49-400. A `Command`+`Popover` reimplementation must
reproduce **all** of this:

**Store setup** (lines 50-53): `useCombobox({ onDropdownClose: () => resetSelectedOption(),
onDropdownOpen: () => updateSelectedOptionIndex('active') })`. So closing clears the highlight, and
opening highlights the currently-selected option.

**State** (lines 78-83): `search`, `timer`, `abortController`, `selected` (seeded
`toDefaultItems(defaultValue).map(toOption)`), `options`. Seven refs mirrored in a `useLayoutEffect`
(lines 87-99): `searchRef`, `lastLoadOptionsRef`, `lastValueRef`, `timerRef`,
`abortControllerRef`, `autoSubmitRef`, `selectedRef`. The refs exist so the debounce callback reads
current values without re-subscribing — port the pattern, not just the behavior.

**Debounce** (`handleSearchChange`, lines 182-204): **100 ms**, `window.setTimeout`. On every
keystroke: open the dropdown if there are already options or `creatable`; call
`combobox.updateSelectedOptionIndex()`; set `search`; **abort any in-flight request**; clear the
previous timer; schedule `handleTimer`.

**Fetch** (`handleTimer`, lines 139-180):

- Skip entirely if `search === lastValueRef.current && loadOptions === lastLoadOptionsRef.current`
  (identity of the `loadOptions` function participates in cache invalidation — consumers must
  memoize it).
- Skip if `search.length < minInputLength`.
- New `AbortController` per request; `loadOptions(search, signal)`.
- On success and not aborted: `setOptions(newValues.map(toOption))`; **if `autoSubmitRef` is set,
  immediately select `newOptions[0]`** and clear the flag; else open the dropdown when
  `newValues.length > 0`.
- On error: swallow if aborted or the message contains `'aborted'`, else
  `showNotification({ color: 'red', message: normalizeErrorString(err) })` (line 173).
- Unmount cleanup aborts the in-flight controller (lines 270-276).

**Selection** (`handleValueAdd`, lines 100-137):

- Deduplicate by `option.value`.
- `maxValues === 0` is special: fire `onChange([item.resource])` and **clear** `selected` (a
  fire-and-forget search box, used by the header/navbar search).
- Otherwise append, then `shift()` from the front while over `maxValues` (a full cap evicts the
  oldest, it does not reject the new pick).
- On reaching the cap: clear `search`, clear `options`, `closeDropdown()` — because the input is
  about to be hidden and would otherwise leave a stale dropdown.
- `onChange(newSelected.map(v => v.resource))` on every change.

**Toggle** (`toggleSelected`, lines 205-232): selecting an already-selected value **removes** it.
Otherwise find the option; if missing and `creatable !== false && onCreate`, call
`onCreate(value)` and `toOption` the result. The sentinel value `'$create'` (lines 236-241) means
"create from the current search text": clear `search`, then `toggleSelected(search)`.

**Removal** (`handleValueRemove`, lines 246-252): filter by value, `onChange`, `setSelected`.

**Keyboard** (`handleKeyDown`, lines 254-268) — only two keys are handled here; everything else is
Mantine's:

- `Enter` while `timer || abortController` (results not in yet) sets `autoSubmitRef = true`, so the
  first result auto-selects when it lands. **This is the behavior most likely to be dropped in a
  naive port**, and `selectAutocompleteOption` in the test helpers exercises it.
- `Backspace` with an empty search: `killEvent(e)` and remove the last pill.
- Arrow Up/Down/Home/End/Escape/Tab and `onOptionSubmit` come from `useCombobox` +
  `Combobox.EventsTarget`.

**Blur** (lines 318-321): `closeDropdown()` **and clear `search`**.

**Clear button** (lines 279-291): rendered only when `!disabled && clearable && selected.length > 0`,
`title="Clear all"`; clears search, selection, calls `onChange([])`, closes dropdown.

**Right section** (line 305): `abortController ? <Loader size={16}/> : clearButton` — the spinner
replaces the clear button while loading.

**Dropdown visibility** (lines 293-294): `createVisible = creatable && search.trim().length > 0`;
`comboboxVisible = options.length > 0 || createVisible`; `Combobox.Dropdown hidden={!comboboxVisible}`.

**Empty state** (line 348): only when `!creatable && search.trim().length > 0 && options.length === 0`.

**Input field** (lines 310-324): `PillsInput.Field` with **`role="searchbox"`** — the selector tests
use everywhere. `onFocus={handleSearchChange}` means focusing triggers a load with the current
(usually empty) search.

**Input visibility** (line 308): the field renders only when
`!disabled && (maxValues === undefined || maxValues === 0 || selected.length < maxValues)`.

**Test ids** (`AsyncAutocomplete.utils.ts`, 3 LOC):
`AsyncAutocompleteTestIds.selectedItems` on the `Pill.Group` (line 297) and
`.options` on the dropdown (line 327).

**Defaults**: `DefaultItemComponent` shows an `IconCheck` when active (lines 361-368);
`DefaultPillComponent` is a `Pill withRemoveButton={!disabled}` (lines 370-384);
`DefaultEmptyComponent` is `Combobox.Empty` with "Nothing found".

### 8.3 Descendant behavior

- **`ValueSetAutocomplete`** (188 LOC): `loadOptions` → `medplum.valueSetExpand({ url: binding,
filter: input, count, ...expandParams })`. `toKey` returns `element.code` or
  `JSON.stringify(element)` (lines 26-31); `getDisplay` falls back to the key (lines 33-37).
  `withHelpText` appends the system/code as secondary text.
- **`CodeableConceptInput`** (67 LOC): `valueSetElementToCodeableConcept(newValues)`; deliberately
  strips `outcome`/`path`/`valuePath` out of `rest` so they don't reach the Mantine `Combobox`
  (lines 22-26) — a spread hazard to remember when the base props change.
- **`CodingInput`** (55): single `Coding`; can seed from a `QuestionnaireResponseItem` answer
  (line 19). **`CodeInput`** (43): single `code` string.
- **`ReferenceInput`** (283): a target-type selector plus the search box. Target types are a
  discriminated union of `BaseTargetType` / `ProfileTargetType` (lines 25-35) so profiles and plain
  resource types can coexist; `searchCriteria` is forwarded to the search.
- **`ResourceInput`** (55) is a thin single-value wrapper; **`MultiResourceInput`** (245) is the
  multi-select variant.
- **`ResourceTypeInput`** (49): autocomplete over the `ResourceType` enum, no network.

### 8.4 Mantine: load-bearing vs cosmetic

**Almost everything here is load-bearing.** `Combobox` + `useCombobox` (store, dropdown lifecycle,
arrow-key navigation, `onOptionSubmit`, `active` option index), `Combobox.EventsTarget`/
`DropdownTarget` (event wiring), `Combobox.ClearButton`, `Combobox.Empty`, `PillsInput` +
`PillsInput.Field` + `Pill` + `Pill.Group` (the multi-value input pattern),
`ScrollAreaAutosize` (`mah`), `withinPortal`. Only `Group` and `Loader` are cosmetic.

### 8.5 shadcn target and the gap

Nearest primitives: `Command` (`CommandInput`/`CommandList`/`CommandItem`/`CommandEmpty`/
`CommandGroup`) inside a `Popover`, per the shadcn "Combobox" recipe, plus `ScrollArea` and
`Badge`-as-pill.

Known gaps to close by hand:

1. **`cmdk` owns filtering.** Options here are server-filtered; set `shouldFilter={false}` on
   `Command` or every keystroke double-filters.
2. **No pills input.** `PillsInput` must be rebuilt: a bordered flex container of `Badge`s with
   remove buttons plus a borderless `<input>`, keeping `role="searchbox"`, the empty-Backspace
   removal, and the "hide the input at `maxValues`" rule.
3. **No imperative store.** `useCombobox`'s `openDropdown`/`closeDropdown`/`resetSelectedOption`/
   `updateSelectedOptionIndex('active')` become `Popover` `open` state plus `cmdk`'s `value`
   (highlighted item) — the `'active'` behavior needs `value` set to the selected option on open.
4. **Focus interaction.** `Popover` steals focus by default; use
   `onOpenAutoFocus={(e) => e.preventDefault()}` so typing continues in the input.
5. Keep the sentinel `'$create'` item and the `onOptionSubmit` contract so descendants don't change.

**Recommendation:** port `AsyncAutocomplete` first, alone, and port
`test-utils/asyncAutocomplete.ts` alongside it. If the 100 ms debounce, `role="searchbox"`, the
`$create` sentinel and the Enter-auto-submit survive, the ten descendants need only import changes.

### 8.6 Difficulty and effort

**5/5** for `AsyncAutocomplete` — the one component in the library where a rewrite can silently
break dozens of test suites. **2/5** for every descendant.
**~1,400 LOC touched; ~600 genuinely new** (≈400 for the combobox + pills input, ≈200 spread over
the descendants).

---

<a name="group-9"></a>

## Group 9 — Date/time

`CalendarDateInput/` (285 + 81 utils + 76 hook) · `CalendarInput/` (26) · `DateTimeInput/` (61) ·
`TimingInput/` (253) · `PeriodInput/` (46) · `Scheduler/` (241)

### 9.1 Public API

```ts
// CalendarDateInput/CalendarDateInput.tsx:20
export interface CalendarDateInputProps {
  readonly availableDates: Date[];
  readonly onChangeMonth: (date: Date) => void;
  readonly onClick: (date: Date) => void; // the day picked
  readonly month?: Date;
  readonly selected?: Date; // ignored while dragging
  readonly allowUnavailableDates?: boolean;
  readonly earliestDate?: Date;
  readonly range?: { readonly start: Date; readonly end: Date };
  // + onChangeRange(start, end) for drag / shift-click
}

// CalendarInput/CalendarInput.tsx:9   @deprecated — { slots, onChangeMonth, onClick }
// DateTimeInput/DateTimeInput.tsx:10  extends PrimitiveTypeInputProps
// TimingInput/TimingInput.tsx:27      extends ComplexTypeInputProps<Timing> { defaultModalOpen? }
// PeriodInput/PeriodInput.tsx:11      extends ComplexTypeInputProps<Period>
// Scheduler/Scheduler.tsx:148         { schedule?, fetchSlots?, onSelectSlot?, children? }
```

### 9.2 Behavior contract

- **`CalendarDateInput`** is a **hand-rolled month grid**, not a Mantine `Calendar` — the only
  Mantine imports are `Button` and `Group`. 1,090 test LOC + 86 LOC CSS module. Supporting files:
  `CalendarDateInput.utils.ts` (81, pure, 24 test LOC) and `useDayRangeDrag.ts` (76) which owns
  drag-to-select-a-range and shift-click. `selected` is ignored mid-drag (documented at line 26-27);
  `range` ends may carry a time of day and only the calendar day is used (lines 31-33).
  `availableDates`/`allowUnavailableDates`/`earliestDate` gate which cells are clickable.
- **`CalendarInput`** (26 LOC) is a deprecated shim: maps `slots` to
  `availableDates = slots.map(s => new Date(s.start))` and forwards to `CalendarDateInput`.
- **`DateTimeInput`** (61 LOC) wraps `<input type="datetime-local">`; its whole purpose is timezone
  reconciliation, since ISO-8601 carries an offset and `datetime-local` does not (doc comment lines
  19-25). Pure logic, one `TextInput` import.
- **`TimingInput`** (253 LOC): displays `formatTiming(value) || 'No repeat'` in a span with
  `data-testid="timinginput-display"` (line 38) beside an Edit `Button`; the editor is a Mantine
  `Modal` (`closeButtonProps={{ 'aria-label': 'Close' }}`, line 137) with `NativeSelect`,
  `TextInput`, `Switch`, `Chip` (day-of-week) controls. `open` state is
  `!props.disabled && (props.defaultModalOpen ?? false)` (line 33), so `disabled` cannot be
  bypassed via the default-open prop.
- **`PeriodInput`** (46 LOC): two `DateTimeInput`s; reads
  `ElementsContext.getExtendedProps(path + '.start'|'.end')` (lines 15-19) so per-field
  readonly/hidden from the access policy applies to each end independently.
- **`Scheduler`** (241 LOC): resolves one or many `Schedule`s, calls `fetchSlots`, renders the
  calendar plus a time-slot list; `onlyPractitioner(schedule)` (line 156) extracts a single
  practitioner actor. `showNotification` on booking failure (line 209).
  `Scheduler.module.css` is 15 LOC.

### 9.3 Mantine: load-bearing vs cosmetic

- **Load-bearing:** `Modal` in `TimingInput`; `Switch` and `Chip` (→ Radix `Switch`, `ToggleGroup`).
- **Cosmetic:** `Button`, `Group`, `Stack`, `Box`, `Text`, `NativeSelect`, `TextInput`, `Loader`.
- The calendar grid itself has **no Mantine dependency worth speaking of** — it is `<button>`s in a
  CSS grid.

### 9.4 shadcn targets

Do **not** replace `CalendarDateInput` with shadcn's `Calendar` (react-day-picker): it would drop
`availableDates`, `earliestDate`, drag ranges and the 1,090 LOC of tests. Restyle the existing grid
with Tailwind + `cva` for the day-cell states. Otherwise: `Dialog`, `Switch`, `ToggleGroup`,
`Select`, `Input type="datetime-local"`.

### 9.5 Difficulty and effort

**2/5.** `CalendarDateInput` is high-LOC but low-coupling; `DateTimeInput`/`PeriodInput` are nearly
free. **~740 LOC touched, ~150 real** (mostly the 86-LOC calendar CSS module and the `TimingInput`
modal).

---

<a name="group-10"></a>

## Group 10 — Auth and the long tail

### `auth/` — 14 files, 1,625 LOC, 1 CSS module (`ProjectLoginOption.module.css`, 40)

- Files: `AuthenticationForm` (236), `SignInForm` (234), `NewUserForm` (174),
  `ChooseProfileForm` (129), `ResetPasswordForm` (121), `MfaEnrollForm` (97), `ChooseScopeForm` (92),
  `SetPasswordForm` (88), `RegisterForm` (84), `MfaForm` (81), `MfaVerificationForm` (81),
  `ChangePasswordForm` (73), `NewProjectForm` (69), `ProjectLoginOption` (52).
- Multi-step login state machine driven by `medplum.startLogin` / `startNewUser` /
  `startNewProject`; the components hand off to each other via login-response fields, not routing.
- Errors go to `showNotification({ color:'red', … })` — `SignInForm.tsx:80, 141, 161` and
  `MfaVerificationForm.tsx:45`.
- Uses `useLocalStorage` (`@mantine/hooks`) for remembered logins and `Combobox`/`useCombobox`
  directly in one place (per the inventory) — that one instance follows group 8.
- reCAPTCHA v3 via `utils/recaptcha.ts` (36 LOC, `initRecaptcha`/`getRecaptcha`) and
  `utils/script.ts` (16 LOC, `createScriptTag`). Pure DOM, no Mantine.
- Mantine coupling: cosmetic except `Combobox` and `Image`/`Center` layout. **2/5, ~1,300 LOC
  touched, ~200 real.**

### `GoogleButton/` (61) + `PatientAccountsForm/` (348) + `PatientExportForm/` (225)

- `GoogleButton`: injects the GSI script and renders Google's own button in a `Box`; brand-locked
  markup, so hands off. **1/5.**
- `PatientAccountsForm`: `notifications.show()` at lines 97, 125 and `notifications.update()` at
  144, 157 — another update-in-place lifecycle. **2/5.**
- `PatientExportForm`: `notifications.show()` at 93, `update()` at 112 and 123, tracking a
  long-running export. **2/5.**

### `SmartAppLaunchLink/` (82)

- `SmartAppLaunchLinkProps extends AnchorProps` (line 11) — public-API break.
- Creates a SMART launch context then opens the app; failure toast is
  `showNotification({ …, autoClose: false })` (line 74) — the only site that opts out of auto-close,
  so the toast abstraction needs a persistent mode. **1/5.**

### `SignatureInput/` (90)

- `SignatureInputProps extends PaperProps` (line 14) — public-API break.
- Wraps `signature_pad` on a `<canvas>`; owns resize/DPR handling and a clear button. Mantine is
  only the `Paper` frame. **2/5** (canvas sizing is fiddly under Tailwind).

### `QrCodeScanner/` (190)

- `jsQR` over `getUserMedia` + `requestAnimationFrame`; the component manages camera permissions,
  the video element and teardown. No meaningful Mantine coupling. **1/5.**

### Attachment family — `AttachmentInput` (50) · `AttachmentButton` (85) · `AttachmentDisplay` (71 + `ScannedImage` 52) · `AttachmentArrayInput` (81) · `AttachmentArrayDisplay` (42)

- `AttachmentButton` is the upload engine: hidden `<input type="file">`, `medplum.createBinary` with
  progress, and the `onUpload`/`onUploadStart`/`onUploadProgress`/`onUploadError` callback set the
  timeline consumes (§7.2). Zero Mantine (`AttachmentButtonProps` at line 10 is plain).
- `AttachmentDisplay` uses `useCachedBinaryUrl`; `Anchor` + `Loader` only. **1-2/5 each.**

### Display-only components

| Component                                                                   | LOC | Notes                                                                                                                                                                                                                                   | Rating |
| --------------------------------------------------------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `CcdaDisplay/`                                                              | 157 | renders CDA in an iframe via `sendCommand()` (`utils/dom.ts`) postMessage; one `Button`                                                                                                                                                 | 2/5    |
| `DiagnosticReportDisplay/`                                                  | 595 | biggest display component; `Divider`/`Group`/`List`/`Stack`/`Text`/`Title` + 43 LOC CSS module for the results table; all cosmetic                                                                                                      | 2/5    |
| `MeasureReportDisplay/`                                                     | 31  | trivial                                                                                                                                                                                                                                 | 1/5    |
| `ResourceTable/`                                                            | 90  | `ResourcePropertyDisplay` rows; cosmetic                                                                                                                                                                                                | 1/5    |
| `ResourceHistoryTable/`                                                     | 86  | version list                                                                                                                                                                                                                            | 1/5    |
| `ResourceDiff/` (52) + `ResourceDiffTable/` (181) + `ResourceDiffRow/` (66) | 299 | driven by pure `utils/diff.ts` (156 LOC, 69 test LOC); three small CSS modules (8/27/8)                                                                                                                                                 | 2/5    |
| `ResourceBlame/`                                                            | 75  | driven by pure `utils/blame.ts` (90 LOC, 169 test LOC); 63 LOC CSS module doing the gutter/heat colors                                                                                                                                  | 2/5    |
| `FhirPathTable/`                                                            | 199 | evaluates FHIRPath columns; `Button`/`Loader`/`Table`                                                                                                                                                                                   | 2/5    |
| `StatusBadge/`                                                              | ~85 | `statusToColor: Record<string, DefaultMantineColor>` at line 30 and `StatusBadgeProps extends Omit<BadgeProps,'children'>` at line 71 — **the color map must be re-expressed as `cva` variants**; renders `status.replaceAll('-', ' ')` | 2/5    |
| `OperationOutcomeAlert/`                                                    | ~40 | `extends AlertProps`                                                                                                                                                                                                                    | 1/5    |

### Editors / builders

| Component                | LOC               | Notes                                                                                                                        | Rating |
| ------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| `ReferenceRangeEditor/`  | 454               | nested add/remove of reference-range groups; 8 LOC CSS module                                                                | 3/5    |
| `PlanDefinitionBuilder/` | 410               | same selected/hover key pattern as `QuestionnaireBuilder`; 14 LOC CSS module                                                 | 3/5    |
| `ResourceBoard/`         | 161               | kanban columns via `useResourceBoard`; column layout is Mantine flex                                                         | 2/5    |
| `ListWithDetailPane/`    | 246 + 36 skeleton | master/detail with `Pagination`, `Tabs`, `ScrollArea`, `Skeleton`; **123 LOC CSS module** — the second-largest styling asset | 3/5    |

### Misc leaves worth naming

`Panel/` (`PanelProps extends PaperProps`, 22 LOC CSS), `Container/`
(`ContainerProps` re-exported, 6 LOC CSS), `PasswordInput/` (wraps Mantine `PasswordInput` purely to
set `visibilityToggleButtonProps` tab-order, lines 14-22), `SensitiveTextarea/`
(`extends TextareaProps, RefAttributes<HTMLTextAreaElement>`; copy toast at line 50),
`Form/SubmitButton` (`SubmitButtonProps = Omit<ButtonProps,'type'|'loading'>`),
`buttons/ArrayAddButton`+`ArrayRemoveButton` (60 LOC total), `ErrorBoundary/` (72),
`Loading/` (13), `InfoBar/` (42 + 25 CSS), `DescriptionList/` (30 + 40 CSS),
`NoteDisplay/` (12 CSS).

---

<a name="cross-cutting"></a>

## Cross-cutting concerns

### C.1 `src/stories/` — shared story infrastructure

7 files, ~2,420 LOC, of which **~2,350 is FHIR fixture data, not infrastructure**:

| File                       | LOC | Contents                                                      |
| -------------------------- | --- | ------------------------------------------------------------- |
| `covid19.ts`               | 973 | COVID-19 questionnaire/observation fixtures                   |
| `referenceLab.ts`          | 757 | reference-lab report fixtures                                 |
| `healthgorilla.ts`         | 473 | Health Gorilla integration fixtures                           |
| `labPanel.ts`              | 144 | lab panel fixtures                                            |
| `decorators.tsx`           | 12  | `withMockedDate`                                              |
| `MockDateWrapper.tsx`      | 38  | the fake-clock provider                                       |
| `MockDateWrapper.utils.ts` | 23  | `MockDateContext`, `DEFAULT_MOCKED_DATE`, `createGlobalTimer` |

The only real infrastructure:

```tsx
// stories/decorators.tsx (entire file)
export const withMockedDate: Decorator = (Story) => (
  <MockDateWrapper>
    <Story />
  </MockDateWrapper>
);
```

`MockDateWrapper` installs `sinon.useFakeTimers({ now: DEFAULT_MOCKED_DATE, shouldAdvanceTime: false,
toFake: ['Date'] })` in an effect, renders `null` until installed, restores on unmount, and exposes
`advanceSystemTime(seconds = 60)` through `MockDateContext`. `DEFAULT_MOCKED_DATE` is
`new Date(2020, 4, 4, 12, 5)` (`MockDateWrapper.utils.ts:14`). The context is deliberately cast from
`undefined` so using it without the decorator crashes loudly (comment at line 11).

There is **no shared MockClient decorator** — each `.stories.tsx` constructs its own
`MockClient`/`MedplumProvider` locally. That is good news: the 108 story files are portable as
behavioral references with only a provider-wrapper change, and the four fixture files move verbatim.
Note `Date`-only faking means Storybook's clock is frozen but timers still run, which is why
autocomplete stories behave.

### C.2 `src/test-utils/` and `src/test.setup.ts`

```tsx
// test-utils/render.tsx (entire file, 22 LOC)
import { MantineProvider } from '@mantine/core';
export function render(ui, wrapper?) {
  return testingLibraryRender(ui, {
    wrapper: ({ children }) => (
      <MantineProvider theme={{}}>{wrapper ? wrapper({ children }) : children}</MantineProvider>
    ),
  });
}
export { act, fireEvent, screen, userEvent, waitFor, within };
export { clickAutocompleteOption, selectAutocompleteOption, typeInAutocomplete } from './asyncAutocomplete';
```

**One file is the entire Mantine coupling in the test harness.** `MantineProvider theme={{}}` becomes
either nothing at all or a small `ThemeProvider`, and 154 test files keep importing `render` from the
same place. `MedplumProvider`/`MockClient` are passed per-test as the optional `wrapper`.

`test-utils/asyncAutocomplete.ts` (60 LOC) is the one place the group-8 timing is encoded:

- `AUTOCOMPLETE_DEBOUNCE_MS = 1000` — "the 100 ms debounce plus buffer".
- `typeInAutocomplete(input, text)`: `fireEvent.change` then
  `vi.advanceTimersByTimeAsync(1000)`, both inside `act`.
- `clickAutocompleteOption(text)`: `await screen.findByText` then click.
- `selectAutocompleteOption(input, searchText, optionText?, downCount = 1)`: type, optionally wait
  for the option, then `downCount` × `ArrowDown` + `Enter`.

Keeping these three helpers green is the acceptance test for the group-8 port.

`test.setup.ts` (49 LOC) is jsdom plumbing plus FHIR schema indexing, all Mantine-independent:
`TextDecoder`/`TextEncoder` (lines 10-11), a `getComputedStyle` passthrough (13-14),
`matchMedia` mock (16-27), a `ResizeObserver` stub class (29-36), `Element.prototype.scrollIntoView =
vi.fn()` (41), then `indexStructureDefinitionBundle` for `profiles-types` / `profiles-resources` /
`profiles-medplum` and every `SEARCH_PARAMETER_BUNDLE_FILES` (43-48), and a `MemoryStorage`
`sessionStorage` (49). Note `matchMedia`, `ResizeObserver` and `scrollIntoView` were added for
Mantine but are equally needed by Radix — keep all three.

### C.3 `src/utils/` — purity audit

| File                       | LOC | Exports                                                                                              | Mantine?                                                                                                                                                                           |
| -------------------------- | --- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.ts`                   | 10  | `getAppName()` — reads `import.meta.env.MEDPLUM_APP_NAME`                                            | pure                                                                                                                                                                               |
| `date.ts`                  | 93  | `compareByLastUpdatedDescending` (:12), `sortByDateAndPriority` (:36)                                | pure (86 test LOC)                                                                                                                                                                 |
| `dom.ts`                   | 103 | `killEvent` (:12), `isAuxClick` (:22), `isCheckboxCell` (:32), `sendCommand`, `exportJsonFile` (:88) | pure (81 test LOC)                                                                                                                                                                 |
| `outcomes.ts`              | 48  | `getErrorsForInput` (:5), `getIssuesForExpression` (:15)                                             | pure (59 test LOC)                                                                                                                                                                 |
| `pagination.ts`            | 25  | `getPaginationControlProps` (:11)                                                                    | **Mantine-shaped** — returns `{ 'aria-label': … }` for Mantine `Pagination`'s `getControlProps`; the doc comment even links Mantine v7 docs. Keep the strings, change the consumer |
| `recaptcha.ts`             | 36  | `initRecaptcha` (:15), `getRecaptcha` (:26)                                                          | pure                                                                                                                                                                               |
| `script.ts`                | 16  | `createScriptTag` (:9)                                                                               | pure                                                                                                                                                                               |
| `loadState.ts`             | 12  | `LoadState` type                                                                                     | pure                                                                                                                                                                               |
| `blame.ts`                 | 90  | blame computation                                                                                    | pure (169 test LOC)                                                                                                                                                                |
| `diff.ts`                  | 156 | resource diffing                                                                                     | pure (69 test LOC)                                                                                                                                                                 |
| `maybeWrapWithContext.tsx` | 15  | `maybeWrapWithContext(Provider, value, contents)`                                                    | pure                                                                                                                                                                               |
| `maybeWrapWithTooltip.tsx` | 10  | `READ_ONLY_TOOLTIP_TEXT`, `maybeWrapWithTooltip`                                                     | **imports `Tooltip` from `@mantine/core`** and uses `Tooltip.Floating`                                                                                                             |

So: **exactly one util imports Mantine** (`maybeWrapWithTooltip.tsx`, 10 LOC) and one is
Mantine-shaped without importing it (`pagination.ts`). Everything else — 630 LOC with 464 LOC of
tests — moves untouched.

### C.4 `@mantine/notifications` call sites

20 calls across 14 files. Three distinct patterns, and a `toast` abstraction must cover all three.

**A. Fire-and-forget `showNotification({ color, message })`** — the common case:

| File:line                                                         | Note                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `AsyncAutocomplete/AsyncAutocomplete.tsx:173`                     | red, `loadOptions` failure                                         |
| `BookmarkDialog/BookmarkDialog.tsx:37, 41`                        | green `'Success'` / red error                                      |
| `SensitiveTextarea/SensitiveTextarea.tsx:50`                      | green `'Copied'`                                                   |
| `Scheduler/Scheduler.tsx:209`                                     | booking failure                                                    |
| `auth/SignInForm.tsx:80, 141, 161`                                | red login errors                                                   |
| `auth/MfaVerificationForm.tsx:45`                                 | red                                                                |
| `chat/BaseChat/BaseChat.tsx:58, 185, 211, 215, 220`               | includes the disconnect (red, :211) / reconnect (green, :215) pair |
| `chat/ThreadInbox/ThreadInbox.tsx:145, 154, 183, 268`             | red                                                                |
| `chat/ThreadInbox/NewTopicDialog.tsx:68`                          | red                                                                |
| `chat/ThreadInbox/EditThreadDialog.tsx:81`                        | red                                                                |
| `chat/ThreadInbox/ParticipantFilter.tsx:82`                       | red                                                                |
| `PatientSummary/PharmacyDialog.tsx:289, 303, 310, 336, 344, 351`  | 6 sites, add/update/delete outcomes                                |
| `QuestionnaireForm/AIRealTimeQuestionnaireForm.tsx:186, 236, 270` | transcript/bot failures                                            |

**B. Persistent (no auto-close)** — `SmartAppLaunchLink/SmartAppLaunchLink.tsx:74`
(`autoClose: false`). Needs `toast.error(msg, { duration: Infinity })`.

**C. Show-then-update by id** — a single notification mutated through a lifecycle:

- `ResourceTimeline/ResourceTimeline.tsx` — `showNotification` at 200,
  `updateNotification` at 178, 188, 211, 222 (upload start/progress/success/error).
- `PatientAccountsForm/PatientAccountsForm.tsx` — `notifications.show` at 97, 125;
  `notifications.update` at 144, 157.
- `PatientExportForm/PatientExportForm.tsx` — `notifications.show` at 93;
  `notifications.update` at 112, 123.

**Recommended abstraction** (one module, ~40 LOC, so no component imports `sonner` directly):

```ts
// e.g. src/toast.ts
export function notify(opts: { color?: 'red' | 'green'; message: string; id?: string; autoClose?: false }): string;
export function updateNotify(id: string, opts: { color?: 'red' | 'green'; message: string; loading?: boolean }): void;
```

mapped onto `sonner`'s `toast.error` / `toast.success` / `toast.loading` with a stable `id`.
Mantine's `color: 'red' | 'green'` is the only variant axis in use, so the mapping is total.

### C.5 CSS modules — all 44, 1,816 LOC

Layout/structure (must be reproduced):

| File                                                         | LOC     | Styles                                                                          |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------- |
| `AppShell/Navbar.module.css`                                 | 253     | link rows, icon rail, alert dot, dismiss button, user link, toggle, menu titles |
| `QuestionnaireForm/AIRealTimeQuestionnaireForm.module.css`   | 191     | voice banner, transcript viewport, layout                                       |
| `ListWithDetailPane/ListWithDetailPane.module.css`           | 123     | split-pane grid                                                                 |
| `AppShell/HeaderDropdown.module.css`                         | 107     | account section, project options, settings rows, segmented controls             |
| `chat/BaseChat/BaseChat.module.css`                          | 104     | message bubbles, alignment, input row                                           |
| `AppShell/Spotlight.module.css`                              | 90      | dialog body, actions list, group labels, shortcut hints, footer                 |
| `CalendarDateInput/CalendarDateInput.module.css`             | 86      | month grid + day-cell states                                                    |
| `QuestionnaireBuilder/QuestionnaireBuilder.module.css`       | 76      | selected/hovered item highlight                                                 |
| `PatientSummary/SummaryItem.module.css`                      | 73      | item card, gradient, hover chevron                                              |
| `ResourceBlame/ResourceBlame.module.css`                     | 63      | blame gutter + heat colors                                                      |
| `Modal/Modal.module.css`                                     | 54      | the flex chain for the pinned footer                                            |
| `PatientSummary/PatientSummary.module.css`                   | 44      | panel + list item                                                               |
| `AppShell/Header.module.css`                                 | 42      | logo button, user info                                                          |
| `DescriptionList/DescriptionList.module.css`                 | 40      | dl grid                                                                         |
| `auth/ProjectLoginOption.module.css`                         | 40      | login option rows                                                               |
| `SearchControl/SearchControl.module.css`                     | 35      | row hover, control hover, icon sizes                                            |
| `PatientSummary/CollapsibleSection.module.css`               | 35      | header, chevron, add button                                                     |
| `chat/ChatModal/ChatModal.module.css`                        | 28      | fixed positioning                                                               |
| `ResourceDiffTable/ResourceDiffTable.module.css`             | 27      | diff cells                                                                      |
| `InfoBar/InfoBar.module.css`                                 | 25      | bar entries                                                                     |
| `Panel/Panel.module.css`                                     | 22      | paper frame, fill                                                               |
| `AppShell/AppShell.stories.module.css`                       | 20      | story-only                                                                      |
| `AppShell/HeaderSearchInput.module.css`                      | 19      | search box                                                                      |
| `PatientSummary/PharmacyDialog.module.css`                   | 18      | dialog form layout                                                              |
| `Scheduler/Scheduler.module.css`                             | 15      | slot list                                                                       |
| `LinkTabs/LinkTabs.module.css`                               | 14      | tab links                                                                       |
| `PlanDefinitionBuilder/PlanDefinitionBuilder.module.css`     | 14      | builder items                                                                   |
| `NoteDisplay/NoteDisplay.module.css`                         | 12      | note text                                                                       |
| `ResourceForm/ResourceForm.module.css`                       | 11      | split button radii                                                              |
| `AppShell/AppShell.module.css`                               | 11      | `.main`, `.announcement`                                                        |
| `chat/ThreadInbox/*.module.css`                              | 8+7+6+3 | filter, inbox, list item, detail                                                |
| `ReferenceRangeEditor/ReferenceRangeEditor.module.css`       | 8       | row spacing                                                                     |
| `ResourceDiff/ResourceDiff.module.css`                       | 8       | wrapper                                                                         |
| `ResourceDiffRow/ResourceDiffRow.module.css`                 | 8       | row                                                                             |
| `FormSection/FormSection.module.css`                         | 7       | `.dimmed`, `.preserveBreaks`                                                    |
| `Timeline/Timeline.module.css`                               | 7       | spacing                                                                         |
| `Container/Container.module.css`                             | 6       | max width                                                                       |
| `BackboneElementInput/BackboneElementInput.module.css`       | 5       | `.nested` indent                                                                |
| `ResourceArrayInput/ResourceArrayInput.module.css`           | 5       | `.indented` border                                                              |
| `ResourceTimeline/ResourceTimeline.module.css`               | 3       | spacing                                                                         |
| `DiagnosticReportDisplay/DiagnosticReportDisplay.module.css` | 43      | results table                                                                   |

Practical read: **eight files (Navbar 253, AIRealTime 191, ListWithDetailPane 123, HeaderDropdown
107, BaseChat 104, Spotlight 90, CalendarDateInput 86, QuestionnaireBuilder 76 = 1,030 LOC) carry
57% of all CSS** and deserve deliberate Tailwind translation. The remaining 36 files average 22 LOC
and convert to a handful of utility classes each. Every one of them references
`var(--mantine-color-*)`, `var(--mantine-spacing-*)` and `light-dark()` — either provide a
compatibility layer of those variables mapped to Tailwind tokens (fast, ugly, reversible) or rewrite
them (slower, correct). Recommend the shim for the 36 small ones and rewrites for the eight large ones.

### C.6 Mantine theme/color APIs

Only four call sites in the whole library:

| Site                                            | API                                                                           | Why                                                    | Replacement                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ResourceForm/ResourceForm.tsx:3, 40`           | `useMantineTheme()`                                                           | `theme.primaryColor` for the split-button `ActionIcon` | drop; use the default button variant                                                                                                       |
| `AppShell/HeaderDropdown.tsx:3, 4, 76, 141`     | `useMantineColorScheme()`, `MantineColorScheme`                               | light/auto/dark `SegmentedControl`                     | a `useTheme()` from a `ThemeProvider` (next-themes-shaped) + `ToggleGroup`                                                                 |
| `AppShell/AnnouncementBanners.tsx:3, 11, 31-32` | `MantineColor` in the **public** `AppShellAnnouncement.color`                 | inline `var(--mantine-color-${color}-light)`           | a closed union (`'yellow'\|'red'\|'blue'\|…`) or a semantic set (`'warning'\|'error'\|'info'`) mapped through `cva` — **public-API break** |
| `StatusBadge/StatusBadge.tsx:3, 30`             | `DefaultMantineColor` in `statusToColor: Record<string, DefaultMantineColor>` | status→color map                                       | `cva` variants; **public-API break** (`StatusBadgeProps extends Omit<BadgeProps,'children'>`)                                              |

Beyond these, theme coupling is entirely through `var(--mantine-*)` in the CSS modules (§C.5) and
`size`/`radius`/`c`/`gap` shorthand props on layout components.

### C.7 Public API surfaces typed with Mantine props

Every one of these is exported from `src/index.ts` (166 LOC of re-exports) and therefore a breaking
change for consumers. Full list from a repo-wide `extends`/import scan:

| Component                    | File:line                                            | Mantine type                                                             |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `MedplumLinkProps`           | `MedplumLink/MedplumLink.tsx:11`                     | `AnchorProps`, `ElementProps<'a', keyof AnchorProps>`                    |
| `ResourceNameProps`          | `ResourceName/ResourceName.tsx:12`                   | `TextProps`                                                              |
| `ResourceAvatarProps`        | `ResourceAvatar/ResourceAvatar.tsx:12`               | `AvatarProps`                                                            |
| `PanelProps`                 | `Panel/Panel.tsx:9`                                  | `PaperProps`                                                             |
| `TimelineItemProps`          | `Timeline/Timeline.tsx:26`                           | `PanelProps` → `PaperProps`                                              |
| `BaseChatProps`              | `chat/BaseChat/BaseChat.tsx:109`                     | `PaperProps`                                                             |
| `SignatureInputProps`        | `SignatureInput/SignatureInput.tsx:14`               | `PaperProps`                                                             |
| `StatusBadgeProps`           | `StatusBadge/StatusBadge.tsx:71`                     | `Omit<BadgeProps,'children'>` + `DefaultMantineColor` map                |
| `OperationOutcomeAlertProps` | `OperationOutcomeAlert/OperationOutcomeAlert.tsx:10` | `AlertProps`                                                             |
| `LinkTabsProps`              | `LinkTabs/LinkTabs.tsx:18`                           | `Omit<TabsProps,'value'\|'onChange'>`                                    |
| `SensitiveTextareaProps`     | `SensitiveTextarea/SensitiveTextarea.tsx:11`         | `TextareaProps`                                                          |
| `SmartAppLaunchLinkProps`    | `SmartAppLaunchLink/SmartAppLaunchLink.tsx:11`       | `AnchorProps`                                                            |
| `AsyncAutocompleteProps<T>`  | `AsyncAutocomplete/AsyncAutocomplete.tsx:18`         | `Omit<ComboboxProps, …>`                                                 |
| `AsyncAutocompleteOption<T>` | `AsyncAutocomplete/AsyncAutocomplete.tsx:13`         | `ComboboxItem`                                                           |
| `ModalProps`                 | `Modal/Modal.tsx:35`                                 | `Omit<MantineModalProps, 'children'\|'onSubmit'\|'scrollAreaComponent'>` |
| `SubmitButtonProps`          | `Form/SubmitButton.tsx:9`                            | `Omit<ButtonProps,'type'\|'loading'>`                                    |
| `PasswordInput`              | `PasswordInput/PasswordInput.tsx:14`                 | takes `PasswordInputProps` directly                                      |
| `ContainerProps`             | `Container/Container.tsx`                            | re-exports Mantine `ContainerProps`                                      |
| `AppShellAnnouncement.color` | `AppShell/AnnouncementBanners.tsx:11`                | `MantineColor`                                                           |
| `SpotlightLinkAction`        | `AppShell/Spotlight.tsx:26`                          | `SpotlightActionData` (`@mantine/spotlight`)                             |

**Redesign guidance.** Three of these are unusually load-bearing and deserve a decision before any
code is written:

- `AsyncAutocompleteOption<T> extends ComboboxItem` — `ComboboxItem` is just
  `{ value: string; label: string; disabled?: boolean }`. Inline that shape and the whole
  autocomplete family sheds its Mantine type dependency for free. **Do this first.**
- `ModalProps` — every dialog in groups 3, 5, 6 flows through it. Define an explicit prop set
  (`opened`, `onClose`, `title`, `size`, `closeOnClickOutside`, `withCloseButton`, `zIndex`,
  `fullScreen`, `centered`) instead of `Omit<…>` on a foreign type.
- `SpotlightActionData` — `{ id, label, description?, onClick?, leftSection?, … }`. Define
  `SpotlightLinkAction` standalone.
  The `PaperProps`/`TextProps`/`AnchorProps`/`AvatarProps`/`BadgeProps`/`TabsProps` cases are all
  "pass style-ish props through to the underlying element"; the shadcn idiom is
  `React.ComponentProps<'div'>` (or `'a'`, `'span'`) plus a `variant`/`size` from `cva`. That is a
  strictly smaller surface, so document it as a breaking change rather than trying to emulate
  Mantine's `c`/`fw`/`size`/`radius`/`m*`/`p*` shorthands.

---

## Summary matrix

| #   | Group                     | Difficulty | LOC touched | LOC genuinely new | Gating risk                                                                |
| --- | ------------------------- | ---------- | ----------- | ----------------- | -------------------------------------------------------------------------- |
| 1   | Schema-driven form engine | 4/5        | ~1,900      | ~400              | error-expression matching; frozen-defaultValue semantics                   |
| 2   | Questionnaire engine      | 4/5        | ~1,900      | ~250              | new `Stepper`; `reportValidity` page gate; remount-key contract            |
| 3   | Search table              | 3/5        | ~1,300      | ~350              | `Modal` chrome; column `Menu` submenus; pagination `aria-label`s           |
| 4   | AppShell + leaves         | 4/5        | ~1,900      | ~600              | no shadcn Spotlight; responsive shell config; `MantineColor` in public API |
| 5   | PatientSummary            | 2/5        | ~2,700      | ~500              | breadth only; registry and hook port free                                  |
| 6   | Chat                      | 3/5        | ~1,300      | ~400              | scroll anchoring; replaceable connect/disconnect toasts                    |
| 7   | Timelines                 | 2/5        | ~700        | ~150              | `updateNotification` upload lifecycle; `PaperProps` break                  |
| 8   | Autocomplete family       | **5/5**    | ~1,400      | ~600              | debounce/abort/auto-submit/pills; `role="searchbox"`; `$create`            |
| 9   | Date/time                 | 2/5        | ~740        | ~150              | keep the hand-rolled calendar grid; don't adopt react-day-picker           |
| 10  | Auth + long tail          | 1-3/5      | ~5,500      | ~800              | `StatusBadge` color map; notification lifecycles; canvas sizing            |
| —   | Cross-cutting             | 2/5        | ~750        | ~150              | `render.tsx` (1 file), toast module (~40 LOC), CSS var shim                |

**Total: roughly 20,000 LOC touched, of which ~4,400 are genuine rewrites.** Against 29,318 source
LOC that tracks: about 15% of the library is real work and the rest is imports, classNames and
layout primitives.

**Recommended order.** (1) `test-utils/render.tsx` + the toast module + a `var(--mantine-*)` shim,
so everything else can proceed with green tests. (2) `Modal` — nine dialogs depend on it.
(3) `AsyncAutocomplete` with its three test helpers — ten components and most story files depend on
it. (4) Group 1's `FormSection`/`ElementsInput` seam. (5) Groups 5, 7, 9, 10 in parallel (low risk,
high file count). (6) Groups 3 and 6. (7) `AppShell` + Spotlight last, since it is the only place
needing net-new architecture and nothing else imports it.
