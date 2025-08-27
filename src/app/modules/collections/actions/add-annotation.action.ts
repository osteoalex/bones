import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import { geojsonFormat, getNextId } from '../../../../utils';
import { setLayersData } from '../slices/layers.slice';
import { setAnnotationDialog } from '../slices/ui.slice';

export function setupAnnotationDraw(
  source: VectorSource<Feature<Point>>,
): TAction<Draw> {
  return (dispatch, getState) => {
    const { olMapRef } = getState().layers;
    const { drawAnnotationRef } = getState().interactions;
    if (drawAnnotationRef) {
      olMapRef.removeInteraction(drawAnnotationRef);
    }

    const draw = new Draw({
      source: source,
      type: 'Point',
    });
    draw.setActive(false);
    olMapRef.addInteraction(draw);

    draw.on('drawend', (e: DrawEvent) =>
      dispatch(addAnnotationDrawEndHandler(e)),
    );

    return draw;
  };
}

function addAnnotationDrawEndHandler(e: DrawEvent): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx } = getState().layers;
    const source = layers[activeLayerIdx].annotationSource;
    const f = e.feature.clone();
    f.setId(getNextId(source.getFeatures()));
    setTimeout(() => {
      source.removeFeature(e.feature);
    }, 100);
    setTimeout(() => {
      source.addFeature(f);
    }, 110);
    dispatch(setAnnotationDialog(f.getId().toString()));
  };
}

export function submitAnnotation(
  annotation: string,
  targetId: string,
): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx, layersData } = getState().layers;
    const annotationFeature =
      layers[activeLayerIdx].annotationSource.getFeatureById(targetId);
    annotationFeature.setProperties({ annotation });
    const jsonFeature = geojsonFormat.writeFeatureObject(annotationFeature);

    const updatedLayersData = [...layersData];
    const updatedAnnotations = [
      ...updatedLayersData[activeLayerIdx].annotations.features,
    ];

    const exists = updatedAnnotations.find(
      (annotation) => annotation.id === targetId,
    );

    if (exists) {
      updatedLayersData[activeLayerIdx] = {
        ...updatedLayersData[activeLayerIdx],
        annotations: {
          ...updatedLayersData[activeLayerIdx].annotations,
          features: updatedAnnotations.map((annotation) =>
            annotation.id === targetId ? jsonFeature : annotation,
          ),
        },
      };
    } else {
      updatedLayersData[activeLayerIdx] = {
        ...updatedLayersData[activeLayerIdx],
        annotations: {
          ...updatedLayersData[activeLayerIdx].annotations,
          features: [...updatedAnnotations, jsonFeature],
        },
      };
    }

    dispatch(setLayersData(updatedLayersData));

    await window.electron.saveFeaturesToTempFile(updatedLayersData);

    dispatch(setAnnotationDialog(null));
  };
}
