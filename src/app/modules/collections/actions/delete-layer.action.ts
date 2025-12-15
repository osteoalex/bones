import { TAction } from '../../../../types/store.types';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { saveSnapshot } from './saveSnapshot.action';

export function deleteLayer(idx: number): TAction {
  return async (dispatch, getState) => {
    const {
      layers: { layers, layersData },
    } = getState();
    // save snapshot for undo
    dispatch(saveSnapshot());
    const currentLayers = [...layers];
    const currentLayersData = [...layersData];
    currentLayers.splice(idx, 1);
    currentLayersData.splice(idx, 1);
    dispatch(setLayers(currentLayers));
    dispatch(setLayersData(currentLayersData));
  };
}
