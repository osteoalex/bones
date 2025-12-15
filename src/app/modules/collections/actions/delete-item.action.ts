import { TAction } from '../../../../types/store.types';
import { setCurrentItem, setItems } from '../slices/editor.slice';
import { setLoading } from '../slices/ui.slice';

export function deleteItemAction(filename: string): TAction<void> {
  return async (dispatch, getState) => {
    dispatch(setLoading(true));
    await window.electron.deleteItem(filename);

    const items = await window.electron.getAllItems();
    dispatch(setItems(items));

    if (
      getState().editor.currentItem &&
      getState().editor.currentItem === filename
    ) {
      dispatch(setCurrentItem(''));
    }

    dispatch(setLoading(false));
  };
}
