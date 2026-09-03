// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/QuestionnaireForm.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Form } from '@/components/medplum/form/form';
import { SubmitButton } from '@/components/medplum/form/submit-button';
import { QuestionnaireFormItemArray } from '@/components/medplum/questionnaire-form/questionnaire-form-item-array';
import { QuestionnaireFormStepper } from '@/components/medplum/questionnaire-form/questionnaire-form-stepper';
import { SignatureInput } from '@/components/medplum/signature-input';
import { Separator } from '@/components/ui/separator';
import { createReference, getExtension, getReferenceString } from '@medplum/core';
import type { Encounter, Questionnaire, QuestionnaireResponse, Reference } from '@medplum/fhirtypes';
import {
  QUESTIONNAIRE_SIGNATURE_REQUIRED_URL,
  QUESTIONNAIRE_SIGNATURE_RESPONSE_URL,
  useMedplum,
  useQuestionnaireForm,
} from '@medplum/react-hooks';
import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface QuestionnaireFormProps {
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
  readonly questionnaireResponse?: QuestionnaireResponse | Reference<QuestionnaireResponse>;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly source?: QuestionnaireResponse['source'];
  readonly disablePagination?: boolean;
  readonly excludeButtons?: boolean;
  readonly submitButtonText?: string;
  /** Optional content rendered immediately below the header row, before the form items. */
  readonly afterHeader?: ReactNode;
  readonly onChange?: (response: QuestionnaireResponse) => void;
  readonly onSubmit?: (response: QuestionnaireResponse) => void;
}

export function QuestionnaireForm(props: QuestionnaireFormProps): JSX.Element | null {
  const medplum = useMedplum();
  const [signatureRequiredSubmitted, setSignatureRequiredSubmitted] = useState(false);
  const propsRef = useRef(props);
  const pendingChangeRef = useRef<QuestionnaireResponse | undefined>(undefined);
  useLayoutEffect(() => {
    propsRef.current = props;
  });

  const onFormChange = useCallback((response: QuestionnaireResponse) => {
    pendingChangeRef.current = response;
  }, []);

  const formState = useQuestionnaireForm({
    questionnaire: props.questionnaire,
    defaultValue: props.questionnaireResponse,
    subject: props.subject,
    encounter: props.encounter,
    source: props.source,
    disablePagination: props.disablePagination,
    onChange: onFormChange,
  });
  const formStateRef = useRef(formState);
  useLayoutEffect(() => {
    formStateRef.current = formState;
  });

  // Intentionally run after every commit.
  //
  // `useQuestionnaireForm` currently invokes its `onChange` callback while the form
  // is rendering/initializing. Calling `setState` directly from that callback caused
  // React to warn that `QuestionnaireForm` was updating a parent during render.
  //
  // To avoid that render-phase update, `onFormChange` stages the latest response in
  // `pendingChangeRef`, and this effect flushes it after commit. The effect clears
  // the ref before calling `setSignatureRequiredSubmitted(false)`, so the state
  // update does not create an infinite loop: the rerender triggered by `setState`
  // immediately exits because there is no longer a pending change to flush.
  //
  // A more complete fix would be to move `useQuestionnaireForm`'s `onChange`
  // emission out of render entirely. Until then, this effect must run on every
  // commit so it can detect newly staged ref-based changes that do not participate
  // in React's dependency tracking.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const pendingChange = pendingChangeRef.current;
    if (!pendingChange) {
      return;
    }

    pendingChangeRef.current = undefined;
    setSignatureRequiredSubmitted(false);
    propsRef.current.onChange?.(pendingChange);
  });

  const isSignatureRequired = useMemo(() => {
    if (formState.loading) {
      return false;
    }
    return !!getExtension(formState.questionnaire, QUESTIONNAIRE_SIGNATURE_REQUIRED_URL);
  }, [formState]);

  const hasSignature = useMemo(() => {
    if (formState.loading) {
      return false;
    }
    return !!formState.questionnaireResponse.extension?.find((ext) => ext.url === QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
  }, [formState]);

  const handleSubmit = useCallback(() => {
    const formState = formStateRef.current;
    if (formState.loading) {
      return;
    }

    const onSubmit = propsRef.current.onSubmit;
    if (!onSubmit) {
      return;
    }

    if (isSignatureRequired && !hasSignature) {
      setSignatureRequiredSubmitted(true);
      return;
    }

    const questionnaire = formState.questionnaire;
    const response = formState.questionnaireResponse;
    const subject = propsRef.current.subject;
    let source = propsRef.current.source;
    if (!source) {
      const profile = medplum.getProfile();
      if (profile) {
        source = createReference(profile);
      }
    }

    onSubmit({
      ...response,
      questionnaire: questionnaire.url ?? getReferenceString(questionnaire),
      subject,
      source,
      authored: new Date().toISOString(),
      status: 'completed',
    });
  }, [medplum, isSignatureRequired, hasSignature]);

  if (formState.loading) {
    return null;
  }

  return (
    <Form testid="questionnaire-form" onSubmit={handleSubmit}>
      {formState.questionnaire.title && (
        <h1 className="mb-6 text-[1.625rem] font-bold leading-[1.3]">{formState.questionnaire.title}</h1>
      )}
      {props.afterHeader && (
        <div className="mb-6 flex flex-col gap-6">
          {props.afterHeader}
          <Separator />
        </div>
      )}
      {formState.pagination ? (
        <QuestionnaireFormStepper
          formState={formState}
          submitButtonText={props.submitButtonText}
          excludeButtons={props.excludeButtons}
        >
          <QuestionnaireFormItemArray
            formState={formState}
            context={[]}
            items={formState.items}
            responseItems={formState.responseItems}
          />
        </QuestionnaireFormStepper>
      ) : (
        <>
          <QuestionnaireFormItemArray
            formState={formState}
            context={[]}
            items={formState.items}
            responseItems={formState.responseItems}
          />
          {isSignatureRequired && (
            <div className="mt-4 flex flex-col gap-0">
              <p className="text-sm font-medium">Signature</p>
              <SignatureInput onChange={formState.onChangeSignature} />
              {!hasSignature && signatureRequiredSubmitted && (
                <p className="text-sm text-destructive">Signature is required.</p>
              )}
            </div>
          )}

          {!props.excludeButtons && (
            <div className="mt-6 flex justify-end gap-2">
              <SubmitButton>{props.submitButtonText ?? 'Submit'}</SubmitButton>
            </div>
          )}
        </>
      )}
    </Form>
  );
}
