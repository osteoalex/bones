import turfIntersects from '@turf/boolean-intersects';
import { polygon as turfPolygon } from '@turf/helpers';
import {
  Feature as GeoJSONFeature,
  LineString,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { Feature } from 'ol';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import polygonSplitter from 'polygon-splitter';

import { TAction } from '../../../../types/store.types';
import {
  calculateArea,
  geojsonFormat,
  getFeaturesInFeatureExtent,
  getNextId,
} from '../../../../utils';
import { isPolygon } from '../../../../utils/type-guards';
import {
  setIsSplitting,
  setSplitFragmentRef,
} from '../slices/interactions.slice';
import { setLayersData } from '../slices/layers.slice';
import {
  recalculateAreaByTargetId,
  recalculateAreas,
} from './calculate-area.action';

export function setupSplitFragmentInteraction(): TAction {
  return (dispatch, getState) => {
    const { splitFragmentRef, splitSourceRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (splitFragmentRef) {
      olMapRef.removeInteraction(splitFragmentRef);
    }

    const splitDraw = new Draw({
      source: splitSourceRef,
      type: 'LineString',
    });
    dispatch(setSplitFragmentRef(splitDraw));
    splitDraw.setActive(false);
    olMapRef.addInteraction(splitDraw);

    splitDraw.on('drawstart', () => dispatch(setIsSplitting(true)));
    splitDraw.on('drawend', (e: DrawEvent) => dispatch(splitDrawHandler(e)));
  };
}

export function splitDrawHandler(e: DrawEvent): TAction {
  return async (dispatch, getState) => {
    dispatch(setIsSplitting(false));
    const { splitSourceRef } = getState().interactions;
    const { layers, activeLayerIdx, baseSourceRef, layersData } =
      getState().layers;
    const line = geojsonFormat.writeFeatureObject(e.feature) as GeoJSONFeature<
      LineString,
      Record<string, string>
    >;

    // Get selected bones from state
    const selectedBones: Feature[] = getState().selected.selectedBone;
    let featuresToSplit;
    if (selectedBones && selectedBones.length > 0) {
      // Only split selected bones
      featuresToSplit = getFeaturesInFeatureExtent(
        selectedBones,
        layers[activeLayerIdx].source,
      );
    } else {
      // Fallback: all overlapping fragments
      featuresToSplit = getFeaturesInFeatureExtent(
        e.feature,
        layers[activeLayerIdx].source,
      );
    }
    if (featuresToSplit.length === 0 && e.feature) {
      setTimeout(() => {
        splitSourceRef.removeFeature(e.feature);
      }, 100);
      return;
    }

    for (const featureToSplit of featuresToSplit) {
      const current = baseSourceRef
        .getFeatures()
        .find((f) => f.getId() === featureToSplit.getProperties().targetId);
      if (isPolygon(featureToSplit.getGeometry())) {
        const poly = geojsonFormat.writeFeatureObject(
          featureToSplit,
        ) as GeoJSONFeature<Polygon, Record<string, string>>;
        if (!turfIntersects(poly, line)) {
          setTimeout(() => {
            splitSourceRef.removeFeature(e.feature);
          }, 100);
          continue;
        }
        const sliced: GeoJSONFeature<MultiPolygon> = polygonSplitter(
          {
            type: poly.geometry.type,
            coordinates: poly.geometry.coordinates,
          },
          line.geometry,
        );
        const slicedPolygons = sliced.geometry.coordinates.map((p) =>
          turfPolygon(p),
        );
        const f = geojsonFormat.readFeature(slicedPolygons.splice(0, 1)[0]);
        layers[activeLayerIdx].source
          .getFeatureById(featureToSplit.getId())
          .setGeometry((Array.isArray(f) ? f[0] : f).getGeometry());

        layers[activeLayerIdx].source
          .getFeatureById(featureToSplit.getId())
          .setProperties({
            ...layers[activeLayerIdx].source
              .getFeatureById(featureToSplit.getId())
              .getProperties(),
            "Fragment's area": `${// eslint-disable-line
              (
              (calculateArea(poly) * 100) / // eslint-disable-line
                calculateArea(
                  geojsonFormat.writeFeatureObject(current) as GeoJSONFeature<
                    Polygon | MultiPolygon
                  >,
                )
              ).toFixed(2)
            }%`,
          });
        const props = Object.fromEntries(
          Object.entries(
            layers[activeLayerIdx].source
              .getFeatureById(featureToSplit.getId())
              .getProperties(),
          ).filter(([key]) => key !== 'geometry'),
        );
        for (const poly of slicedPolygons) {
          const f = geojsonFormat.readFeature(poly);
          const nextFeature = Array.isArray(f) ? f[0] : f;
          nextFeature.setProperties({
            ...props,
            "Fragment's area": `${// eslint-disable-line
              (
              (calculateArea(poly) * 100) / // eslint-disable-line
                calculateArea(
                  geojsonFormat.writeFeatureObject(current) as GeoJSONFeature<
                    Polygon | MultiPolygon
                  >,
                )
              ).toFixed(2)
            }%`,
          });
          nextFeature.setId(
            getNextId(layers[activeLayerIdx].source.getFeatures()),
          );
          layers[activeLayerIdx].source.addFeature(nextFeature);
        }
      }
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
    setTimeout(() => {
      splitSourceRef.removeFeature(e.feature);
    }, 100);
    for (const featureToSplit of featuresToSplit) {
      dispatch(
        recalculateAreaByTargetId(featureToSplit.getProperties().targetId),
      );
    }
  };
}
