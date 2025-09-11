import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { SelectEvent } from 'ol/interaction/Select';
import { Fill, Stroke, Style } from 'ol/style';

import { TAction } from '../../../../types/store.types';
import { geojsonFormat, getNextId } from '../../../../utils';
import {
  baseStyle,
  selectMultipleStyle,
} from '../components/collection-home/editor-styles';
import { setLayersData } from '../slices/layers.slice';
import { setMultipleAddIds, setSelectedBone } from '../slices/selected.slice';
import { recalculateAreas } from './calculate-area.action';

export function addMultipleHandler(e: SelectEvent): TAction {
  return (dispatch, getState) => {
    const { baseSourceRef } = getState().layers;
    const { multipleAddIds } = getState().selected;
    if (baseSourceRef) {
      if (e.selected.length) {
        const id = e.selected[0].getId().toString();
        const ids = new Set(multipleAddIds).add(id);
        dispatch(setMultipleAddIds([...ids]));
        if (ids.size) {
          ids.forEach((id) => {
            const feature = baseSourceRef.getFeatureById(id);
            feature.setStyle(selectMultipleStyle);
          });
        } else {
          baseSourceRef.forEachFeature((feature) => {
            feature.setStyle(baseStyle);
          });
        }
        document.dispatchEvent(
          new CustomEvent('updateSelection', {
            detail: [...ids],
          }),
        );
      } else {
        dispatch(setMultipleAddIds([]));
        baseSourceRef.forEachFeature((feature) => {
          feature.setStyle(baseStyle);
        });
        document.dispatchEvent(new CustomEvent('resetSelection'));
      }
    }
    e.selected = [];
    e.deselected = [];
  };
}

export function addMultipleCommitHandler(): TAction {
  return async (dispatch, getState) => {
    const { baseSourceRef, layers, activeLayerIdx, layersData } =
      getState().layers;
    const selectedBones = getState().selected.selectedBone;
    if (!selectedBones.length) {
      return;
    }
    const properties = layersData[activeLayerIdx].propertiesConfig.reduce<
      Record<string, string | number>
    >((acc, current) => {
      acc[current.name] = current.defaultValue;
      return acc;
    }, {});
    properties.fill = layersData[activeLayerIdx].fill;
    properties.stroke = layersData[activeLayerIdx].stroke;
    properties.strokeWidth = layersData[activeLayerIdx].strokeWidth;
    const overlapping: Feature<Geometry>[] = [];

    for (const bone of selectedBones) {
      const id = bone.getId();
      const base = baseSourceRef.getFeatureById(id);
      if (!base) continue;
      base.setStyle(baseStyle);
      const cloned = base.clone();
      cloned.setId(id);
      cloned.setStyle(
        new Style({
          stroke: new Stroke({
            color: layersData[activeLayerIdx].stroke,
            width: layersData[activeLayerIdx].strokeWidth,
          }),
          fill: new Fill({
            color: layersData[activeLayerIdx].fill,
          }),
        }),
      );
      overlapping.push(
        ...layers[activeLayerIdx].source
          .getFeatures()
          .filter((f) => f.getProperties().targetId === id),
      );
      cloned.setProperties({
        targetId: id,
        ...properties,
        "Fragment's area": '100.00%', // eslint-disable-line
      });
      cloned.setId(getNextId(layers[activeLayerIdx].source.getFeatures()));
      layers[activeLayerIdx].source.addFeature(cloned);
    }
    if (overlapping.length) {
      overlapping.forEach((overlapped) =>
        layers[activeLayerIdx].source.removeFeature(overlapped),
      );
    }

    const geojson = geojsonFormat.writeFeaturesObject(
      layers[activeLayerIdx].source.getFeatures(),
    );
    const newLayersData = [...layersData];

    newLayersData[activeLayerIdx] = {
      ...layersData[activeLayerIdx],
      fragments: geojson,
    };

    dispatch(setLayersData(newLayersData));
    dispatch(recalculateAreas());
    await window.electron.saveFeaturesToTempFile(newLayersData);

    document.dispatchEvent(new CustomEvent('resetSelection'));
    dispatch(setSelectedBone([]));
  };
}
