import turfBooleanContains from '@turf/boolean-contains';
import turfBooleanOverlap from '@turf/boolean-overlap';
import turfUnion from '@turf/union';
import { Feature, FeatureCollection } from 'geojson';

import { TAction } from '../../../../types/store.types';
import { setLayerDetails } from '../slices/editor.slice';
import {
  setBoneHoverRef,
  setDeleteSelectRef,
  setDrawFragmentRef,
  setSnapFragmentRef,
  setSubtractFragmentRef,
} from '../slices/interactions.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { setCombineLayersDialogOpen } from '../slices/ui.slice';
import { recalculateAreas } from './calculate-area.action';
import { changeLayer } from './change-layer.action';
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

    const { snap, hover, draw, subtract } = updatedLayers[targetLayerId];
    dispatch(setSnapFragmentRef(snap));
    dispatch(setDeleteSelectRef(updatedLayers[targetLayerId].delete));
    dispatch(setBoneHoverRef(hover));
    dispatch(setDrawFragmentRef(draw));
    dispatch(setSubtractFragmentRef(subtract));

    dispatch(setCombineLayersDialogOpen(false));
    dispatch(recalculateAreas());
  };
}

function combineFuturePointCollections(
  a: FeatureCollection,
  b: FeatureCollection,
): FeatureCollection {
  const merged = {
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
  return merged;
}

function combineFutureCollections(
  a: FeatureCollection,
  b: FeatureCollection,
): FeatureCollection {
  const merged = {
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

  function mergeOverlapping(features: Feature[]): Feature[] {
    const result: Feature[] = [];

    features.forEach((feature) => {
      let hasMerged = false;

      for (let i = 0; i < result.length; i++) {
        if (
          turfBooleanOverlap(result[i], feature) ||
          turfBooleanContains(result[i], feature) ||
          turfBooleanContains(feature, result[i])
        ) {
          const unioned = turfUnion(result[i] as any, feature as any);

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
  })) as any;

  return merged;
}
