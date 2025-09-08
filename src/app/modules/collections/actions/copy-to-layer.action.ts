import turfBooleanContains from '@turf/boolean-contains';
import turfBooleanOverlap from '@turf/boolean-overlap';
import { MultiPolygon } from '@turf/helpers';
import turfUnion from '@turf/union';
import { Feature } from 'geojson';
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
import { setMoveToLayerDialogOpen } from '../slices/ui.slice';
import { recalculateAreas } from './calculate-area.action';

export function copyToLayer(targetLayerName: string): TAction {
  return (dispatch, getState) => {
    const { layersData, layers } = getState().layers;

    const { infoDetails } = getState().selected;
    const targetLayerData = layersData.find(
      (layer) => layer.name === targetLayerName,
    );
    const targetLayerId = layersData.findIndex(
      (layer) => layer.name === targetLayerName,
    );
    const targetLayer = layers[targetLayerId];

    // Only operate on the first selected feature for copy (or update to support multi-copy as needed)
    const clonedFeature = infoDetails[0]?.clone();

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

    if (intersects.length > 0) {
      const mergedFeature = clonedFeature.clone();
      for (const feature of intersects) {
        const summedGeoJSON = turfUnion(
          featureToTurfGeometry(feature),
          featureToTurfGeometry(mergedFeature),
        );
        const f = geojsonFormat.readFeature(summedGeoJSON);
        mergedFeature.setProperties(feature.getProperties());
        if (Array.isArray(f)) {
          if (f.length > 0) {
            mergedFeature.setGeometry(f[0].getGeometry());
          }
        } else {
          mergedFeature.setGeometry(f.getGeometry());
        }
        mergedFeature.setId(feature.getProperties().targetId);
        targetLayer.source.removeFeature(feature);
      }
      mergedFeature.setId(getNextId(targetLayer.source.getFeatures()));
      targetLayer.source.addFeature(mergedFeature);
      const updatedLayersData = [...layersData];
      updatedLayersData.splice(targetLayerId, 1, {
        ...targetLayerData,
        fragments: {
          ...targetLayerData.fragments,
          features: [
            ...targetLayerData.fragments.features.filter(
              (f) => !intersects.map((i) => i.getId()).includes(f.id),
            ),
            geojsonFormat.writeFeatureObject(mergedFeature),
          ],
        },
      });
      dispatch(setLayersData(updatedLayersData));
      window.electron.saveFeaturesToTempFile(updatedLayersData);
    } else {
      clonedFeature.setId(getNextId(targetLayer.source.getFeatures()));
      targetLayer.source.addFeature(clonedFeature);
      const updatedLayersData = [...layersData];
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
      dispatch(setLayersData(updatedLayersData));
      window.electron.saveFeaturesToTempFile(updatedLayersData);
    }

    dispatch(setMoveToLayerDialogOpen(false));
    dispatch(recalculateAreas());
  };
}
