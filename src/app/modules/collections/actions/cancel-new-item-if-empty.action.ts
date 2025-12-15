import { TAction } from '../../../../types/store.types';
import { setCurrentItem, setItems } from '../slices/editor.slice';

export function cancelNewItemIfNoLayers(): TAction<Promise<boolean>> {
  return async (dispatch, getState) => {
    const { layersData } = getState().layers;
    const current = getState().editor.currentItem;
    if (!current) return false;
    if (Array.isArray(layersData) && layersData.length === 0) {
      try {
        const ok = await window.electron.cancelNewItemIfEmpty(current);
        if (!ok) return false;
        dispatch(setCurrentItem(''));
        const items = await window.electron.getAllItems();
        dispatch(setItems(items));
        return true;
      } catch (e) {
        window.electron.logError?.('cancelNewItemIfNoLayers: delete failed', e);
        return false;
      }
    }
    return false;
  };
}
