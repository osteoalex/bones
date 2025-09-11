import { Point as ePoint, Polygon as ePolygon } from '@mathigon/euclid';
import turfIntersects from '@turf/boolean-intersects';
import {
  lineString as turfLine,
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon,
} from '@turf/helpers';
import { Feature, LineString, MultiPolygon, Polygon } from 'geojson';
import { Feature as OlFeature } from 'ol';
import OLGeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
import { Projection } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import * as yup from 'yup';

import { Layer } from '../types/collection-config-data.interface';
import {
  isGeoJsonMultiPolygon,
  isGeoJsonPolygon,
  isLineString,
  isMultiPolygon,
  isPolygon,
} from './type-guards';

export const calculateArea = (
  item: Feature<Polygon | MultiPolygon>,
): number => {
  if (isGeoJsonPolygon(item)) {
    const poly = new ePolygon(
      ...item.geometry.coordinates[0].map((coords) => new ePoint(...coords)),
    );
    return poly.area;
  } else if (isGeoJsonMultiPolygon(item)) {
    const area = item.geometry.coordinates.reduce((acc, current) => {
      const poly = new ePolygon(
        ...current[0].map((coords) => new ePoint(...coords)),
      );
      return (acc += poly.area);
    }, 0);
    return area;
  }
};

export function getNextId(features: OlFeature[]): number {
  if (features.length === 0) {
    return 0;
  }
  const arr = Array.from({ length: features.length }, (_value, index) => index);
  const ids = features.map<number>((f) => Number(f.getId()));
  const max = Math.max(...ids);
  if (Math.max(...arr) === max) {
    return max + 1;
  } else {
    return arr.find((num) => !ids.includes(num));
  }
}

export function getValidation(config: Layer['propertiesConfig']) {
  const schema: Record<string, yup.AnySchema> = {
    stroke: yup.string(),
    fill: yup.string(),
    strokeWidth: yup.number(),
  };
  for (const field of config) {
    schema[field.name] = yup.string();
  }
  return yup.object(schema);
}

export const rgbToHex = (str: string): { hex: string; alfa: number } => {
  const match = str.match(
    /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,\/]\s?(?<a>[.\d]+%?))?\)/, // eslint-disable-line
  );
  const [r, g, b, a] = match.slice(1);
  return {
    hex:
      '#' +
      [r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join(''),
    alfa: Number(a),
  };
};

export const featureToTurfGeometry = (
  feature: OlFeature<Geometry>,
): Feature<MultiPolygon | Polygon> => {
  if (isMultiPolygon(feature.getGeometry())) {
    return turfMultiPolygon(
      (geojsonFormat.writeFeatureObject(feature) as Feature<MultiPolygon>)
        .geometry.coordinates,
    );
  }
  if (isPolygon(feature.getGeometry())) {
    return turfPolygon(
      (geojsonFormat.writeFeatureObject(feature) as Feature<Polygon>).geometry
        .coordinates,
    );
  }
};

export function multiPolygonToPolygons(
  multiPolygon: Feature<MultiPolygon>,
): Feature<Polygon>[] {
  return multiPolygon.geometry.coordinates.map((polygonCoords) => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygonCoords,
      },
      properties: multiPolygon.properties,
    };
  });
}

export const featureToTurLine = (
  feature: OlFeature<Geometry>,
): Feature<LineString> => {
  return turfLine(
    (geojsonFormat.writeFeatureObject(feature) as Feature<LineString>).geometry
      .coordinates,
  );
};

export const geojsonFormat = new OLGeoJSON();
export const projection = new Projection({
  code: 'EPSG:3395',
  units: 'm',
});

export function getFeaturesInFeatureExtent(
  extentFeatures: OlFeature<Geometry>[] | OlFeature<Geometry>,
  source: VectorSource<OlFeature<Geometry>>,
): OlFeature<Geometry>[] {
  // Accept a single feature or an array
  const featuresArr = Array.isArray(extentFeatures)
    ? extentFeatures
    : [extentFeatures];
  const featuresInExtent: Set<OlFeature<Geometry>> = new Set();
  for (const extentFeature of featuresArr) {
    const existingFeatures = source.getFeaturesInExtent(
      extentFeature.getGeometry().getExtent(),
    );
    const extentTurfGeo = isLineString(extentFeature.getGeometry())
      ? featureToTurLine(extentFeature)
      : featureToTurfGeometry(extentFeature);
    for (const feature of existingFeatures) {
      const overlaps = turfIntersects(
        extentTurfGeo,
        featureToTurfGeometry(feature),
      );
      if (overlaps) {
        featuresInExtent.add(feature);
      }
    }
  }
  return Array.from(featuresInExtent);
}

export function getLayerDefaultName(layersLength: number): string {
  return `Layer ${layersLength + 1}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomRGB(alfa = 1): string {
  const r = randomBetween(0, 255);
  const g = randomBetween(0, 255);
  const b = randomBetween(0, 255);
  const rgb = `rgba(${r},${g},${b},${alfa})`; // Collect all to a css color string
  return rgb;
}
