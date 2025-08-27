import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';

import {
  DrawLayer,
  Layer,
} from '../../../../types/collection-config-data.interface';
import { TAction } from '../../../../types/store.types';
import { annotationStyle } from '../components/collection-home/editor-styles';
import {
  setBoneHoverRef,
  setDeleteSelectRef,
  setDrawAnnotationRef,
  setDrawFragmentRef,
  setInfoSelectRef,
  setSnapFragmentRef,
  setSubtractFragmentRef,
} from '../slices/interactions.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { setNewLayerPopupVisible } from '../slices/ui.slice';
import { setupAnnotationDraw } from './add-annotation.action';
import { setupDrawFragment } from './add-draw.action';
import { changeLayer } from './change-layer.action';
import { setupDeleteSelectionInteraction } from './delete.action';
import { setupBoneHover } from './hover.action';
import { setupInfoClickInteraction } from './info-click.action';
import { setupSnapFragmentInteraction } from './snap.action';
import { setupSubtractFragmentInteraction } from './subtract.action';

export function createNewLayer(config: Layer): TAction {
  return async (dispatch, getState) => {
    const {
      layers: { layers, layersData, olMapRef },
    } = getState();
    const source = new VectorSource();
    const base = new VectorLayer({
      className: config.name,
      source: source,
      style: new Style({
        stroke: new Stroke({
          color: config.stroke,
          width: config.strokeWidth,
        }),
        fill: new Fill({
          color: config.fill,
        }),
      }),
    });
    olMapRef.addLayer(base);

    const snap = dispatch(setupSnapFragmentInteraction(source));
    const deleteFragment = dispatch(setupDeleteSelectionInteraction(base));
    const hover = dispatch(setupBoneHover(base));
    const draw = dispatch(setupDrawFragment(source));
    const subtract = dispatch(setupSubtractFragmentInteraction(source));

    dispatch(setSnapFragmentRef(snap));
    dispatch(setDeleteSelectRef(deleteFragment));
    dispatch(setBoneHoverRef(hover));
    dispatch(setDrawFragmentRef(draw));
    dispatch(setSubtractFragmentRef(subtract));

    const annotationSource = new VectorSource<Feature<Point>>();
    const annotationLayer = new VectorLayer<VectorSource<Feature<Point>>>({
      className: `${config.name}-annotation`,
      visible: config.visible,
      source: annotationSource,
      style: annotationStyle(config.fill, config.stroke),
    });
    const annotationDraw = dispatch(setupAnnotationDraw(annotationSource));
    dispatch(setDrawAnnotationRef(annotationDraw));
    olMapRef.addLayer(annotationLayer);

    const newLayer: DrawLayer = {
      base,
      source,
      snap,
      delete: deleteFragment,
      hover,
      draw,
      subtract,
      annotationDraw,
      annotationLayer,
      annotationSource,
    };
    const updatedLayers = layers.concat(newLayer);
    const newLayersData = layersData.concat([config]);
    dispatch(setLayersData(newLayersData));
    dispatch(changeLayer(updatedLayers.length - 1));
    dispatch(setLayers(updatedLayers));
    dispatch(setNewLayerPopupVisible(false));
    const infoClickRef = dispatch(setupInfoClickInteraction());
    dispatch(setInfoSelectRef(infoClickRef));
    await window.electron.saveFeaturesToTempFile(newLayersData);
    await window.electron.saveItem();
  };
}
