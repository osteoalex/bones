import turfDifference from '@turf/difference';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon,
} from '@turf/helpers';
import { Feature as GeoJSONFeature, MultiPolygon, Polygon } from 'geojson';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import {
  calculateArea,
  geojsonFormat,
  getFeaturesInFeatureExtent,
  getNextId,
} from '../../../../utils';
import {
  isGeoJsonMultiPolygon,
  isGeoJsonPolygon,
} from '../../../../utils/type-guards';
import { setLayersData } from '../slices/layers.slice';
import {
  recalculateAreaByTargetId,
  recalculateAreas,
} from './calculate-area.action';

export function setupSubtractFragmentInteraction(
  source: VectorSource<Feature<Geometry>>,
): TAction<Draw> {
  return (dispatch, getState) => {
    const { subtractFragmentRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (subtractFragmentRef) {
      olMapRef.removeInteraction(subtractFragmentRef);
    }

    const subtractDraw = new Draw({
      source,
      type: 'MultiPolygon',
    });
    subtractDraw.setActive(false);
    olMapRef.addInteraction(subtractDraw);

    subtractDraw.on('drawend', (e: DrawEvent) =>
      dispatch(subtractDrawHandler(e)),
    );
    return subtractDraw;
  };
}

export function subtractDrawHandler(e: DrawEvent): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx, baseSourceRef, layersData } =
      getState().layers;
    if (layers[activeLayerIdx].source) {
      const toSubtractFeature = e.feature;
      const features = getFeaturesInFeatureExtent(
        toSubtractFeature,
        layers[activeLayerIdx].source,
      );

      if (!features.length) {
        setTimeout(() => {
          layers[activeLayerIdx].source.removeFeature(toSubtractFeature);
        }, 100);
        return;
      }
      for await (const feature of features) {
        const current = baseSourceRef
          .getFeatures()
          .find((f) => f.getId() === feature.getProperties().targetId);
        const featureCoords = geojsonFormat.writeFeatureObject(
          feature,
        ) as GeoJSONFeature<MultiPolygon | Polygon>;
        let mPoly: GeoJSONFeature<MultiPolygon | Polygon>;
        if (isGeoJsonMultiPolygon(featureCoords)) {
          mPoly = turfMultiPolygon(featureCoords.geometry.coordinates);
        }
        if (isGeoJsonPolygon(featureCoords)) {
          mPoly = turfPolygon(featureCoords.geometry.coordinates);
        }
        const toSubtract = geojsonFormat.writeFeatureObject(
          toSubtractFeature,
        ) as GeoJSONFeature<MultiPolygon>;
        const toSubtractMPoly = turfMultiPolygon(
          toSubtract.geometry.coordinates,
        );
        const diff = turfDifference(mPoly, toSubtractMPoly);
        if (isGeoJsonMultiPolygon(diff)) {
          const polys = diff.geometry.coordinates.map((p) => turfPolygon(p));
          const f = geojsonFormat.readFeature(polys.splice(0, 1)[0]);
          feature.setGeometry(
            Array.isArray(f) ? f[0].getGeometry() : f.getGeometry(),
          );
          feature.setProperties({
            ...feature.getProperties(),
            "Fragment's area": `${// eslint-disable-line
              (
                (calculateArea(diff) * 100) /
                calculateArea(
                  geojsonFormat.writeFeatureObject(current) as GeoJSONFeature<
                    Polygon | MultiPolygon
                  >,
                )
              ).toFixed(2)
            }%`,
          });
          const props = Object.fromEntries(
            Object.entries(feature.getProperties()).filter(
              ([key]) => key !== 'geometry',
            ),
          );
          for (const poly of polys) {
            const f = geojsonFormat.readFeature(poly);
            const nextFeature = Array.isArray(f) ? f[0] : f;
            nextFeature.setProperties(props);
            nextFeature.setId(
              getNextId(layers[activeLayerIdx].source.getFeatures()),
            );
            layers[activeLayerIdx].source.addFeature(nextFeature);
          }
        } else {
          const f = geojsonFormat.readFeature(diff);
          feature.setGeometry(
            Array.isArray(f) ? f[0].getGeometry() : f.getGeometry(),
          );
          feature.setProperties({
            ...feature.getProperties(),
            "Fragment's area": `${// eslint-disable-line
              (
                (calculateArea(diff) * 100) /
                calculateArea(
                  geojsonFormat.writeFeatureObject(current) as GeoJSONFeature<
                    Polygon | MultiPolygon
                  >,
                )
              ).toFixed(2)
            }%`,
          });
        }
        setTimeout(() => {
          layers[activeLayerIdx].source.removeFeature(toSubtractFeature);
        }, 100);
        setTimeout(async () => {
          const geojson = geojsonFormat.writeFeaturesObject(
            layers[activeLayerIdx].source.getFeatures(),
          );
          const newLayersData = [...layersData];

          newLayersData[activeLayerIdx] = {
            ...layersData[activeLayerIdx],
            fragments: geojson,
          };

          dispatch(setLayersData(newLayersData));
          await window.electron.saveFeaturesToTempFile(newLayersData);

          dispatch(recalculateAreas());
          for (const feature of features) {
            dispatch(
              recalculateAreaByTargetId(feature.getProperties().targetId),
            );
          }
        }, 200);
      }
    }
  };
}
