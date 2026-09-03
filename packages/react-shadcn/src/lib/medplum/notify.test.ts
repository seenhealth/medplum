// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { notify } from '@/lib/medplum/notify';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(() => 'error-id'),
    success: vi.fn(() => 'success-id'),
    info: vi.fn(() => 'info-id'),
    warning: vi.fn(() => 'warning-id'),
    message: vi.fn(() => 'message-id'),
    loading: vi.fn(() => 'loading-id'),
    dismiss: vi.fn(),
  },
}));

describe('notify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('show maps color red to toast.error', () => {
    notify.show({ color: 'red', message: 'Something failed' });
    expect(toast.error).toHaveBeenCalledWith('Something failed', expect.objectContaining({ id: undefined }));
  });

  test('show maps color green to toast.success', () => {
    notify.show({ color: 'green', message: 'Saved' });
    expect(toast.success).toHaveBeenCalledWith('Saved', expect.anything());
  });

  test('show maps color blue to toast.info', () => {
    notify.show({ color: 'blue', message: 'FYI' });
    expect(toast.info).toHaveBeenCalledWith('FYI', expect.anything());
  });

  test('show maps color yellow to toast.warning', () => {
    notify.show({ color: 'yellow', message: 'Careful' });
    expect(toast.warning).toHaveBeenCalledWith('Careful', expect.anything());
  });

  test('show with no color maps to toast.message', () => {
    notify.show({ message: 'Plain' });
    expect(toast.message).toHaveBeenCalledWith('Plain', expect.anything());
  });

  test('show with loading true maps to toast.loading regardless of color', () => {
    notify.show({ loading: true, title: 'Uploading...', message: 'Please wait...' });
    expect(toast.loading).toHaveBeenCalledWith(
      'Uploading...',
      expect.objectContaining({ description: 'Please wait...' })
    );
  });

  test('title becomes the toast content and message becomes the description', () => {
    notify.show({ color: 'red', title: 'Upload error', message: 'Network failure' });
    expect(toast.error).toHaveBeenCalledWith(
      'Upload error',
      expect.objectContaining({ description: 'Network failure' })
    );
  });

  test('autoClose false maps to duration Infinity', () => {
    notify.show({ color: 'red', message: 'Failed', autoClose: false });
    expect(toast.error).toHaveBeenCalledWith('Failed', expect.objectContaining({ duration: Infinity }));
  });

  test('autoClose number maps to duration', () => {
    notify.show({ color: 'green', message: 'Done', autoClose: 2000 });
    expect(toast.success).toHaveBeenCalledWith('Done', expect.objectContaining({ duration: 2000 }));
  });

  test('id is passed through', () => {
    notify.show({ color: 'red', message: 'Failed', id: 'upload-notification' });
    expect(toast.error).toHaveBeenCalledWith('Failed', expect.objectContaining({ id: 'upload-notification' }));
  });

  test('update reuses the same id', () => {
    notify.update('upload-notification', { color: 'green', title: 'Upload complete', message: '', autoClose: 2000 });
    expect(toast.success).toHaveBeenCalledWith(
      'Upload complete',
      expect.objectContaining({ id: 'upload-notification', duration: 2000 })
    );
  });

  test('error, success and info conveniences pass color and title through', () => {
    notify.error('Bad', 'Error');
    expect(toast.error).toHaveBeenCalledWith('Error', expect.objectContaining({ description: 'Bad' }));

    notify.success('Good', 'Success');
    expect(toast.success).toHaveBeenCalledWith('Success', expect.objectContaining({ description: 'Good' }));

    notify.info('FYI', 'Info');
    expect(toast.info).toHaveBeenCalledWith('Info', expect.objectContaining({ description: 'FYI' }));
  });

  test('hide calls toast.dismiss', () => {
    notify.hide('upload-notification');
    expect(toast.dismiss).toHaveBeenCalledWith('upload-notification');
  });
});
