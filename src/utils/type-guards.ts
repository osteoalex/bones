/* eslint-disable */
import {
  Feature,
  MultiPolygon as GMultiPolygon,
  Polygon as GPolygon,
  MultiLineString,
} from 'geojson';
import { Geometry, LineString, MultiPolygon, Polygon } from 'ol/geom';

import { CollectionConfigData } from '../types/collection-config-data.interface';
/* eslint-enable */

export function isCollectionConfigData(
  obj: unknown,
): obj is CollectionConfigData {
  return (
    typeof obj === 'object' &&
    'name' in obj &&
    'description' in obj &&
    'items' in obj &&
    'backgrounds' &&
    'showHints' in obj &&
    'showHints' in obj
  );
}

export function isPolygon(obj: Geometry): obj is Polygon {
  return obj.getType() === 'Polygon';
}

export function isMultiPolygon(obj: Geometry): obj is MultiPolygon {
  return obj.getType() === 'MultiPolygon';
}

export function isLineString(obj: Geometry): obj is LineString {
  return obj.getType() === 'LineString';
}

export function isGeoJsonPolygon(
  obj: Feature<GPolygon | GMultiPolygon | MultiLineString>,
): obj is Feature<GPolygon> {
  return obj.geometry.type === 'Polygon';
}

export function isGeoJsonMultiPolygon(
  obj: Feature<GPolygon | GMultiPolygon | MultiLineString>,
): obj is Feature<GMultiPolygon> {
  return obj.geometry.type === 'MultiPolygon';
}

export function isGeoJsonMultiLineString(
  obj: Feature<GPolygon | GMultiPolygon | MultiLineString>,
): obj is Feature<MultiLineString> {
  return obj.geometry.type === 'MultiLineString';
}
