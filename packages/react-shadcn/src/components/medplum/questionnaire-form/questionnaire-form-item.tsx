// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormItem.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { AsyncAutocomplete } from '@/components/medplum/async-autocomplete';
import { AttachmentInput } from '@/components/medplum/attachment-input';
import { CheckboxFormSection } from '@/components/medplum/checkbox-form-section';
import { DateTimeInput } from '@/components/medplum/date-time-input';
import { FormSectionContent, FormSectionLabel } from '@/components/medplum/form-section';
import { QuantityInput } from '@/components/medplum/quantity-input';
import { ReferenceInput } from '@/components/medplum/reference-input';
import { ResourcePropertyDisplay } from '@/components/medplum/resource-property-display';
import { UnavailableNote } from '@/components/medplum/unavailable-note';
import { ValueSetAutocomplete } from '@/components/medplum/value-set-autocomplete';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { TypedValue } from '@medplum/core';
import {
  capitalize,
  deepEquals,
  formatCoding,
  getElementDefinition,
  getExtension,
  HTTP_HL7_ORG,
  stringify,
  typedValueToString,
} from '@medplum/core';
import type {
  Coding,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireItemInitial,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet,
  ValueSetExpansionContains,
} from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/react-hooks';
import {
  getItemAnswerOptionValue,
  getItemInitialValue,
  getNewMultiSelectValues,
  getQuestionnaireItemReferenceFilter,
  getQuestionnaireItemReferenceTargetTypes,
  isValueSetUnavailableError,
  QUESTIONNAIRE_ITEM_CONTROL_URL,
  QuestionnaireItemType,
  useMedplum,
} from '@medplum/react-hooks';
import type { ChangeEvent, JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

const MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS = 30;
const MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS = 50;

export interface QuestionnaireFormItemProps {
  readonly formState?: QuestionnaireFormLoadedState;
  readonly context?: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly index: number;
  readonly required?: boolean;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormItem(props: QuestionnaireFormItemProps): JSX.Element | null {
  const formState = props.formState;
  const item = props.item;
  const response = props.responseItem;

  function onChangeAnswer(newResponseAnswer: QuestionnaireResponseItemAnswer[]): void {
    if (formState && props.context) {
      // For repeating non-choice items, we need to update only the specific index
      // Choice items (checkboxes, dropdowns) manage multiple answers internally
      const isNonChoiceRepeating =
        item.repeats &&
        props.index !== undefined &&
        item.type !== QuestionnaireItemType.choice &&
        item.type !== QuestionnaireItemType.openChoice;

      if (isNonChoiceRepeating) {
        const currentAnswers = response.answer || [];
        const updatedAnswers = [...currentAnswers];

        if (newResponseAnswer.length === 0) {
          // Remove the answer at this index
          updatedAnswers.splice(props.index, 1);
        } else {
          // Update the answer at this index
          updatedAnswers[props.index] = newResponseAnswer[0];
        }

        formState.onChangeAnswer(props.context, props.item, updatedAnswers);
      } else {
        formState.onChangeAnswer(props.context, props.item, newResponseAnswer);
      }
    }
  }

  const type = item.type;
  if (!type) {
    return null;
  }

  const name = item.linkId;
  if (!name) {
    return null;
  }

  // For repeating non-choice items, generate a unique id by including the index
  // Choice items render once and manage multiple answers internally, so they keep the same id
  const isNonChoiceRepeating =
    item.repeats &&
    props.index !== undefined &&
    item.type !== QuestionnaireItemType.choice &&
    item.type !== QuestionnaireItemType.openChoice;
  const inputId = isNonChoiceRepeating ? `${name}-${props.index}` : name;

  let initial: QuestionnaireItemInitial | undefined = undefined;
  if (item.initial && item.initial.length > 0) {
    initial = item.initial[0];
  } else if (item.answerOption && item.answerOption.length > 0) {
    initial = item.answerOption.find((option) => option.initialSelected);
  }

  const defaultValue = getCurrentAnswer(response, props.index) ?? getItemInitialValue(initial);
  const validationError = getExtension(
    response,
    `${HTTP_HL7_ORG}/fhir/StructureDefinition/questionnaire-validationError`
  );

  let formComponent: JSX.Element | null = null;

  switch (type) {
    case QuestionnaireItemType.display:
      formComponent = <p key={props.item.linkId}>{props.item.text}</p>;
      break;
    case QuestionnaireItemType.boolean:
      formComponent = (
        <CheckboxFormSection key={props.item.linkId} htmlFor={inputId}>
          <Checkbox
            id={inputId}
            name={name}
            required={props.required ?? item.required}
            defaultChecked={defaultValue?.value}
            onClick={(event) =>
              onChangeAnswer([{ valueBoolean: event.currentTarget.getAttribute('data-state') !== 'checked' }])
            }
          />
          <FormSectionContent>
            <FormSectionLabel required={props.required ?? item.required}>
              {props.item.text}
              {(props.required ?? item.required) && ' '}
            </FormSectionLabel>
          </FormSectionContent>
        </CheckboxFormSection>
      );
      break;
    case QuestionnaireItemType.decimal:
      formComponent = (
        <Input
          type="number"
          step="any"
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) =>
            onChangeAnswer(e.currentTarget.value === '' ? [] : [{ valueDecimal: e.currentTarget.valueAsNumber }])
          }
        />
      );
      break;
    case QuestionnaireItemType.integer:
      formComponent = (
        <Input
          type="number"
          step={1}
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) =>
            onChangeAnswer(e.currentTarget.value === '' ? [] : [{ valueInteger: e.currentTarget.valueAsNumber }])
          }
        />
      );
      break;
    case QuestionnaireItemType.date:
      formComponent = (
        <Input
          type="date"
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) => onChangeAnswer([{ valueDate: e.currentTarget.value }])}
        />
      );
      break;
    case QuestionnaireItemType.dateTime:
      formComponent = (
        <DateTimeInput
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(newValue: string) => onChangeAnswer([{ valueDateTime: newValue }])}
        />
      );
      break;
    case QuestionnaireItemType.time:
      formComponent = (
        <Input
          type="time"
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) => onChangeAnswer([{ valueTime: e.currentTarget.value }])}
        />
      );
      break;
    case QuestionnaireItemType.string:
    case QuestionnaireItemType.url:
      formComponent = (
        <Input
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) => {
            const value = e.currentTarget.value;
            onChangeAnswer(value === '' ? [] : [{ valueString: value }]);
          }}
        />
      );
      break;
    case QuestionnaireItemType.text:
      formComponent = (
        <Textarea
          id={inputId}
          name={name}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(e) => {
            const value = e.currentTarget.value;
            onChangeAnswer(value === '' ? [] : [{ valueString: value }]);
          }}
        />
      );
      break;
    case QuestionnaireItemType.attachment:
      formComponent = (
        <div className="py-1">
          <AttachmentInput
            path=""
            name={inputId}
            defaultValue={defaultValue?.value}
            onChange={(newValue) => onChangeAnswer([{ valueAttachment: newValue }])}
          />
        </div>
      );
      break;
    case QuestionnaireItemType.reference:
      formComponent = (
        <ReferenceInput
          name={inputId}
          required={props.required ?? item.required}
          targetTypes={getQuestionnaireItemReferenceTargetTypes(item)}
          searchCriteria={getQuestionnaireItemReferenceFilter(item, formState?.subject, formState?.encounter)}
          defaultValue={defaultValue?.value}
          onChange={(newValue) => onChangeAnswer([{ valueReference: newValue }])}
        />
      );
      break;
    case QuestionnaireItemType.quantity:
      formComponent = (
        <QuantityInput
          path=""
          name={inputId}
          required={props.required ?? item.required}
          defaultValue={defaultValue?.value}
          onChange={(newValue) => onChangeAnswer([{ valueQuantity: newValue }])}
          disableWheel
        />
      );
      break;
    case QuestionnaireItemType.choice:
    case QuestionnaireItemType.openChoice:
      {
        const { widget, multiselect } = resolveChoiceControl(item);
        const sharedProps = {
          name: inputId,
          item,
          required: props.required ?? item.required,
          initial,
          response,
          multiselect,
          onChangeAnswer,
        };
        if (widget === 'check-box') {
          formComponent = <QuestionnaireCheckboxInput {...sharedProps} />;
        } else if (widget === 'drop-down') {
          formComponent = <QuestionnaireDropdownInput {...sharedProps} />;
        } else {
          formComponent = <QuestionnaireRadioButtonInput {...sharedProps} />;
        }
      }
      break;
    default:
      return null;
  }

  return (
    <>
      {formComponent}
      {validationError?.valueString && <p className="mt-1 text-lg text-destructive">{validationError.valueString}</p>}
    </>
  );
}

