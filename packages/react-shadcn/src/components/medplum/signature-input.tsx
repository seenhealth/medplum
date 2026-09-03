// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SignatureInput/SignatureInput.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProfileResource } from '@medplum/core';
import { createReference, HTTP_HL7_ORG } from '@medplum/core';
import type { Reference, Signature } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import { IconTrash } from '@tabler/icons-react';
import type { ComponentProps, JSX } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

export interface SignatureInputProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  readonly width?: number;
  readonly height?: number;
  readonly defaultValue?: Signature;
  readonly who?: Reference<ProfileResource>;
  readonly onChange: ((value: Signature | undefined) => void) | undefined;
}

export function SignatureInput(props: SignatureInputProps): JSX.Element {
  const medplum = useMedplum();
  const { width = 500, height = 200, defaultValue, who, onChange, className, ...rest } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad>(null);

  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    function handleEndStroke(): void {
      onChangeRef.current?.({
        type: [
          {
            system: HTTP_HL7_ORG + '/fhir/signature-type',
            code: 'ProofOfOrigin',
            display: 'Proof of Origin',
          },
        ],
        when: new Date().toISOString(),
        who: who ?? createReference(medplum.getProfile() as ProfileResource),
        data: signaturePadRef.current?.toDataURL().split(',')[1],
      });
    }

    if (canvasRef.current) {
      const signaturePad = new SignaturePad(canvasRef.current);
      if (defaultValue?.data) {
        signaturePad.fromDataURL(defaultValue.data).catch(console.error);
      }
      signaturePad.addEventListener('endStroke', handleEndStroke);
      signaturePadRef.current = signaturePad;
    }

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.removeEventListener('beginStroke', handleEndStroke);
      }
    };
  }, [medplum, defaultValue, who]);

  const clearSignature = (): void => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    onChangeRef.current?.(undefined);
  };

  return (
    <div
      data-slot="signature-input"
      className={cn('relative rounded-md border bg-card', className)}
      style={{ width, height }}
      {...rest}
    >
      <canvas ref={canvasRef} width={width} height={height} aria-label="Signature input area"></canvas>
      <Button
        onClick={clearSignature}
        aria-label="Clear signature"
        className="absolute top-0 right-0"
        size="sm"
        variant="outline"
      >
        <IconTrash size={16} />
        Clear
      </Button>
    </div>
  );
}
