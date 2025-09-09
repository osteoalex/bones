import turfBooleanContains from '@turf/boolean-contains';
import turfBooleanOverlap from '@turf/boolean-overlap';
import { MultiPolygon } from '@turf/helpers';
import turfUnion from '@turf/union';
import { Feature } from 'geojson';
import { Feature as OlFeature } from 'ol';
import { Geometry } from 'ol/geom';
import { Fill, Stroke, Style } from 'ol/style';

import { TAction } from '../../../../types/store.types';
import {
  featureToTurfGeometry,
  geojsonFormat,
  getFeaturesInFeatureExtent,
  getNextId,
  multiPolygonToPolygons,
} from '../../../../utils';
import { setLayersData } from '../slices/layers.slice';
import { setInfoDetails } from '../slices/selected.slice';
import { setMoveToLayerDialogOpen } from '../slices/ui.slice';
import { recalculateAreas } from './calculate-area.action';

export function moveToLayer(targetLayerName: string): TAction {
  return (dispatch, getState) => {
    const { layersData, layers, activeLayerIdx } = getState().layers;
    const { infoDetails } = getState().selected;

    const targetLayerData = layersData.find(
      (layer) => layer.name === targetLayerName,
    );
    const targetLayerId = layersData.findIndex(
      (layer) => layer.name === targetLayerName,
    );
    const sourceLayerData = layersData[activeLayerIdx];
    const sourceLayer = layers[activeLayerIdx];
    const targetLayer = layers[targetLayerId];

    // Defensive: if nothing selected, do nothing
    if (
      !infoDetails ||
      !Array.isArray(infoDetails) ||
      infoDetails.length === 0
    ) {
      dispatch(setMoveToLayerDialogOpen(false));
      return;
    }

    const updatedLayersData = [...layersData];

    for (const featureToMove of infoDetails) {
      const clonedFeature = featureToMove.clone();
      clonedFeature.setStyle(
        new Style({
          fill: new Fill({ color: targetLayerData.fill }),
          stroke: new Stroke({
            color: targetLayerData.stroke,
            width: targetLayerData.strokeWidth,
          }),
        }),
      );
      clonedFeature.setProperties({
        ...clonedFeature.getProperties(),
        fill: targetLayerData.fill,
        stroke: targetLayerData.stroke,
        strokeWidth: targetLayerData.strokeWidth,
      });

      const existing = getFeaturesInFeatureExtent(
        clonedFeature,
        layers[targetLayerId].source,
      );

      const intersects = existing.filter((f) => {
        return (
          turfBooleanOverlap(
            featureToTurfGeometry(f),
            featureToTurfGeometry(clonedFeature),
          ) ||
          turfBooleanContains(
            multiPolygonToPolygons(
              featureToTurfGeometry(clonedFeature) as Feature<MultiPolygon>,
            )[0],
            featureToTurfGeometry(f),
          )
        );
      });

      sourceLayer.source.removeFeature(featureToMove);

      if (intersects.length > 0) {
        const mergedFeature = clonedFeature.clone();
        for (const feature of intersects) {
          const summedGeoJSON = turfUnion(
            featureToTurfGeometry(feature),
            featureToTurfGeometry(mergedFeature),
          );
          const f = geojsonFormat.readFeature(
            summedGeoJSON,
          ) as OlFeature<Geometry>;
          mergedFeature.setProperties(feature.getProperties());
          mergedFeature.setGeometry(f.getGeometry());
          mergedFeature.setId(feature.getProperties().targetId);
          targetLayer.source.removeFeature(feature);
        }
        sourceLayer.source.removeFeature(clonedFeature);
        mergedFeature.setId(getNextId(targetLayer.source.getFeatures()));
        targetLayer.source.addFeature(mergedFeature);
        // Update layer data for merged
        updatedLayersData.splice(activeLayerIdx, 1, {
          ...sourceLayerData,
          fragments: {
            ...sourceLayerData.fragments,
            features: [
              ...sourceLayerData.fragments.features.filter(
                (fragment) => fragment.id !== featureToMove.getId(),
              ),
            ],
          },
        });

        const intersectIds = intersects.map((f) => f.getId());

        updatedLayersData.splice(targetLayerId, 1, {
          ...targetLayerData,
          fragments: {
            ...targetLayerData.fragments,
            features: [
              ...targetLayerData.fragments.features.filter(
                (f) => !intersectIds.includes(f.id),
              ),
              geojsonFormat.writeFeatureObject(mergedFeature),
            ],
          },
        });
      } else {
        clonedFeature.setId(getNextId(targetLayer.source.getFeatures()));
        targetLayer.source.addFeature(clonedFeature);
        updatedLayersData.splice(activeLayerIdx, 1, {
          ...sourceLayerData,
          fragments: {
            ...sourceLayerData.fragments,
            features: [
              ...sourceLayerData.fragments.features.filter(
                (fragment) => fragment.id !== featureToMove.getId(),
              ),
            ],
          },
        });
        updatedLayersData.splice(targetLayerId, 1, {
          ...targetLayerData,
          fragments: {
            ...targetLayerData.fragments,
            features: [
              ...targetLayerData.fragments.features,
              geojsonFormat.writeFeatureObject(clonedFeature),
            ],
          },
        });
      }
    }

    dispatch(setLayersData(updatedLayersData));
    window.electron.saveFeaturesToTempFile(updatedLayersData);
    dispatch(setInfoDetails([]));
    dispatch(setMoveToLayerDialogOpen(false));
    dispatch(recalculateAreas());
  };
}
