import { TAction } from '../../../../types/store.types';
import { setLayersData } from '../slices/layers.slice';
import { setInfoDetails } from '../slices/selected.slice';
import { saveSnapshot } from './saveSnapshot.action';

export function deleteAnnotation(targetId: string): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx, layersData } = getState().layers;
    const annotationFeature =
      layers[activeLayerIdx].annotationSource.getFeatureById(targetId);

    if (annotationFeature) {
      const updatedFeatures = layersData[
        activeLayerIdx
      ].annotations.features.filter((f) => f.id !== targetId);
      const updatedLayer = {
        ...layersData[activeLayerIdx],
        annotation: {
          ...layersData[activeLayerIdx].annotations,
          features: updatedFeatures,
        },
      };
      const updatedLayers = [...layersData];
      updatedLayers.splice(activeLayerIdx, 1, updatedLayer);
      // save snapshot for undo
      dispatch(saveSnapshot());
      dispatch(setLayersData(updatedLayers));
      await window.electron.saveFeaturesToTempFile(updatedLayers);
      dispatch(setInfoDetails(null));
      layers[activeLayerIdx].annotationSource.removeFeature(annotationFeature);
    }
  };
}
