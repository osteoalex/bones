import turfBooleanOverlap from '@turf/boolean-overlap';
import { Polygon } from '@turf/helpers';
import turfUnion from '@turf/union';
import {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Point,
} from 'geojson';

import { TAction } from '../../../../types/store.types';
import { booleanContainsSafe } from '../../../../utils';
import { setLayerDetails } from '../slices/editor.slice';
import {
  setDeleteSelectRef,
  setDrawFragmentRef,
  setSnapFragmentRef,
  setSubtractFragmentRef,
} from '../slices/interactions.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { setCombineLayersDialogOpen } from '../slices/ui.slice';
import { recalculateAreas } from './calculate-area.action';
import { changeLayer } from './change-layer.action';
import { saveSnapshot } from './saveSnapshot.action';
import { setupDrawLayers } from './setup-layers-and-sources.action';

export function combineLayers(combinedLayers: string[]): TAction {
  return async (dispatch, getState) => {
    const { layersData, olMapRef, layers } = getState().layers;
    layers.forEach((layer) => {
      olMapRef.removeLayer(layer.base);
      olMapRef.removeLayer(layer.annotationLayer);
    });

    const targetLayerName = combinedLayers.splice(0, 1)[0];
    const layersToCombineNames = combinedLayers;

    const target = {
      ...layersData.find((layer) => layer.name === targetLayerName),
    };
    const toUnion = layersData.filter((layer) =>
      layersToCombineNames.includes(layer.name),
    );

    const resultLayer = toUnion.reduce((acc, layer) => {
      const combined = combineFutureCollections(acc.fragments, layer.fragments);
      const combinedAnnotations = combineFuturePointCollections(
        acc.annotations,
        layer.annotations,
      );
      return {
        ...acc,
        fragments: combined,
        annotations: combinedAnnotations,
      };
    }, target);

    // save snapshot for undo
    dispatch(saveSnapshot());
    const updatedLayersData = [...layersData]
      .map((layer) => (layer.name === target.name ? resultLayer : layer))
      .filter((layer) => !layersToCombineNames.includes(layer.name));

    const updatedLayers = dispatch(setupDrawLayers(updatedLayersData));

    dispatch(setCombineLayersDialogOpen(false));
    dispatch(setLayersData(updatedLayersData));
    dispatch(setLayers(updatedLayers));
    await window.electron.saveFeaturesToTempFile(updatedLayersData);

    updatedLayers.forEach((layer) => {
      olMapRef.addLayer(layer.base);
      olMapRef.addLayer(layer.annotationLayer);
    });

    const targetLayerId = updatedLayersData.findIndex(
      (layer) => layer.name === target.name,
    );

    dispatch(changeLayer(targetLayerId));
    dispatch(setLayerDetails(null));

    const { snap, draw, subtract } = updatedLayers[targetLayerId];
    dispatch(setSnapFragmentRef(snap));
    dispatch(setDeleteSelectRef(updatedLayers[targetLayerId].delete));
    dispatch(setDrawFragmentRef(draw));
    dispatch(setSubtractFragmentRef(subtract));

    dispatch(setCombineLayersDialogOpen(false));
    dispatch(recalculateAreas());
  };
}

function combineFuturePointCollections(
  a: FeatureCollection<Point>,
  b: FeatureCollection<Point>,
): FeatureCollection<Point> {
  // Only allow Point features
  const allFeatures = [...a.features, ...b.features].filter(
    (f) => f.geometry.type === 'Point',
  );
  const merged: FeatureCollection<Point> = {
    ...a,
    features: allFeatures.map((f, i) => ({
      ...f,
      id: i,
      properties: {
        ...f.properties,
        fill: a.features[0]?.properties.fill,
        stroke: a.features[0]?.properties.stroke,
        strokeWidth: a.features[0]?.properties.strokeWidth,
      },
    })),
  };
  return merged;
}

function combineFutureCollections(
  a: FeatureCollection<Geometry>,
  b: FeatureCollection<Geometry>,
): FeatureCollection<Geometry> {
  const merged: FeatureCollection<Geometry> = {
    ...a,
    features: [...a.features, ...b.features].map((f, i) => ({
      ...f,
      id: i,
      properties: {
        ...f.properties,
        fill: a.features[0]?.properties.fill,
        stroke: a.features[0]?.properties.stroke,
        strokeWidth: a.features[0]?.properties.strokeWidth,
      },
    })),
  };

  function mergeOverlapping(
    features: Feature<Geometry>[],
  ): Feature<Geometry>[] {
    const result: Feature<Geometry>[] = [];

    features.forEach((feature) => {
      let hasMerged = false;

      for (let i = 0; i < result.length; i++) {
        // Only attempt geometric unions for polygonal geometries. If either
        // side is not a Polygon/MultiPolygon, skip union checks for this pair.
        const aIsPoly =
          feature.geometry.type === 'Polygon' ||
          feature.geometry.type === 'MultiPolygon';
        const bIsPoly =
          result[i].geometry.type === 'Polygon' ||
          result[i].geometry.type === 'MultiPolygon';
        if (!aIsPoly || !bIsPoly) continue;

        if (
          turfBooleanOverlap(
            result[i] as Feature<Polygon | MultiPolygon>,
            feature as Feature<Polygon | MultiPolygon>,
          ) ||
          booleanContainsSafe(
            result[i] as Feature<Polygon | MultiPolygon>,
            feature as Feature<Polygon | MultiPolygon>,
          ) ||
          booleanContainsSafe(
            feature as Feature<Polygon | MultiPolygon>,
            result[i] as Feature<Polygon | MultiPolygon>,
          )
        ) {
          const unioned = turfUnion(
            result[i] as Feature<Polygon | MultiPolygon>,
            feature as Feature<Polygon | MultiPolygon>,
          );

          if (unioned) {
            unioned.properties = {
              ...result[i].properties,
              ...feature.properties,
            };

            unioned.id = result[i].id || feature.id;

            result[i] = unioned;
            hasMerged = true;
            break;
          }
        }
      }

      if (!hasMerged) {
        result.push(feature);
      }
    });

    if (result.length < features.length) {
      return mergeOverlapping(result);
    }

    return result;
  }

  const finalMerged = mergeOverlapping(merged.features);
  merged.features = finalMerged.map((f, i) => ({
    ...f,
    id: i,
    properties: {
      ...f.properties,
      fill: a.features[0]?.properties.fill,
      stroke: a.features[0]?.properties.stroke,
      strokeWidth: a.features[0]?.properties.strokeWidth,
    },
  }));

  return merged;
}
