import { dialog } from 'electron';

export function showError(title = 'Error', message = 'Something went wrong.') {
  dialog.showErrorBox(title, message);
}
