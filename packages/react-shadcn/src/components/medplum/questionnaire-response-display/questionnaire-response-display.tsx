// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireResponseDisplay/QuestionnaireResponseDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { QuestionnaireResponseItemDisplay } from '@/components/medplum/questionnaire-response-display/questionnaire-response-item-display';
import type { QuestionnaireResponse, Reference } from '@medplum/fhirtypes';
import { useResource } from '@medplum/react-hooks';
import type { JSX } from 'react';

export interface QuestionnaireResponseDisplayProps {
  readonly questionnaireResponse: QuestionnaireResponse | Reference<QuestionnaireResponse>;
}

export function QuestionnaireResponseDisplay(props: QuestionnaireResponseDisplayProps): JSX.Element {
  const questionnaireResponse = useResource(props.questionnaireResponse);

  return (
    <div className="flex flex-col gap-0">
      {questionnaireResponse?.item?.map((item, index) => (
        <QuestionnaireResponseItemDisplay key={`item-${item.id ?? index}`} item={item} />
      ))}
    </div>
  );
}
