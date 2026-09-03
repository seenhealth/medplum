// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormGroup.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuestionnaireFormItemArray } from '@/components/medplum/questionnaire-form/questionnaire-form-item-array';
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface QuestionnaireFormGroupProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormGroup(props: QuestionnaireFormGroupProps): JSX.Element | null {
  const newContext = [...props.context, props.responseItem];
  return (
    <div key={props.item.linkId}>
      {props.item.text && <h4 className="mb-4 text-base font-semibold tracking-tight">{props.item.text}</h4>}
      <QuestionnaireFormItemArray
        formState={props.formState}
        context={newContext}
        items={props.item.item ?? []}
        responseItems={props.responseItem.item ?? []}
      />
    </div>
  );
}
