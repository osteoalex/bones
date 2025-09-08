import turfBooleanContains from '@turf/boolean-contains';
import turfBooleanOverlap from '@turf/boolean-overlap';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon,
} from '@turf/helpers';
import turfIntersect from '@turf/intersect';
import turfUnion from '@turf/union';
import {
  Feature as GeoJSONFeature,
  Feature as GeojsonFeature,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import {
  calculateArea,
  featureToTurfGeometry,
  geojsonFormat,
  getFeaturesInFeatureExtent,
  getNextId,
  multiPolygonToPolygons,
} from '../../../../utils';
import { setLayersData } from '../slices/layers.slice';
import { recalculateAreas } from './calculate-area.action';

export function setupDrawFragment(
  source: VectorSource<Feature<Geometry>>,
): TAction<Draw> {
  return (dispatch, getState) => {
    const { olMapRef } = getState().layers;
    const { drawFragmentRef } = getState().interactions;
    if (drawFragmentRef) {
      olMapRef.removeInteraction(drawFragmentRef);
    }

    const draw = new Draw({
      source: source,
      type: 'MultiPolygon',
    });
    draw.setActive(false);
    olMapRef.addInteraction(draw);

    draw.on('drawend', (e: DrawEvent) => dispatch(additionDrawEndHandler(e)));
    return draw;
  };
}

export function additionDrawEndHandler(e: DrawEvent): TAction {
  return async (dispatch, getState) => {
    const { baseSourceRef, layers, activeLayerIdx } = getState().layers;
    const extent = e.feature;
    const existing = getFeaturesInFeatureExtent(
      extent,
      layers[activeLayerIdx].source,
    );
    const bones = getFeaturesInFeatureExtent(extent, baseSourceRef);

    const intersects = existing.filter((f) => {
      return (
        turfBooleanOverlap(
          featureToTurfGeometry(f),
          featureToTurfGeometry(e.feature),
        ) ||
        turfBooleanContains(
          multiPolygonToPolygons(
            featureToTurfGeometry(e.feature) as GeojsonFeature<MultiPolygon>,
          )[0],
          featureToTurfGeometry(f),
        )
      );
    });

    const removed: Feature<Geometry>[] = [];
    const added: Feature<Geometry>[] = [];

    if (intersects.length) {
      for (const bone of intersects) {
        const sum: Feature = e.feature.clone();
        const summedGeoJSON = turfUnion(
          featureToTurfGeometry(bone),
          featureToTurfGeometry(sum),
        );
        const f = geojsonFormat.readFeature(summedGeoJSON);
        sum.setProperties(bone.getProperties());
        sum.setGeometry(
          Array.isArray(f) ? f[0].getGeometry() : f.getGeometry(),
        );
        sum.setId(bone.getProperties().targetId);
        layers[activeLayerIdx].source.removeFeature(bone);
        layers[activeLayerIdx].source.addFeature(sum);
        removed.push(bone);
        added.push(sum);
      }
    }

    const toAddWithoutIntersection = bones
      .filter(
        (b) =>
          !intersects
            .map((i) => i.getProperties().targetId)
            .includes(b.getId()),
      )
      .map((f) => {
        const drawedClone = e.feature.clone();
        const clone = f.clone();
        clone.setGeometry(drawedClone.getGeometry());
        clone.setId(f.getId());
        drawedClone.dispose();
        return clone;
      });

    setTimeout(() => {
      layers.forEach((l) => l.source.removeFeature(e.feature));
    }, 100);

    setTimeout(() => {
      for (const feature of toAddWithoutIntersection) {
        layers[activeLayerIdx].source.addFeature(feature);
        added.push(feature);
      }

      dispatch(submitFragmentHandler(added));
    }, 110);
  };
}

export function submitFragmentHandler(
  currentlyAddingFeatures: Feature<Geometry>[],
): TAction {
  return async (dispatch, getState) => {
    const { activeLayerIdx, layers, baseSourceRef, layersData, olMapRef } =
      getState().layers;
    const properties = layersData[activeLayerIdx].propertiesConfig.reduce<
      Record<string, string | number>
    >((acc, current) => {
      acc[current.name] = current.defaultValue;
      return acc;
    }, {});
    properties.fill = layersData[activeLayerIdx].fill;
    properties.stroke = layersData[activeLayerIdx].stroke;
    properties.strokeWidth = layersData[activeLayerIdx].strokeWidth;
    for (const newFeature of currentlyAddingFeatures) {
      const id = newFeature.getProperties().targetId || newFeature.getId();
      newFeature.setProperties({ ...properties, targetId: id });
      const currentBone = baseSourceRef.getFeatureById(id);

      const featureCoords = geojsonFormat.writeFeatureObject(
        newFeature,
      ) as GeoJSONFeature<MultiPolygon | Polygon>;
      const boneCoords = geojsonFormat.writeFeatureObject(
        currentBone,
      ) as GeoJSONFeature<MultiPolygon | Polygon>;
      const featurePoly =
        featureCoords.geometry.type === 'Polygon'
          ? turfPolygon(featureCoords.geometry.coordinates)
          : turfMultiPolygon(featureCoords.geometry.coordinates);
      const bonePoly =
        boneCoords.geometry.type === 'Polygon'
          ? turfPolygon(boneCoords.geometry.coordinates)
          : turfMultiPolygon(boneCoords.geometry.coordinates);
      const inter = turfIntersect(featurePoly, bonePoly);
      if (!inter) {
        continue;
      }
      const f = geojsonFormat.readFeature(inter);
      const intersectionFeature = Array.isArray(f) ? f[0] : f;
      newFeature.setGeometry(intersectionFeature.getGeometry());
      const fragmentProps: Record<string, string> = {
        ...newFeature.getProperties(),
        "Fragment's area": `${// eslint-disable-line
          (
            (calculateArea(inter) * 100) /
            calculateArea(
              geojsonFormat.writeFeatureObject(currentBone) as GeoJSONFeature<
                Polygon | MultiPolygon
              >,
            )
          ).toFixed(2)
        }%`,
      };
      newFeature.setProperties(fragmentProps);
      newFeature.setId(getNextId(layers[activeLayerIdx].source.getFeatures()));
    }
    olMapRef.render();

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
  };
}
