import turfContains from '@turf/boolean-contains';
import {
  multiPolygon as turfMultiPolygon,
  point as turfPoint,
  polygon as turfPolygon,
} from '@turf/helpers';
import { Feature as GeoJSONFeature, MultiPolygon, Polygon } from 'geojson';
import { Feature } from 'ol';
import { singleClick } from 'ol/events/condition';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import { calculateArea, geojsonFormat } from '../../../../utils';
import { isMultiPolygon, isPolygon } from '../../../../utils/type-guards';
import { deleteStyle } from '../components/collection-home/editor-styles';
import { recalculateAreas } from './calculate-area.action';
export function setupDeleteSelectionInteraction(
  layer: VectorLayer<VectorSource<Feature<Geometry>>>,
): TAction<Select> {
  return (dispatch, getState) => {
    const { deleteSelectRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (deleteSelectRef) {
      olMapRef.removeInteraction(deleteSelectRef);
    }

    const deleteClick = new Select({
      layers: [layer],
      condition: singleClick,
      style: deleteStyle,
    });

    deleteClick.setActive(false);
    deleteClick.on('select', (e: SelectEvent) =>
      dispatch(deleteSelectHandler(e)),
    );

    olMapRef.addInteraction(deleteClick);
    return deleteClick;
  };
}

export function deleteSelectHandler(e: SelectEvent): TAction {
  return (dispatch, getState) => {
    const { deleteSelectRef } = getState().interactions;
    const { layers, activeLayerIdx, baseSourceRef } = getState().layers;
    for (const selected of e.selected) {
      if (!selected) {
        return;
      }
      const current = baseSourceRef
        .getFeatures()
        .find((f) => f.getId() === selected.getProperties().targetId);
      if (isPolygon(selected.getGeometry())) {
        layers[activeLayerIdx].source.removeFeature(
          layers[activeLayerIdx].source.getFeatureById(selected.getId()),
        );
      } else if (isMultiPolygon(selected.getGeometry())) {
        let geojson = geojsonFormat.writeFeatureObject(
          selected,
        ) as GeoJSONFeature<MultiPolygon, Record<string, string>>;
        const point = turfPoint(e.mapBrowserEvent.coordinate);
        const coordinates = geojson.geometry.coordinates.filter((poly) => {
          return !turfContains(turfPolygon(poly), point);
        });
        geojson = {
          ...geojson,
          properties: {
            ...geojson.properties,
            "Fragment's area": `${// eslint-disable-line
              (
              (calculateArea(turfMultiPolygon(coordinates)) * 100) / // eslint-disable-line
                calculateArea(
                  geojsonFormat.writeFeatureObject(current) as GeoJSONFeature<
                    Polygon | MultiPolygon
                  >,
                )
              ).toFixed(2)
            }%`,
          },
          geometry: {
            ...geojson.geometry,
            coordinates,
          },
        };
        const f = geojsonFormat.readFeature(geojson);
        const feature = Array.isArray(f) ? f[0] : f;
        selected.setGeometry(feature.getGeometry());
        selected.setProperties(feature.getProperties());
      }
    }
    deleteSelectRef.getFeatures().clear();
    dispatch(recalculateAreas());
  };
}
