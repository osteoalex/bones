import { TAction } from '../../../../types/store.types';
import { setLayersData } from '../slices/layers.slice';
import { saveSnapshot } from './saveSnapshot.action';

export function toggleLayerVisibility(
  index: number,
  visible: boolean,
): TAction<void> {
  return async (dispatch, getState) => {
    const { layersData, layers } = getState().layers;
    const updatedLayers = [...layersData];
    updatedLayers[index] = {
      ...updatedLayers[index],
      visible: visible,
    };
    const updatedLayer = layers[index];
    updatedLayer.base.setVisible(visible);
    // save snapshot for undo
    dispatch(saveSnapshot());
    dispatch(setLayersData(updatedLayers));
    await window.electron.saveFeaturesToTempFile(updatedLayers);
  };
}
