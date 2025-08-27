import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';

import {
  DrawLayer,
  ItemContent,
  LayersAndSources,
} from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import { geojsonFormat, projection } from '../../../../utils';
import {
  annotationStyle,
  baseStyle,
} from '../components/collection-home/editor-styles';
import {
  setAddByRectangleSourceRef,
  setDrawAnnotationRef,
  setSplitSourceRef,
} from '../slices/interactions.slice';
import {
  setActiveLayerIdx,
  setBaseLayerRef,
  setBaseSourceRef,
} from '../slices/layers.slice';
import { setupAnnotationDraw } from './add-annotation.action';
import { setupDrawFragment } from './add-draw.action';
import { setupDeleteSelectionInteraction } from './delete.action';
import { setupBoneHover } from './hover.action';
import { setupSnapFragmentInteraction } from './snap.action';
import { setupSubtractFragmentInteraction } from './subtract.action';

export function setupLayersAndSources(
  layersContent: ItemContent,
  backgroundJSONString: string,
): TAction<LayersAndSources> {
  return (dispatch, getState) => {
    const { splitSourceRef, addByRectangleSourceRef } = getState().interactions;
    const { baseSourceRef } = getState().layers;
    if (splitSourceRef) {
      splitSourceRef.clear();
    }
    if (baseSourceRef) {
      baseSourceRef.clear();
    }
    if (addByRectangleSourceRef) {
      addByRectangleSourceRef.clear();
    }

    const splitSource = new VectorSource();
    dispatch(setSplitSourceRef(splitSource));

    const splitLayer = new VectorLayer({
      className: 'splitLayer',
      source: splitSource,
    });

    const backgroundFeatures = geojsonFormat.readFeatures(
      JSON.parse(backgroundJSONString),
      {
        dataProjection: projection,
      },
    );

    const linesSource = new VectorSource({
      features: backgroundFeatures.filter(
        (f) => f.getGeometry().getType() === 'MultiLineString',
      ),
    });
    const vectorSource = new VectorSource({
      features: backgroundFeatures.filter(
        (f) => f.getGeometry().getType() === 'Polygon',
      ),
    });

    dispatch(setBaseSourceRef(vectorSource));

    const addByRectangleSource = new VectorSource();
    dispatch(setAddByRectangleSourceRef(addByRectangleSource));
    const addByRectangleLayer = new VectorLayer({
      className: 'addByRectangleLayer',
      source: addByRectangleSource,
    });

    const vectorLayer = new VectorLayer({
      className: 'baseLayer',
      source: vectorSource,
      style: baseStyle,
    });
    dispatch(setBaseLayerRef(vectorLayer));

    const linesLayers = new VectorLayer({
      className: 'baseLayer',
      source: linesSource,
      style: baseStyle,
    });

    const layers = dispatch(setupDrawLayers(layersContent));
    dispatch(setActiveLayerIdx(0));

    return {
      splitLayer,
      addByRectangleLayer,
      vectorLayer,
      linesLayers,
      vectorSource,
      backgroundFeatures,
      splitSource,
      addByRectangleSource,
      layers,
    };
  };
}

export function setupDrawLayers(
  layersContent: ItemContent,
): TAction<DrawLayer[]> {
  return (dispatch) => {
    const layers: DrawLayer[] = [];

    for (const layer of layersContent) {
      const layerSource = new VectorSource({
        features: geojsonFormat.readFeatures(layer.fragments),
      });
      const layerLayer = new VectorLayer({
        className: layer.name,
        visible: layer.visible,
        source: layerSource,
        style: new Style({
          stroke: new Stroke({
            color: layer.stroke,
            width: layer.strokeWidth,
          }),
          fill: new Fill({
            color: layer.fill,
          }),
        }),
      });
      const draw = dispatch(setupDrawFragment(layerSource));
      const snap = dispatch(setupSnapFragmentInteraction(layerSource));
      const deleteFragment = dispatch(
        setupDeleteSelectionInteraction(layerLayer),
      );
      const hover = dispatch(setupBoneHover(layerLayer));
      const subtract = dispatch(setupSubtractFragmentInteraction(layerSource));

      const annotationSource = new VectorSource<Feature<Point>>({
        features:
          (geojsonFormat.readFeatures(layer.annotations) as Feature<Point>[]) ||
          [],
      });
      const annotationLayer = new VectorLayer<VectorSource<Feature<Point>>>({
        className: `${layer.name}-annotation`,
        visible: layer.visible,
        source: annotationSource,
        style: annotationStyle(layer.fill, layer.stroke),
      });
      const annotationDraw = dispatch(setupAnnotationDraw(annotationSource));
      dispatch(setDrawAnnotationRef(annotationDraw));

      layers.push({
        base: layerLayer,
        source: layerSource,
        snap,
        delete: deleteFragment,
        hover,
        draw,
        subtract,
        annotationSource,
        annotationLayer,
        annotationDraw,
      });
      layerSource.getFeatures().forEach((f) => {
        const props = f.getProperties();
        if (props.fill && props.stroke && props.strokeWidth) {
          f.setStyle(
            new Style({
              fill: new Fill({ color: props.fill }),
              stroke: new Stroke({
                color: props.stroke,
                width: props.strokeWidth,
              }),
            }),
          );
        }
      });
    }
    return layers;
  };
}