interface QuestionnaireChoiceInputProps {
  readonly name: string;
  readonly item: QuestionnaireItem;
  readonly initial: QuestionnaireItemInitial | undefined;
  readonly multiselect?: boolean;
  readonly required: boolean | undefined;
  readonly response?: QuestionnaireResponseItem;
  readonly onChangeAnswer: (newResponseAnswer: QuestionnaireResponseItemAnswer[]) => void;
}

function QuestionnaireDropdownInput(props: QuestionnaireChoiceInputProps): JSX.Element {
  const { name, item, required, initial, onChangeAnswer, response, multiselect } = props;

  if (!item.answerOption?.length && !item.answerValueSet) {
    return <NoAnswerDisplay />;
  }

  const initialValue = getItemInitialValue(initial);
  const defaultValue = getCurrentAnswer(response) ?? initialValue;
  const currentAnswer = getCurrentMultiSelectAnswer(response);
  const isMultiSelect = item.repeats || multiselect;

  if (item.answerValueSet) {
    return (
      <ValueSetAutocomplete
        name={name}
        placeholder="Select items"
        binding={item.answerValueSet}
        maxValues={isMultiSelect ? undefined : 1}
        required={required}
        onChange={(values) => {
          if (isMultiSelect) {
            if (values.length === 0) {
              onChangeAnswer([{}]);
            } else {
              onChangeAnswer(values.map((coding) => ({ valueCoding: coding })));
            }
          } else {
            onChangeAnswer([{ valueCoding: values[0] }]);
          }
        }}
        defaultValue={defaultValue?.value}
      />
    );
  }

  if (isMultiSelect) {
    const { propertyName, data } = formatSelectData(item);
    return (
      <AsyncAutocomplete
        key={currentAnswer.join('\u0000')}
        placeholder="Select items"
        defaultValue={data.filter((option) => currentAnswer.includes(option.value))}
        loadOptions={(input) =>
          Promise.resolve(data.filter((option) => option.label.toLowerCase().includes(input.toLowerCase())))
        }
        toOption={(option) => ({ ...option, resource: option })}
        required={required}
        onChange={(selected) => {
          if (selected.length === 0) {
            onChangeAnswer([{}]);
          } else {
            const values = getNewMultiSelectValues(
              selected.map((option) => option.value),
              propertyName,
              item
            );
            onChangeAnswer(values);
          }
        }}
      />
    );
  } else {
    const data = [''];
    if (item.answerOption) {
      for (const option of item.answerOption) {
        const optionValue = getItemAnswerOptionValue(option);
        data.push(typedValueToString(optionValue));
      }
    }
    return (
      <NativeSelect
        id={name}
        name={name}
        required={required}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          const index = e.currentTarget.selectedIndex;
          if (index === 0) {
            onChangeAnswer([{}]);
            return;
          }
          const option = (item.answerOption as QuestionnaireItemAnswerOption[])[index - 1];
          const optionValue = getItemAnswerOptionValue(option);
          const propertyName = 'value' + capitalize(optionValue.type);
          onChangeAnswer([{ [propertyName]: optionValue.value }]);
        }}
        defaultValue={formatCoding(defaultValue?.value) || defaultValue?.value}
      >
        {data.map((value) => (
          <NativeSelectOption key={value} value={value}>
            {value}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  }
}

function getValueSetOptions(
  valueSetUrl: string | undefined,
  medplum: ReturnType<typeof useMedplum>
): Promise<ValueSetExpansionContains[]> {
  if (!valueSetUrl) {
    return Promise.resolve([]);
  }

  return medplum
    .valueSetExpand({
      url: valueSetUrl,
      count: MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS + 1,
    })
    .then((valueSet: ValueSet) => valueSet.expansion?.contains ?? []);
}

interface ValueSetOptionsState {
  readonly options: ValueSetExpansionContains[];
  readonly loading: boolean;
  readonly available: boolean | undefined;
}

function useValueSetOptions(valueSetUrl: string | undefined): ValueSetOptionsState {
  const medplum = useMedplum();
  const [valueSetOptions, setValueSetOptions] = useState<ValueSetExpansionContains[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(() => (valueSetUrl ? undefined : true));

  useEffect(() => {
    async function loadValueSet(): Promise<void> {
      if (!valueSetUrl) {
        setIsAvailable(true);
        return;
      }

      setIsLoading(true);
      setIsAvailable(undefined);
      try {
        const options = await getValueSetOptions(valueSetUrl, medplum);
        setValueSetOptions(options);
        setIsAvailable(true);
      } catch (err) {
        // A permanent 400/404 marks it unavailable; a transient failure keeps the field usable
        const unavailable = isValueSetUnavailableError(err);
        setIsAvailable(!unavailable);
        if (!unavailable) {
          console.error('Error loading value set:', err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadValueSet().catch(console.error);
  }, [valueSetUrl, medplum]);

  return { options: valueSetOptions, loading: isLoading, available: isAvailable };
}

function SuggestionsUnavailableDisplay({ valueSetUrl }: { readonly valueSetUrl: string | undefined }): JSX.Element {
  return (
    <UnavailableNote
      text="Suggestions unavailable"
      color="yellow.9"
      message={`Value set ${valueSetUrl} is unavailable`}
    />
  );
}

function getOptionsFromValueSet(valueSetOptions: ValueSetExpansionContains[], name: string): [string, TypedValue][] {
  return valueSetOptions.map((option, i) => {
    const optionName = `${name}-valueset-${i}`;
    const optionValue = {
      type: 'Coding',
      value: {
        system: option.system,
        code: option.code,
        display: option.display,
      },
    };
    return [optionName, optionValue];
  });
}

function QuestionnaireRadioButtonInput(props: QuestionnaireChoiceInputProps): JSX.Element {
  const { name, item, required, initial, onChangeAnswer, response } = props;
  const valueElementDefinition = getElementDefinition('QuestionnaireItemAnswerOption', 'value[x]');
  const initialValue = getItemInitialValue(initial);
  const {
    options: valueSetOptions,
    loading: isLoading,
    available: isValueSetAvailable,
  } = useValueSetOptions(item.answerValueSet);

  const options: [string, TypedValue][] = [];
  let defaultValue = undefined;

  if (item.answerValueSet) {
    options.push(...getOptionsFromValueSet(valueSetOptions, name));
  } else if (item.answerOption) {
    const mappedOptions = item.answerOption
      .slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS)
      .map((option, i) => {
        const optionName = `${name}-option-${i}`;
        const optionValue = getItemAnswerOptionValue(option);
        if (!optionValue?.value) {
          return null;
        }
        if (initialValue && stringify(optionValue) === stringify(initialValue)) {
          defaultValue = optionName;
        }
        return [optionName, optionValue] as [string, TypedValue];
      })
      .filter((option): option is [string, TypedValue] => option !== null);

    options.push(...mappedOptions);
  }

  const defaultAnswer = getCurrentAnswer(response);
  const answerLinkId = getCurrentRadioAnswer(options, defaultAnswer);

  if (isLoading) {
    return <p>Loading options...</p>;
  }

  if (options.length === 0) {
    return isValueSetAvailable === false ? (
      <SuggestionsUnavailableDisplay valueSetUrl={item.answerValueSet} />
    ) : (
      <NoAnswerDisplay />
    );
  }

  const limitedOptions = options.slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS);

  return (
    <>
      <RadioGroup
        name={name}
        value={answerLinkId ?? defaultValue}
        required={required}
        onValueChange={(newValue) => {
          const option = options.find((option) => option[0] === newValue);
          if (option) {
            const optionValue = option[1];
            const propertyName = 'value' + capitalize(optionValue.type);
            onChangeAnswer([{ [propertyName]: optionValue.value }]);
          }
        }}
      >
        {limitedOptions.map(([optionName, optionValue]) => (
          <div key={optionName} className="flex items-center gap-2 py-1">
            <RadioGroupItem id={optionName} value={optionName} required={required} />
            <Label htmlFor={optionName}>
              <ResourcePropertyDisplay
                property={valueElementDefinition}
                propertyType={optionValue.type}
                value={optionValue.value}
              />
            </Label>
          </div>
        ))}
      </RadioGroup>
      {((item.answerValueSet && options.length > MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS) ||
        (item.answerOption && options.length > MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS)) && (
        <p className="mt-2 text-sm text-muted-foreground">
          Showing first {MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS} options
        </p>
      )}
    </>
  );
}

function QuestionnaireCheckboxInput(props: QuestionnaireChoiceInputProps): JSX.Element {
  const { name, item, onChangeAnswer, response } = props;
  const valueElementDefinition = getElementDefinition('QuestionnaireItemAnswerOption', 'value[x]');
  const {
    options: valueSetOptions,
    loading: isLoading,
    available: isValueSetAvailable,
  } = useValueSetOptions(item.answerValueSet);

  // Derive the selected values from the response rather than local state, so that answers
  // rewritten by the form state (e.g. optionExclusive) are reflected in the checkboxes.
  const selectedValues = item.answerValueSet
    ? (response?.answer?.map((a) => a.valueCoding) || []).filter((c): c is Coding => c !== undefined)
    : getCurrentMultiSelectAnswer(response);
  const selectedValuesRef = useRef(selectedValues);
  useEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  const options: [string, TypedValue][] = [];

  if (item.answerValueSet) {
    options.push(...getOptionsFromValueSet(valueSetOptions, name));
  } else if (item.answerOption) {
    const mappedOptions = item.answerOption
      .slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS)
      .map((option, i) => {
        const optionName = `${name}-option-${i}`;
        const optionValue = getItemAnswerOptionValue(option);
        return optionValue?.value ? ([optionName, optionValue] as [string, TypedValue]) : null;
      })
      .filter((option): option is [string, TypedValue] => option !== null);

    options.push(...mappedOptions);
  }

  if (isLoading) {
    return <p>Loading options...</p>;
  }

  if (options.length === 0) {
    return isValueSetAvailable === false ? (
      <SuggestionsUnavailableDisplay valueSetUrl={item.answerValueSet} />
    ) : (
      <NoAnswerDisplay />
    );
  }

  const limitedOptions = options.slice(0, MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS);

  const handleCheckboxChange = (optionValue: TypedValue, selected: boolean): void => {
    if (item.answerValueSet) {
      const currentCodings = selectedValuesRef.current as Coding[];
      let newCodings: Coding[];

      if (selected) {
        newCodings = [...currentCodings, optionValue.value as Coding];
      } else {
        newCodings = currentCodings.filter((c) => !deepEquals(c, optionValue.value));
      }

      if (newCodings.length === 0) {
        onChangeAnswer([{}]);
      } else {
        onChangeAnswer(newCodings.map((coding) => ({ valueCoding: coding })));
      }
      selectedValuesRef.current = newCodings;
    } else {
      const currentValues = selectedValuesRef.current as string[];
      const optionValueStr = typedValueToString(optionValue);
      let newValues: string[];

      if (selected) {
        newValues = [...currentValues, optionValueStr];
      } else {
        newValues = currentValues.filter((v) => v !== optionValueStr);
      }

      if (newValues.length === 0) {
        onChangeAnswer([{}]);
      } else {
        const values = getNewMultiSelectValues(newValues, 'value' + capitalize(optionValue.type), item);
        onChangeAnswer(values);
      }
      selectedValuesRef.current = newValues;
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      {limitedOptions.map(([optionName, optionValue]) => {
        const optionValueStr = typedValueToString(optionValue);
        const isChecked = item.answerValueSet
          ? (selectedValues as Coding[]).some((coding) => deepEquals(coding, optionValue.value))
          : (selectedValues as string[]).includes(optionValueStr);

        return (
          <div key={optionName} className="flex items-center gap-2">
            <Checkbox
              id={optionName}
              checked={isChecked}
              onClick={(event) =>
                handleCheckboxChange(optionValue, event.currentTarget.getAttribute('data-state') !== 'checked')
              }
            />
            <Label htmlFor={optionName}>
              <ResourcePropertyDisplay
                property={valueElementDefinition}
                propertyType={optionValue.type}
                value={optionValue.value}
              />
            </Label>
          </div>
        );
      })}
      {((item.answerValueSet && options.length > MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS) ||
        (item.answerOption && options.length > MAX_DISPLAYED_CHECKBOX_RADIO_EXPLICITOPTION_OPTIONS)) && (
        <p className="text-sm text-muted-foreground">
          Showing first {MAX_DISPLAYED_CHECKBOX_RADIO_VALUE_SET_OPTIONS} options
        </p>
      )}
    </div>
  );
}

function NoAnswerDisplay(): JSX.Element {
  return <Input disabled placeholder="No Answers Defined" />;
}

function getCurrentAnswer(response: QuestionnaireResponseItem | undefined, index: number = 0): TypedValue {
  return getItemAnswerOptionValue(response?.answer?.[index] ?? {});
}

function getCurrentMultiSelectAnswer(response: QuestionnaireResponseItem | undefined): string[] {
  const results = response?.answer;
  if (!results) {
    return [];
  }
  const typedValues = results.map((a) => getItemAnswerOptionValue(a));
  return typedValues.map((type) => formatCoding(type?.value) || type?.value).filter(Boolean);
}

function getCurrentRadioAnswer(options: [string, TypedValue][], defaultAnswer: TypedValue): string | undefined {
  return options.find((option) => deepEquals(option[1].value, defaultAnswer?.value))?.[0];
}

type ChoiceControl = {
  widget: 'drop-down' | 'radio-button' | 'check-box';
  multiselect: boolean;
};

const choiceTypes: ChoiceControl['widget'][] = ['drop-down', 'radio-button', 'check-box'];

/**
 * Determines the choice control type (dropdown, radio button, or checkbox) based on the questionnaire item properties and extensions.
 * @param item - The questionnaire item to evaluate.
 * @returns The resolved choice control type and whether it is multi-select.
 */
function resolveChoiceControl(item: QuestionnaireItem): ChoiceControl {
  let widget: ChoiceControl['widget'] = 'radio-button';
  let multiselect = false;

  if (item.answerValueSet) {
    // Preserve existing behavior of using dropdown for answerValueSet,
    // since it can contain many options and radio buttons don't work well in that case
    widget = 'drop-down';
  }

  for (const ext of item.extension ?? []) {
    if (ext.url !== QUESTIONNAIRE_ITEM_CONTROL_URL) {
      continue;
    }
    const code = ext.valueCodeableConcept?.coding?.[0]?.code;
    if (choiceTypes.includes(code as ChoiceControl['widget'])) {
      widget = code as ChoiceControl['widget'];
    }
    if (code === 'multi-select') {
      multiselect = true;
    }
  }

  if (widget === 'radio-button' && multiselect) {
    widget = 'check-box';
  }

  return { widget, multiselect };
}

interface FormattedData {
  readonly propertyName: string;
  readonly data: SelectOption[];
}

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

function formatSelectData(item: QuestionnaireItem): FormattedData {
  if (item.answerOption?.length === 0) {
    return { propertyName: '', data: [] };
  }
  const option = (item.answerOption as QuestionnaireItemAnswerOption[])[0];
  const optionValue = getItemAnswerOptionValue(option);
  const propertyName = 'value' + capitalize(optionValue.type);

  const data = (item.answerOption ?? []).map((answerOption) => {
    const answerOptionValue = getItemAnswerOptionValue(answerOption);
    const answerOptionValueStr = typedValueToString(answerOptionValue);
    return {
      value: answerOptionValueStr,
      label: answerOptionValueStr,
    };
  });
  return { propertyName, data };
}
