import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import Draw, { createBox, DrawEvent } from 'ol/interaction/Draw';
import { Fill, Stroke, Style } from 'ol/style';

import { TAction } from '../../../../types/store.types';
import { geojsonFormat, getNextId } from '../../../../utils';
import { setAddByRectangleDrawRef } from '../slices/interactions.slice';
import { setLayersData } from '../slices/layers.slice';
import { setMultipleAddIds } from '../slices/selected.splice';
import { recalculateAreas } from './calculate-area.action';

export function setupAddByRectangleDraw(): TAction {
  return (dispatch, getState) => {
    const { addByRectangleDrawRef, addByRectangleSourceRef } =
      getState().interactions;
    const { olMapRef } = getState().layers;
    if (addByRectangleDrawRef) {
      olMapRef.removeInteraction(addByRectangleDrawRef);
    }

    const addByRectangleDraw = new Draw({
      source: addByRectangleSourceRef,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    addByRectangleDraw.setActive(false);
    dispatch(setAddByRectangleDrawRef(addByRectangleDraw));
    addByRectangleDraw.on('drawend', (e: DrawEvent) =>
      dispatch(addByRectangleDrawEndHandler(e)),
    );
    olMapRef.addInteraction(addByRectangleDraw);
  };
}

export function addByRectangleDrawEndHandler(e: DrawEvent): TAction {
  return async (dispatch, getState) => {
    const { baseSourceRef, layers, activeLayerIdx, layersData } =
      getState().layers;
    const { addByRectangleSourceRef } = getState().interactions;
    const rectangle = e.feature;
    const overlapping: Feature<Geometry>[] = [];
    if (baseSourceRef) {
      const selected: string[] = [];
      const featuresList = baseSourceRef
        .getFeaturesInExtent(rectangle.getGeometry().getExtent())
        .filter((feature) => {
          const [minx, miny, maxx, maxy] = feature.getGeometry().getExtent();
          return (
            rectangle.getGeometry().containsXY(minx, miny) &&
            rectangle.getGeometry().containsXY(maxx, maxy)
          );
        });
      const clonedFeatures: Feature[] = [];
      if (featuresList.length) {
        featuresList.forEach((feature) => {
          const cloned = feature.clone();
          cloned.setId(feature.getId());
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
              .filter((f) => f.getProperties().targetId === feature.getId()),
          );
          layers[activeLayerIdx].source.addFeature(cloned);
          clonedFeatures.push(cloned);
          selected.push(feature.getId().toString());
        });
        if (overlapping.length) {
          overlapping.forEach((overlapped) =>
            layers[activeLayerIdx].source.removeFeature(overlapped),
          );
        }
        dispatch(setMultipleAddIds(selected));
        setTimeout(() => {
          addByRectangleSourceRef.removeFeature(rectangle);
        }, 100);
        dispatch(submitMultipleFragmentsHandler());
      }
    }
  };
}

export function submitMultipleFragmentsHandler(): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx, layersData } = getState().layers;
    const { multipleAddIds } = getState().selected;
    const processed: Feature<Geometry>[] = [];

    const properties = layersData[activeLayerIdx].propertiesConfig.reduce<
      Record<string, string | number>
    >((acc, current) => {
      acc[current.name] = current.defaultValue;
      return acc;
    }, {});
    properties.fill = layersData[activeLayerIdx].fill;
    properties.stroke = layersData[activeLayerIdx].stroke;
    properties.strokeWidth = layersData[activeLayerIdx].strokeWidth;

    for (const featureData of multipleAddIds) {
      const feature = layers[activeLayerIdx].source.getFeatureById(featureData);
      const fragmentProps: Record<string, string | undefined> = {
        ...properties,
        targetId: feature.getId().toString(),
        "Fragment's area": '100.00%', // eslint-disable-line
      };
      delete fragmentProps._id;
      feature.setProperties(fragmentProps);
      feature.setId(getNextId(layers[activeLayerIdx].source.getFeatures()));
      processed.push(feature);
    }

    dispatch(setMultipleAddIds([]));
    dispatch(recalculateAreas());

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
  };
}
