import { TAction } from '../../../../types/store.types';
import { setCurrentItem } from '../slices/editor.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import {
  setNewItemNameDialogOpen,
  setNewLayerPopupVisible,
} from '../slices/ui.slice';

export function createNewItem(data: {
  name: string;
  background: string;
}): TAction<void> {
  return async (dispatch) => {
    const itemPath = await window.electron.createNewItem(
      data.name,
      data.background,
    );
    if (!itemPath) {
      return;
    }
    dispatch(setLayersData([]));
    dispatch(setLayers([]));
    dispatch(setCurrentItem(itemPath));
    dispatch(setNewItemNameDialogOpen(false));
    dispatch(setNewLayerPopupVisible(true));
  };
}
