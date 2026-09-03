// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireResponseDisplay/QuestionnaireResponseItemDisplay.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CodeableConceptDisplay } from '@/components/medplum/codeable-concept-display';
import { QuantityDisplay } from '@/components/medplum/quantity-display';
import { RangeDisplay } from '@/components/medplum/range-display';
import { formatDate } from '@medplum/core';
import type { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from '@medplum/fhirtypes';
import type { JSX } from 'react';
import { useMemo } from 'react';

export interface QuestionnaireResponseItemDisplayProps {
  readonly item: QuestionnaireResponseItem;
}

export function QuestionnaireResponseItemDisplay(props: QuestionnaireResponseItemDisplayProps): JSX.Element {
  const { item } = props;
  const { text: title, answer, item: nestedAnswers } = item;

  const renderContent = useMemo((): JSX.Element => {
    if (answer && answer.length > 0) {
      return (
        <>
          {answer.map((ans, index) => (
            <AnswerDisplay key={`answer-${index}`} answer={ans} />
          ))}
        </>
      );
    } else if (nestedAnswers && nestedAnswers.length > 0) {
      return (
        <>
          {nestedAnswers.map((nestedAnswer, index) => (
            <QuestionnaireResponseItemDisplay key={`nested-${nestedAnswer.id ?? index}`} item={nestedAnswer} />
          ))}
        </>
      );
    } else {
      return <p className="text-muted-foreground">No answer</p>;
    }
  }, [answer, nestedAnswers]);

  return (
    <div className="flex flex-col gap-0 pb-2">
      <h3 className="text-lg font-semibold" id={item.id ? `question-${item.id}` : undefined}>
        {title}
      </h3>
      {renderContent}
    </div>
  );
}

interface AnswerDisplayProps {
  readonly answer: QuestionnaireResponseItemAnswer;
}

function AnswerDisplay({ answer }: AnswerDisplayProps): JSX.Element {
  if (!answer) {
    return <p className="text-muted-foreground">Invalid answer</p>;
  }

  const validEntries = Object.entries(answer).filter(([, value]) => value !== undefined && value !== null);

  if (validEntries.length === 0) {
    return <p className="text-muted-foreground">No valid answer data</p>;
  }

  const [key, value] = validEntries[0];

  switch (key) {
    case 'valueInteger':
      return <p>{value}</p>;
    case 'valueQuantity':
      return <QuantityDisplay value={value} />;
    case 'valueString':
      return <p>{value}</p>;
    case 'valueCoding':
      return <CodeableConceptDisplay value={{ coding: [value] }} />;
    case 'valueRange':
      return <RangeDisplay value={value} />;
    case 'valueDateTime':
      return <p>{formatDate(value)}</p>;
    case 'valueBoolean':
      return <p>{value ? 'True' : 'False'}</p>;
    case 'valueReference':
      return <p>{value.display ?? value.reference}</p>;
    default:
      return <p>{value.toString()}</p>;
  }
}
