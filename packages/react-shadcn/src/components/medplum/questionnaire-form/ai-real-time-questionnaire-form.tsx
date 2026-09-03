// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QuestionnaireForm/AIRealTimeQuestionnaireForm.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import type { QuestionnaireFormProps } from '@/components/medplum/questionnaire-form/questionnaire-form';
import { QuestionnaireForm } from '@/components/medplum/questionnaire-form/questionnaire-form';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useDebouncedCallback } from '@/hooks/medplum/use-debounced-callback';
import { notify } from '@/lib/medplum/notify';
import { cn } from '@/lib/utils';
import { normalizeErrorString } from '@medplum/core';
import type { Identifier, Parameters, Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useMedplum, useWhisper } from '@medplum/react-hooks';
import { IconChevronDown, IconChevronUp, IconCircleFilled, IconMicrophone, IconTrash } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_SILENCE_DEBOUNCE_MS = 500;
const DEFAULT_IDLE_LABEL = 'Start Dictation to complete this form with your voice';
const TRANSCRIPT_PLACEHOLDER = 'Start speaking to see your transcribed words...';
const VOICE_TRANSCRIPT_EXTENSION_URL = 'https://medplum.com/ai-voice-transcript';

const botIdentifier: Identifier = {
  system: 'https://www.medplum.com/bots',
  value: 'ai-realtime-questionnaire',
};

function getStoredTranscript(response: QuestionnaireResponse | undefined): string {
  return response?.extension?.find((e) => e.url === VOICE_TRANSCRIPT_EXTENSION_URL)?.valueString ?? '';
}

const DEFAULT_INSTRUCTIONS = (
  <div className="flex flex-col gap-2">
    <p>
      To fill out the form, just speak naturally and the dictation tool will map your spoken answers to the form fields.
    </p>
    <p>Pause briefly between thoughts to start processing.</p>
  </div>
);

export interface AIRealTimeQuestionnaireFormProps extends QuestionnaireFormProps {
  readonly aiModel?: string;
  readonly onTranscript?: (fullTranscript: string, chunk: string) => void;
  readonly voiceInstructions?: ReactNode;
  readonly silenceDebounceMs?: number;
}

