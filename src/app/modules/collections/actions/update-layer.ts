import { Fill, Stroke, Style } from 'ol/style';

import { Layer } from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import { setEditedLayer } from '../slices/editor.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';

export function updateLayer(config: Layer, editedLayerIdx: number): TAction {
  return async (dispatch, getState) => {
    const {
      layers: { layers, layersData },
    } = getState();

    const currentLayer = layers[editedLayerIdx];
    let currentLayersData = layersData[editedLayerIdx];

    currentLayer.base.setStyle(
      new Style({
        stroke: new Stroke({
          color: config.stroke,
          width: config.strokeWidth,
        }),
        fill: new Fill({
          color: config.fill,
        }),
      }),
    );
    currentLayersData = {
      ...currentLayersData,
      ...config,
    };

    const updatedLayers = [...layers];
    updatedLayers[editedLayerIdx] = currentLayer;
    const newLayersData = [...layersData];
    newLayersData[editedLayerIdx] = currentLayersData;
    dispatch(setLayersData(newLayersData));
    dispatch(setLayers(updatedLayers));
    dispatch(setEditedLayer(null));
  };
}
