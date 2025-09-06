import { AppDispatch } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import type { RootState } from '../../../store';
import { setContextMenu } from '../slices/ui.slice';
import { abortAll } from './abort.action';

export function handleRightClick(e: MouseEvent) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { mode, currentItem } = getState().editor;
    // Only allow context menu if an item is opened
    if (!currentItem) return;
    // If a drawing mode is active, abort drawing as before
    if (
      mode === EDIT_MODE_TYPE.ADDITION ||
      mode === EDIT_MODE_TYPE.SPLIT ||
      mode === EDIT_MODE_TYPE.SUBTRACTION
    ) {
      await dispatch(abortAll());
    } else {
      dispatch(setContextMenu({ x: e.clientX, y: e.clientY, visible: true }));
    }
  };
}
