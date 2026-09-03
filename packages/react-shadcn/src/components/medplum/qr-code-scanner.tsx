// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/QrCodeScanner/QrCodeScanner.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { normalizeErrorString } from '@medplum/core';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

const SCAN_INTERVAL_MS = 150;

type JsQr = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }
) => { data: string } | null;

let jsQrPromise: Promise<JsQr> | undefined;

export interface QrCodeScannerProps {
  readonly onScan: (data: string) => void;
  readonly onError?: (error: Error) => void;
  readonly scanOnce?: boolean;
}

export function QrCodeScanner({ onScan, onError, scanOnce = true }: QrCodeScannerProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const video = videoRef.current;
    const canvasElement = canvasRef.current;
    const ctx = canvasElement?.getContext('2d', { willReadFrequently: true });
    if (!video || !canvasElement || !ctx) {
      return undefined;
    }
    const videoElement = video;
    const scanCanvas = canvasElement;
    const scanCtx = ctx;

    let rafId = 0;
    let stream: MediaStream | undefined;
    let cancelled = false;
    let scanned = false;
    let lastScanTime = 0;
    let jsQr: JsQr | undefined;

    function stopStream(): void {
      stream?.getTracks().forEach((t) => t.stop());
    }

    function fail(err: unknown): void {
      const normalized = err instanceof Error ? err : new Error(String(err));
      if (!cancelled) {
        setLoading(false);
        setError(normalizeErrorString(normalized));
        onErrorRef.current?.(normalized);
      }
    }

    function tick(timestamp: number): void {
      if (cancelled || scanned || !jsQr) {
        return;
      }
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        setLoading(false);
        if (timestamp - lastScanTime >= SCAN_INTERVAL_MS) {
          lastScanTime = timestamp;
          scanCanvas.height = videoElement.videoHeight;
          scanCanvas.width = videoElement.videoWidth;
          scanCtx.drawImage(videoElement, 0, 0, scanCanvas.width, scanCanvas.height);
          const imageData = scanCtx.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
          const code = jsQr(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
          if (code?.data) {
            scanned = scanOnce;
            onScanRef.current(code.data);
            if (scanOnce) {
              stopStream();
              return;
            }
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    async function start(): Promise<void> {
      try {
        jsQr = await loadJsQr();
        if (cancelled) {
          return;
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not available in this browser.');
        }
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = mediaStream;
        videoElement.srcObject = mediaStream;
        videoElement.setAttribute('playsinline', 'true');
        await videoElement.play();
        if (!cancelled) {
          rafId = requestAnimationFrame(tick);
        }
      } catch (err) {
        fail(err);
      }
    }

    start().catch(fail);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stopStream();
    };
  }, [scanOnce]);

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div
        className={`relative aspect-[4/3] w-full max-h-[70vh] overflow-hidden rounded-md bg-black ${error ? 'hidden' : 'block'}`}
      >
        <video ref={videoRef} width={640} height={480} muted className="block size-full object-cover" />
        {loading && !error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="text-gray-300" />
              <p className="text-sm text-gray-300">Loading camera...</p>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}

async function loadJsQr(): Promise<JsQr> {
  if (!jsQrPromise) {
    jsQrPromise = import('jsqr')
      .then((module) => module.default as JsQr)
      .catch((err) => {
        jsQrPromise = undefined;
        throw new Error(
          `QR code scanning requires the optional "jsqr" dependency. Install jsqr to use QrCodeScanner. ${normalizeErrorString(
            err
          )}`
        );
      });
  }
  return jsQrPromise;
}
