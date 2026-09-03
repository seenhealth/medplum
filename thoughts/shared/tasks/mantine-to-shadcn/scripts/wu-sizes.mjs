import { readFileSync } from 'node:fs';

const inv = readFileSync(new URL('../appendix-a-component-inventory.md', import.meta.url), 'utf8');
const loc = new Map();
for (const m of inv.matchAll(/^\| ([A-Za-z0-9_-]+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|/gm)) {
  loc.set(m[1], { loc: +m[3], storyFiles: +m[4], testFiles: +m[5], testLoc: +m[6] });
}
const sm = readFileSync(new URL('../appendix-b-story-matrix.md', import.meta.url), 'utf8');
const tc = new Map();
const section = sm.slice(sm.indexOf('# Test case baseline'));
for (const m of section.matchAll(/^\| ([A-Za-z0-9_-]+) \| (\d+) \| (\d+) \|/gm)) tc.set(m[1], { tests: +m[2], stories: +m[3] });

const wus = {
  'WU-02 libs': ['utils'],
  'WU-03 seams': ['Container', 'Panel', 'Document', 'FormSection', 'ElementsInput', 'CheckboxFormSection'],
  'WU-04 golden': ['HumanNameDisplay', 'HumanNameInput'],
  'WU-10': ['AddressDisplay', 'CodeableConceptDisplay', 'CodingDisplay', 'ContactDetailDisplay', 'ContactPointDisplay', 'IdentifierDisplay', 'MoneyDisplay', 'QuantityDisplay', 'RangeDisplay', 'RatioDisplay', 'ReferenceDisplay', 'FhirPathDisplay'],
  'WU-11': ['DescriptionList', 'NoteDisplay', 'Logo', 'StatusBadge', 'ResourceBadge', 'ResourceName', 'ResourceAvatar', 'UnavailableNote', 'ErrorBoundary', 'Loading', 'OperationOutcomeAlert', 'MedplumLink', 'ScrollToTop', 'LinkTabs', 'InfoBar', 'buttons'],
  'WU-12': ['AttachmentDisplay', 'AttachmentArrayDisplay', 'AttachmentButton', 'AttachmentInput', 'AttachmentArrayInput', 'SignatureInput', 'QrCodeScanner', 'CcdaDisplay'],
  'WU-13': ['AddressInput', 'AnnotationInput', 'ContactDetailInput', 'ContactPointInput', 'IdentifierInput', 'MoneyInput', 'PeriodInput', 'QuantityInput', 'RangeInput', 'RatioInput'],
  'WU-14': ['DateTimeInput', 'CalendarInput', 'CalendarDateInput', 'TimingInput', 'Form', 'PasswordInput', 'SensitiveTextarea'],
  'WU-15': ['AsyncAutocomplete'],
  'WU-16': ['ValueSetAutocomplete', 'CodeInput', 'CodingInput', 'CodeableConceptInput', 'ResourceTypeInput'],
  'WU-17': ['ResourceInput', 'ReferenceInput'],
  'WU-20': ['ResourcePropertyDisplay', 'ResourcePropertyInput', 'BackboneElementDisplay', 'BackboneElementInput', 'ResourceArrayDisplay', 'ResourceArrayInput', 'SliceDisplay', 'SliceInput', 'ExtensionDisplay', 'ExtensionInput'],
  'WU-21': ['ResourceForm', 'ResourceTable', 'ResourceHistoryTable', 'ResourceDiff', 'ResourceDiffRow', 'ResourceDiffTable', 'ResourceBlame', 'FhirPathTable'],
  'WU-22': ['SearchControl', 'SearchPopupMenu', 'SearchFieldEditor', 'SearchFilterEditor', 'SearchFilterValueInput', 'SearchFilterValueDisplay', 'SearchFilterValueDialog', 'SearchExportDialog', 'BookmarkDialog'],
  'WU-23': ['Modal', 'ListWithDetailPane', 'ResourceBoard'],
  'WU-24': ['QuestionnaireForm'],
  'WU-25': ['QuestionnaireBuilder', 'QuestionnaireResponseDisplay', 'PlanDefinitionBuilder', 'RequestGroupDisplay', 'ReferenceRangeEditor'],
  'WU-26': ['Timeline', 'ResourceTimeline', 'DefaultResourceTimeline', 'PatientTimeline', 'EncounterTimeline', 'ServiceRequestTimeline'],
  'WU-27': ['DiagnosticReportDisplay', 'MeasureReportDisplay', 'PatientHeader', 'PatientExportForm', 'PatientAccountsForm', 'SmartAppLaunchLink', 'Scheduler'],
  'WU-28': ['PatientSummary'],
  'WU-30': ['AppShell', 'NotificationIcon'],
  'WU-31': ['auth', 'GoogleButton'],
  'WU-32': ['chat'],
};
const seen = new Set();
let out = '| WU | dirs | src LOC | test LOC | test cases | stories |\n|---|---|---|---|---|---|\n';
let T = { loc: 0, testLoc: 0, tests: 0, stories: 0 };
for (const [wu, dirs] of Object.entries(wus)) {
  const s = { loc: 0, testLoc: 0, tests: 0, stories: 0 };
  for (const d of dirs) {
    if (!loc.has(d)) throw new Error('unknown dir ' + d);
    seen.add(d);
    s.loc += loc.get(d).loc;
    s.testLoc += loc.get(d).testLoc;
    s.tests += tc.get(d)?.tests ?? 0;
    s.stories += tc.get(d)?.stories ?? 0;
  }
  for (const k of Object.keys(T)) T[k] += s[k];
  out += `| ${wu} | ${dirs.length} | ${s.loc} | ${s.testLoc} | ${s.tests} | ${s.stories} |\n`;
}
out += `| **Total** | ${seen.size} | ${T.loc} | ${T.testLoc} | ${T.tests} | ${T.stories} |\n`;
const unassigned = [...loc.keys()].filter((d) => !seen.has(d));
out += `\nUnassigned dirs: ${unassigned.join(', ')}\n`;
process.stdout.write(out);