export function AIRealTimeQuestionnaireForm(props: AIRealTimeQuestionnaireFormProps): JSX.Element {
  const { aiModel, onTranscript, voiceInstructions, silenceDebounceMs, ...questionnaireFormProps } = props;
  const medplum = useMedplum();
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse | undefined>(
    props.questionnaireResponse as QuestionnaireResponse | undefined
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [displayTranscript, setDisplayTranscript] = useState(() =>
    getStoredTranscript(props.questionnaireResponse as QuestionnaireResponse | undefined)
  );
  const [expanded, setExpanded] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  // Bumped only when the AI replaces the response, so QuestionnaireForm remounts
  // and picks up the new defaultValue (the inner hook ignores later prop changes).
  const [responseVersion, setResponseVersion] = useState(0);

  const questionnaireRef = useRef<Questionnaire | null>(null);
  const inputRef = useRef('');
  const inFlightRef = useRef(false);
  const responseRef = useRef<QuestionnaireResponse | undefined>(questionnaireResponse);
  const flushTranscriptRef = useRef<() => Promise<void>>(async () => {});
  const transcriptViewportRef = useRef<HTMLDivElement>(null);
  // Cumulative transcript across all flushes in this session, written to the
  // QuestionnaireResponse as a custom extension each time the bot returns.
  // Seeded from the incoming response so a previously captured transcript is
  // preserved and appended to rather than overwritten.
  const fullTranscriptRef = useRef(getStoredTranscript(questionnaireResponse));

  useEffect(() => {
    responseRef.current = questionnaireResponse;
  }, [questionnaireResponse]);

  const [botAvailability, setBotAvailability] = useState<'loading' | 'available' | 'unavailable'>('loading');
  useEffect(() => {
    let cancelled = false;
    async function checkBotAvailability(): Promise<void> {
      try {
        const bot = await medplum.searchOne('Bot', {
          identifier: `${botIdentifier.system ?? ''}|${botIdentifier.value ?? ''}`,
        });
        if (!cancelled) {
          setBotAvailability(bot ? 'available' : 'unavailable');
        }
      } catch (err) {
        console.error('Error checking bot availability:', err);
        if (!cancelled) {
          setBotAvailability('unavailable');
        }
      }
    }
    checkBotAvailability().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [medplum]);

  const isProjectVoiceEnabled = medplum.getProject()?.features?.includes('ai-realtime') ?? false;
  const isVoiceEnabled = isProjectVoiceEnabled && botAvailability === 'available';
  let idleLabel: ReactNode = DEFAULT_IDLE_LABEL;
  if (!isProjectVoiceEnabled) {
    idleLabel = (
      <>
        Voice dictation is not enabled for this project
        <br />
        Please contact support
      </>
    );
  } else if (botAvailability === 'unavailable') {
    idleLabel = (
      <>
        Voice dictation unavailable: bot '{botIdentifier.value ?? ''}' is not deployed
        <br />
        Please contact support
      </>
    );
  }

  const { start, stop, status } = useWhisper({
    model: 'gpt-4o-transcribe',
    onTranscript: (text) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }
      const previous = inputRef.current.trim();
      const next = previous ? `${previous} ${trimmed}` : trimmed;
      inputRef.current = next;
      setTranscript(next);
      onTranscript?.(next, trimmed);
    },
  });

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const processTranscript = useCallback(
    async (transcript: string) => {
      if (!questionnaireRef.current || !transcript.trim()) {
        return;
      }

      setIsProcessing(true);
      try {
        const existingResponse = responseRef.current;
        const parameter: Parameters['parameter'] = [
          { name: 'questionnaire', valueString: JSON.stringify(questionnaireRef.current) },
          { name: 'transcript', valueString: transcript },
        ];
        if (existingResponse?.item && existingResponse.item.length > 0) {
          parameter.push({ name: 'questionnaireResponse', valueString: JSON.stringify(existingResponse) });
        }
        if (aiModel) {
          parameter.push({ name: 'model', valueString: aiModel });
        }

        const response = await medplum.executeBot(botIdentifier, {
          resourceType: 'Parameters',
          parameter,
        });

        const responseParam = response.parameter?.find((p: { name: string }) => p.name === 'questionnaireResponse');
        if (responseParam?.valueString) {
          try {
            const aiQuestionnaireResponse = JSON.parse(responseParam.valueString) as QuestionnaireResponse;
            const preservedExtensions = (aiQuestionnaireResponse.extension ?? []).filter(
              (e) => e.url !== VOICE_TRANSCRIPT_EXTENSION_URL
            );
            aiQuestionnaireResponse.extension = [
              ...preservedExtensions,
              { url: VOICE_TRANSCRIPT_EXTENSION_URL, valueString: fullTranscriptRef.current },
            ];
            responseRef.current = aiQuestionnaireResponse;
            setQuestionnaireResponse(aiQuestionnaireResponse);
            setResponseVersion((v) => v + 1);
          } catch (parseError) {
            console.error('Failed to parse bot response as QuestionnaireResponse:', parseError);
            notify.show({
              color: 'red',
              message: `Failed to parse bot response as QuestionnaireResponse: ${normalizeErrorString(parseError)}`,
            });
          }
        }
      } catch (error) {
        console.error('Error processing transcript with AI:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [medplum, aiModel]
  );

  useEffect(() => {
    flushTranscriptRef.current = async (): Promise<void> => {
      if (inFlightRef.current) {
        return;
      }
      const pending = inputRef.current.trim();
      if (!pending) {
        return;
      }
      inputRef.current = '';
      setTranscript('');
      onTranscript?.('', '');
      fullTranscriptRef.current = fullTranscriptRef.current ? `${fullTranscriptRef.current} ${pending}` : pending;
      setDisplayTranscript(fullTranscriptRef.current);
      inFlightRef.current = true;
      try {
        await processTranscript(pending);
      } finally {
        inFlightRef.current = false;
      }
      // Auto-drain: if speech accumulated while we were processing and the user
      // isn't actively mid-utterance, fire the next $ai immediately.
      if (inputRef.current.trim() && statusRef.current !== 'speech_started') {
        flushTranscriptRef.current().catch((err) => console.error('Error draining transcript:', err));
      }
    };
  }, [processTranscript, onTranscript]);

  const debouncedFlush = useDebouncedCallback(() => {
    if (statusRef.current === 'speech_started') {
      return;
    }
    flushTranscriptRef
      .current()
      .catch((err) =>
        notify.show({ color: 'red', message: `Error flushing transcript: ${normalizeErrorString(err)}` })
      );
  }, silenceDebounceMs ?? DEFAULT_SILENCE_DEBOUNCE_MS);

  useEffect(() => {
    if (status === 'speech_stopped') {
      debouncedFlush();
    }
  }, [status, debouncedFlush]);

  // Auto-scroll the transcript area to the latest text as it streams in.
  useEffect(() => {
    const viewport = transcriptViewportRef.current;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [transcript, displayTranscript]);

  const isConnecting = status === 'requesting_microphone' || status === 'connecting' || status === 'connected';
  const isRecording = status === 'listening' || status === 'speech_started' || status === 'speech_stopped';

  const handleStartDictation = useCallback((): void => {
    setExpanded(true);
    start().catch((err) => console.error('Error starting voice input:', err));
  }, [start]);

  const handleStopDictation = useCallback((): void => {
    setIsStopping(true);
    stop();

    flushTranscriptRef
      .current()
      .catch((err) =>
        notify.show({ color: 'red', message: `Error flushing transcript: ${normalizeErrorString(err)}` })
      );
  }, [stop]);

  const handleToggleExpanded = useCallback((): void => {
    setExpanded((prev) => !prev);
  }, []);

  const handleClearTranscript = useCallback((): void => {
    inputRef.current = '';
    fullTranscriptRef.current = '';
    setTranscript('');
    setDisplayTranscript('');
    onTranscript?.('', '');
    const existing = responseRef.current;
    if (existing?.extension?.some((e) => e.url === VOICE_TRANSCRIPT_EXTENSION_URL)) {
      const next: QuestionnaireResponse = {
        ...existing,
        extension: existing.extension.filter((e) => e.url !== VOICE_TRANSCRIPT_EXTENSION_URL),
      };
      responseRef.current = next;
      setQuestionnaireResponse(next);
    }
  }, [onTranscript]);

  useEffect(() => {
    if (isStopping && !isConnecting && !isRecording) {
      setIsStopping(false);
    }
  }, [isStopping, isProcessing, isConnecting, isRecording]);

  // Track the questionnaire prop
  useEffect(() => {
    if (typeof props.questionnaire === 'object' && 'resourceType' in props.questionnaire) {
      questionnaireRef.current = props.questionnaire;
    }
  }, [props.questionnaire]);

  const isActive = isRecording && !isStopping;
  const isButtonLoading = isConnecting || isStopping;
  const showStopButton = isActive && !isButtonLoading;
  const showButtonLoader = isButtonLoading;

  let dictationLabel = 'Start Dictation';
  if (isStopping) {
    dictationLabel = 'Stopping…';
  } else if (isConnecting) {
    dictationLabel = 'Starting…';
  } else if (showStopButton) {
    dictationLabel = 'Stop Dictation';
  }

  // Show "Processing…" whenever a bot call is in flight OR a Stop is in progress.
  // The stop case covers the window where we're draining pending transcript chunks
  // before the bot call kicks off — without this, the label snaps back to the idle
  // copy mid-action and the user thinks the click did nothing.
  const isFinishing = (isProcessing || isStopping) && !isRecording && !isConnecting;
  let activeStatusLabel: string | undefined;
  if (isProcessing || isStopping) {
    activeStatusLabel = 'Processing…';
  } else if (isRecording) {
    activeStatusLabel = 'Listening…';
  }

  let statusState: 'finishing' | 'recording' | 'idle' = 'idle';
  let statusIcon: JSX.Element = <IconMicrophone size={20} />;
  if (isFinishing) {
    statusState = 'finishing';
    statusIcon = <Spinner className="size-4 text-primary" />;
  } else if (activeStatusLabel) {
    statusState = 'recording';
    statusIcon = <IconCircleFilled size={16} />;
  }

  const afterHeader = (
    <Collapsible open={expanded} className="rounded-md border bg-background">
      <div className="flex min-h-14 items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center" data-state={statusState}>
          <span
            className={cn(
              'relative flex size-5 shrink-0 items-center justify-center text-muted-foreground',
              statusState === 'recording' && 'animate-pulse text-destructive'
            )}
            aria-hidden
          >
            {statusIcon}
          </span>
          <span className="ml-2 truncate text-sm font-medium text-foreground" aria-live="polite">
            {activeStatusLabel ? (
              <span className={isFinishing ? 'text-muted-foreground' : 'text-destructive'}>{activeStatusLabel}</span>
            ) : (
              idleLabel
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className={cn(
              'w-40 shrink-0',
              showButtonLoader && 'border-muted bg-muted text-muted-foreground hover:bg-muted'
            )}
            variant={showStopButton ? 'secondary' : 'default'}
            size="sm"
            disabled={showButtonLoader || (!isVoiceEnabled && !showStopButton)}
            onClick={showStopButton ? handleStopDictation : handleStartDictation}
          >
            {showButtonLoader && <Spinner className="size-3.5" />}
            {dictationLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={expanded ? 'Collapse transcript' : 'Expand transcript'}
            aria-expanded={expanded}
            onClick={handleToggleExpanded}
          >
            {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </Button>
        </div>
      </div>
      <CollapsibleContent forceMount className="data-[state=closed]:hidden">
        <div className="px-4">
          <Separator />
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-sm font-bold">How to Use</p>
              <div className="text-sm leading-[22px] text-foreground [&_ul]:m-0 [&_ul]:pl-5 [&_ul>li+li]:mt-3">
                {voiceInstructions ?? DEFAULT_INSTRUCTIONS}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">Transcript</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-destructive hover:text-destructive"
                  disabled={!displayTranscript && !transcript}
                  onClick={handleClearTranscript}
                >
                  <IconTrash size={14} />
                  Clear
                </Button>
              </div>
              <div className="min-h-48 flex-1 md:relative md:min-h-0">
                <div
                  ref={transcriptViewportRef}
                  className="h-full overflow-x-hidden overflow-y-auto rounded-sm bg-muted p-3 md:absolute md:inset-0 md:h-auto"
                >
                  <pre className="m-0 block whitespace-pre-wrap break-words p-0 font-mono text-xs leading-5 text-foreground">
                    {(displayTranscript && transcript
                      ? `${displayTranscript} ${transcript}`
                      : displayTranscript || transcript) || TRANSCRIPT_PLACEHOLDER}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <QuestionnaireForm
      key={responseVersion}
      {...questionnaireFormProps}
      questionnaireResponse={questionnaireResponse}
      afterHeader={afterHeader}
      onChange={(response) => {
        setQuestionnaireResponse(response);
        props.onChange?.(response);
      }}
    />
  );
}
