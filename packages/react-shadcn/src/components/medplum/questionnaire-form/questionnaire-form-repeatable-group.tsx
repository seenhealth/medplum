// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormRepeatableGroup.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuestionnaireFormGroup } from '@/components/medplum/questionnaire-form/questionnaire-form-group';
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface QuestionnaireFormRepeatableGroupProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItems: QuestionnaireResponseItem[];
}

export function QuestionnaireFormRepeatableGroup(props: QuestionnaireFormRepeatableGroupProps): JSX.Element | null {
  return (
    <>
      {props.responseItems.map((response) => (
        <QuestionnaireFormGroup
          key={`group-${response.id}`}
          formState={props.formState}
          context={props.context}
          item={props.item}
          responseItem={response}
        />
      ))}
      <button
        type="button"
        className="text-primary underline-offset-4 hover:underline"
        onClick={() => props.formState.onAddGroup(props.context, props.item)}
      >{`Add Group: ${props.item.text}`}</button>
    </>
  );
}
