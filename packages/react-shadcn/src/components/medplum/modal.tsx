// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/Modal/Modal.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentProps, JSX } from 'react';

const modalContentVariants = cva('flex flex-col max-h-[85vh] gap-0 p-0', {
  variants: {
    size: {
      sm: 'sm:max-w-[24rem]',
      md: 'sm:max-w-[32rem]',
      lg: 'sm:max-w-[40rem]',
      xl: 'sm:max-w-[56rem]',
      full: 'h-[100vh] max-h-[100vh] w-[100vw] max-w-[100vw] rounded-none',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface ModalProps extends ComponentProps<typeof DialogContent>, VariantProps<typeof modalContentVariants> {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly centered?: boolean;
  readonly closeOnClickOutside?: boolean;
  readonly withCloseButton?: boolean;
}

// Upstream Mantine centers by default and only offsets to the top when `centered` is false; the
// Radix content is centered by DialogContent's own positioning, so `centered={false}` pins it near
// the top instead of leaving it vertically centered.
export function Modal(props: ModalProps): JSX.Element {
  const {
    open,
    onOpenChange,
    size,
    centered = true,
    closeOnClickOutside = true,
    withCloseButton = true,
    className,
    onInteractOutside,
    ...rest
  } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="modal"
        showCloseButton={withCloseButton}
        onInteractOutside={closeOnClickOutside ? onInteractOutside : (event) => event.preventDefault()}
        className={cn(modalContentVariants({ size }), !centered && 'top-8 translate-y-0', className)}
        {...rest}
      />
    </Dialog>
  );
}

export function ModalHeader({ className, ...props }: ComponentProps<'div'>): JSX.Element {
  return <div data-slot="modal-header" className={cn('shrink-0 border-b px-6 py-4', className)} {...props} />;
}

export function ModalTitle({ className, ...props }: ComponentProps<typeof DialogTitle>): JSX.Element {
  return <DialogTitle data-slot="modal-title" className={cn('text-lg font-bold', className)} {...props} />;
}

export function ModalDescription({ className, ...props }: ComponentProps<typeof DialogDescription>): JSX.Element {
  return <DialogDescription data-slot="modal-description" className={className} {...props} />;
}

export function ModalBody({ className, ...props }: ComponentProps<'div'>): JSX.Element {
  return (
    <div data-slot="modal-body" className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4', className)} {...props} />
  );
}

export function ModalFooter({ className, ...props }: ComponentProps<'div'>): JSX.Element {
  return (
    <div
      data-slot="modal-footer"
      className={cn('flex shrink-0 justify-end gap-2 border-t px-6 py-4', className)}
      {...props}
    />
  );
}
