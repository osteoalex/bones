import { TAction } from '../../../../types/store.types';
import { setLayersData } from '../slices/layers.slice';

export function updateProps(val: Record<string, string>): TAction {
  return async (dispatch, getState) => {
    const { layersData, activeLayerIdx } = getState().layers;
    const { infoDetails } = getState().selected;
    const newData = {
      ...layersData[activeLayerIdx].fragments.features[
        Number(infoDetails.getId())
      ],
      properties: {
        targetId: val.targetId,
        "Fragment's area": val["Fragment's area"], // eslint-disable-line
        stroke: val.stroke,
        fill: val.fill,
        strokeWidth: val.strokeWidth,
        ...layersData[activeLayerIdx].propertiesConfig
          .map((item) => item.name)
          .reduce<Record<string, string>>((acc, key) => {
            acc[key] = val[key];
            return acc;
          }, {}),
      },
    };
    const updatedFeatures = [...layersData[activeLayerIdx].fragments.features];
    updatedFeatures.splice(Number(infoDetails.getId()), 1, newData);
    const updatedLayer = {
      ...layersData[activeLayerIdx],
      fragments: {
        ...layersData[activeLayerIdx].fragments,
        features: updatedFeatures,
      },
    };
    infoDetails.setProperties(newData.properties);
    const updatedLayers = [...layersData];
    updatedLayers.splice(activeLayerIdx, 1, updatedLayer);
    dispatch(setLayersData(updatedLayers));
    await window.electron.saveFeaturesToTempFile(updatedLayers);
  };
}
