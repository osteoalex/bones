import { TAction } from '../../../../types/store.types';
import { setCurrentItem, setItems } from '../slices/editor.slice';
import { setLoading } from '../slices/ui.slice';

export function renameItemAction(
  oldFilename: string,
  newName: string,
): TAction<void> {
  return async (dispatch, getState) => {
    dispatch(setLoading(true));
    await window.electron.renameItem(oldFilename, newName);

    const items = await window.electron.getAllItems();
    dispatch(setItems(items));

    if (getState().editor.currentItem === oldFilename) {
      dispatch(setCurrentItem(newName));
    }

    dispatch(setLoading(false));
  };
}
