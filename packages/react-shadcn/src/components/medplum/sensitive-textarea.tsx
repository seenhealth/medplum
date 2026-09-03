// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/SensitiveTextarea/SensitiveTextarea.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useClipboard } from '@/hooks/medplum/use-clipboard';
import { notify } from '@/lib/medplum/notify';
import { cn } from '@/lib/utils';
import { IconCopy } from '@tabler/icons-react';
import type { ComponentProps, CSSProperties, JSX } from 'react';
import { useRef, useState } from 'react';

export type SensitiveTextareaProps = ComponentProps<typeof Textarea>;

export function SensitiveTextarea(props: SensitiveTextareaProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);
  const clipboard = useClipboard();
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const style: CSSProperties = {
    ...props.style,
    flexGrow: 1,
  };

  return (
    <div className="flex gap-2">
      <Textarea
        {...props}
        style={style}
        ref={ref}
        className={cn('field-sizing-content min-h-0', !revealed && '[-webkit-text-security:disc]', props.className)}
        onFocus={() => setRevealed(true)}
        onBlur={() => setRevealed(false)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Copy secret"
        onClick={() => {
          clipboard.copy(ref.current?.value ?? '');
          notify.success('Copied');
        }}
      >
        <IconCopy />
      </Button>
    </div>
  );
}
