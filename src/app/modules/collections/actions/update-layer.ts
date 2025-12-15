import { Fill, Stroke, Style } from 'ol/style';

import { Layer } from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import { setEditedLayer } from '../slices/editor.slice';
import { pushSnapshot } from '../slices/history.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { resetFeatureStyle } from './reset.action';

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

    // Update fragment feature properties so they inherit the layer's style
    if (
      currentLayersData.fragments &&
      Array.isArray(currentLayersData.fragments.features)
    ) {
      const updatedFeatures = currentLayersData.fragments.features.map((f) => ({
        ...f,
        properties: {
          ...(f.properties || {}),
          stroke: config.stroke,
          fill: config.fill,
          strokeWidth: config.strokeWidth,
        },
      }));

      currentLayersData = {
        ...currentLayersData,
        fragments: {
          ...currentLayersData.fragments,
          features: updatedFeatures,
        },
      };

      // Update OL features in the layer source to match new properties/styles
      try {
        const source = currentLayer.source;
        if (source) {
          source.getFeatures().forEach((feat) => {
            const props = feat.getProperties() || {};
            feat.setProperties({
              ...props,
              stroke: config.stroke,
              fill: config.fill,
              strokeWidth: config.strokeWidth,
            });
            // Use centralized reset helper so styles are applied consistently
            resetFeatureStyle(feat);
          });
        }
      } catch (err) {
        // swallow errors here to avoid breaking UI updates
        // (no logging to keep this function lightweight)
      }
    }

    const updatedLayers = [...layers];
    updatedLayers[editedLayerIdx] = currentLayer;
    // save snapshot for undo
    const { layersData: currentLayersDataSnapshot } = getState().layers;
    dispatch(
      pushSnapshot(JSON.parse(JSON.stringify(currentLayersDataSnapshot))),
    );
    const newLayersData = [...layersData];
    newLayersData[editedLayerIdx] = currentLayersData;
    dispatch(setLayersData(newLayersData));
    dispatch(setLayers(updatedLayers));
    // persist temp features so external processes (e.g. autosave) see updates
    await window.electron.saveFeaturesToTempFile(newLayersData);
    dispatch(setEditedLayer(null));
  };
}
