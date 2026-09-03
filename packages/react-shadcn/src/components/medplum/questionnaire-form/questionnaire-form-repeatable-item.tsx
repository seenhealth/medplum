// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormRepeatableItem.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { QuestionnaireFormItem } from '@/components/medplum/questionnaire-form/questionnaire-form-item';
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/react-hooks';
import { QuestionnaireItemType } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface QuestionnaireFormRepeatableItemProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormRepeatableItem(props: QuestionnaireFormRepeatableItemProps): JSX.Element | null {
  const { formState, context, item, responseItem } = props;
  const isChoiceType = item.type === QuestionnaireItemType.choice || item.type === QuestionnaireItemType.openChoice;
  const showAddButton = !isChoiceType;

  const answers = !isChoiceType && responseItem.answer && responseItem.answer.length > 0 ? responseItem.answer : [{}];
  return (
    <FormSection key={props.item.linkId}>
      <FormSectionLabel required={props.item.required}>
        {props.item.text}
        {props.item.required && ' '}
      </FormSectionLabel>
      <div className="flex flex-col gap-2">
        {answers?.map((_, index) => (
          <QuestionnaireFormItem
            key={`${item.linkId}-${index}`}
            formState={formState}
            context={context}
            item={item}
            responseItem={responseItem}
            index={index}
          />
        ))}
      </div>
      {showAddButton && (
        <button
          type="button"
          className="text-left text-primary underline-offset-4 hover:underline"
          onClick={() => formState.onAddAnswer(context, item)}
        >
          Add Item
        </button>
      )}
    </FormSection>
  );
}
