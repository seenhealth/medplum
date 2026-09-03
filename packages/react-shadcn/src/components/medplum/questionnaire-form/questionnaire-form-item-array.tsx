// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireFormItemArray.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { FormSection, FormSectionLabel } from '@/components/medplum/form-section';
import { QuestionnaireFormGroup } from '@/components/medplum/questionnaire-form/questionnaire-form-group';
import { QuestionnaireFormItem } from '@/components/medplum/questionnaire-form/questionnaire-form-item';
import { QuestionnaireFormRepeatableGroup } from '@/components/medplum/questionnaire-form/questionnaire-form-repeatable-group';
import { QuestionnaireFormRepeatableItem } from '@/components/medplum/questionnaire-form/questionnaire-form-repeatable-item';
import { Separator } from '@/components/ui/separator';
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/react-hooks';
import { isQuestionEnabled, QuestionnaireItemType } from '@medplum/react-hooks';
import type { JSX } from 'react';
import { Fragment } from 'react';

export interface QuestionnaireFormItemArrayProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly items: QuestionnaireItem[];
  readonly responseItems: QuestionnaireResponseItem[];
}

export function QuestionnaireFormItemArray(props: QuestionnaireFormItemArrayProps): JSX.Element {
  const { formState, context, items, responseItems } = props;
  const isTopLevel = context.length === 0;
  // Tracks whether a top-level group has already been rendered so we can
  // insert a divider before each subsequent group section.
  let hasRenderedSection = false;

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, index) => {
        if (!isQuestionEnabled(item, formState.questionnaireResponse)) {
          return null;
        }
        const isGroup = item.type === QuestionnaireItemType.group;
        const showSectionDivider = isTopLevel && isGroup && hasRenderedSection;
        if (isGroup) {
          hasRenderedSection = true;
        }

        if (item.type === QuestionnaireItemType.display) {
          return <p key={`display-${item.id}-${index}`}>{item.text}</p>;
        }

        const filteredResponseItems = responseItems.filter((responseItem) => responseItem.linkId === item.linkId);

        if (item.type === QuestionnaireItemType.group && item.repeats) {
          return (
            <Fragment key={`repeating-group-${item.id}-${index}`}>
              {showSectionDivider && <Separator />}
              <QuestionnaireFormRepeatableGroup
                formState={formState}
                context={context}
                item={item}
                responseItems={filteredResponseItems}
              />
            </Fragment>
          );
        }

        if (item.type === QuestionnaireItemType.group) {
          return (
            <Fragment key={`group-${item.id}-${index}`}>
              {showSectionDivider && <Separator />}
              <QuestionnaireFormGroup
                formState={formState}
                context={context}
                item={item}
                responseItem={filteredResponseItems[0]}
              />
            </Fragment>
          );
        }

        if (item.type === QuestionnaireItemType.boolean) {
          // Special case for boolean items to avoid duplicate text
          return (
            <QuestionnaireFormItem
              key={`boolean-item-${item.id}-${index}`}
              formState={formState}
              context={context}
              item={item}
              responseItem={filteredResponseItems[0]}
              index={0}
            />
          );
        }

        if (item.repeats) {
          return (
            <QuestionnaireFormRepeatableItem
              key={`repeating-item-${item.id}-${index}`}
              formState={formState}
              context={context}
              item={item}
              responseItem={filteredResponseItems[0]}
            />
          );
        }

        return (
          <FormSection key={`repeating-item-${item.id}-${index}`} htmlFor={item.linkId}>
            <FormSectionLabel required={item.required}>
              {item.text}
              {item.required && ' '}
            </FormSectionLabel>
            <QuestionnaireFormItem
              formState={formState}
              context={context}
              item={item}
              responseItem={filteredResponseItems[0]}
              index={0}
            />
          </FormSection>
        );
      })}
    </div>
  );
}
