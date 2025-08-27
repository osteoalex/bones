import { TAction } from '../../../../types/store.types';
import { setLayersData } from '../slices/layers.slice';

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
    dispatch(setLayersData(updatedLayers));
    await window.electron.saveFeaturesToTempFile(updatedLayers);
  };
}
