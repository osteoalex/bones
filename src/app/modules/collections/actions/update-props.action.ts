import { TAction } from '../../../../types/store.types';
import { setLayersData } from '../slices/layers.slice';
import { setInfoDetails } from '../slices/selected.slice';

export function updateProps(val: Record<string, string>[]): TAction {
  return async (dispatch, getState) => {
    const { layersData, activeLayerIdx } = getState().layers;
    const { infoDetails } = getState().selected;
    if (
      !infoDetails ||
      !Array.isArray(infoDetails) ||
      infoDetails.length === 0
    ) {
      return;
    }

    const updatedFeatures = [...layersData[activeLayerIdx].fragments.features];

    // val is an array, each item corresponds to the same index in infoDetails
    for (let i = 0; i < infoDetails.length; i++) {
      const feature = infoDetails[i];
      const data = val[i];
      if (!data) continue;
      const idx = updatedFeatures.findIndex((f) => f.id === feature.getId());
      if (idx === -1) continue;
      const newData = {
        ...updatedFeatures[idx],
        properties: {
          targetId: data.targetId,
          "Fragment's area": data["Fragment's area"], // eslint-disable-line
          stroke: data.stroke,
          fill: data.fill,
          strokeWidth: data.strokeWidth,
          ...layersData[activeLayerIdx].propertiesConfig
            .map((item) => item.name)
            .reduce<Record<string, string>>((acc, key) => {
              acc[key] = data[key];
              return acc;
            }, {}),
        },
      };
      updatedFeatures.splice(idx, 1, newData);
      feature.setProperties(newData.properties);
    }

    const updatedLayer = {
      ...layersData[activeLayerIdx],
      fragments: {
        ...layersData[activeLayerIdx].fragments,
        features: updatedFeatures,
      },
    };
    // Update all features in infoDetails with their new properties, immutably
    const newInfoDetails = infoDetails.map((feature, i) => {
      const data = val[i];
      if (!data) return feature;
      const idx = updatedFeatures.findIndex((f) => f.id === feature.getId());
      if (idx === -1) return feature;
      const newData = {
        ...updatedFeatures[idx],
        properties: {
          targetId: data.targetId,
          "Fragment's area": data["Fragment's area"], // eslint-disable-line
          stroke: data.stroke,
          fill: data.fill,
          strokeWidth: data.strokeWidth,
          ...layersData[activeLayerIdx].propertiesConfig
            .map((item) => item.name)
            .reduce<Record<string, string>>((acc, key) => {
              acc[key] = data[key];
              return acc;
            }, {}),
        },
      };
      feature.setProperties(newData.properties);
      return feature;
    });
    // Update infoDetails in Redux state
    dispatch(setInfoDetails(newInfoDetails));
    const updatedLayers = [...layersData];
    updatedLayers.splice(activeLayerIdx, 1, updatedLayer);
    dispatch(setLayersData(updatedLayers));
    await window.electron.saveFeaturesToTempFile(updatedLayers);
  };
}
