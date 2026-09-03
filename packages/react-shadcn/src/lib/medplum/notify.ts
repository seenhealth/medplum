// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from 'react';
import { toast } from 'sonner';

export type NotifyColor = 'red' | 'green' | 'blue' | 'yellow';

export interface NotifyOptions {
  readonly color?: NotifyColor;
  readonly title?: ReactNode;
  readonly message: ReactNode;
  readonly id?: string;
  readonly autoClose?: number | false;
  readonly loading?: boolean;
}

export type NotifyUpdateOptions = Omit<NotifyOptions, 'id'>;

interface ToastData {
  readonly id?: string;
  readonly description?: ReactNode;
  readonly duration?: number;
}

function toToastData(options: NotifyOptions): ToastData {
  const { id, title, message, autoClose } = options;
  return {
    id,
    description: title ? message : undefined,
    duration: autoClose === false ? Infinity : autoClose,
  };
}

function show(options: NotifyOptions): string | number {
  const { color, title, message, loading } = options;
  const content = title ?? message;
  const data = toToastData(options);

  if (loading) {
    return toast.loading(content, data);
  }

  switch (color) {
    case 'red':
      return toast.error(content, data);
    case 'green':
      return toast.success(content, data);
    case 'yellow':
      return toast.warning(content, data);
    case 'blue':
      return toast.info(content, data);
    default:
      return toast.message(content, data);
  }
}

function update(id: string, options: NotifyUpdateOptions): string | number {
  return show({ ...options, id });
}

function error(message: ReactNode, title?: ReactNode): string | number {
  return show({ color: 'red', title, message });
}

function success(message: ReactNode, title?: ReactNode): string | number {
  return show({ color: 'green', title, message });
}

function info(message: ReactNode, title?: ReactNode): string | number {
  return show({ color: 'blue', title, message });
}

function hide(id: string | number): void {
  toast.dismiss(id);
}

export const notify = { show, update, error, success, info, hide };
