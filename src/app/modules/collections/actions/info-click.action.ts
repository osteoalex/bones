import { singleClick } from 'ol/events/condition';
import { Select } from 'ol/interaction';
import Layer from 'ol/layer/Layer';

import { TAction } from '../../../../types/store.types';
import { infoSelectedStyle } from '../components/collection-home/editor-styles';
import { setInfoDetails } from '../slices/selected.splice';
import { resetFeatureStyle } from './reset.action';

function checkLayer(layer: Layer): TAction<boolean> {
  return (_dispatch, getState) => {
    const { layers, activeLayerIdx } = getState().layers;
    return (
      layer.getClassName() === layers[activeLayerIdx]?.base.getClassName() ||
      layer.getClassName() ===
        layers[activeLayerIdx]?.annotationLayer.getClassName()
    );
  };
}

export function setupInfoClickInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef, layers, activeLayerIdx } =
      getState().layers;
    const { infoSelectRef } = getState().interactions;
    if (infoSelectRef) {
      olMapRef.removeInteraction(infoSelectRef);
    }
    const infoClick = new Select({
      layers: [
        baseLayerRef,
        ...layers.flatMap(({ base, annotationLayer }) => [
          base,
          annotationLayer,
        ]),
      ],
      condition: singleClick,
      style: infoSelectedStyle,
      filter: (_feature, layer) => dispatch(checkLayer(layer)),
    });
    infoClick.setActive(false);
    olMapRef.addInteraction(infoClick);
    infoClick.on('select', (e) => {
      if (e.deselected?.length) {
        layers[activeLayerIdx].source.getFeatures().forEach((f) => {
          resetFeatureStyle(f);
        });
      }
      if (!e.selected?.length) {
        dispatch(setInfoDetails(null));
      } else {
        dispatch(setInfoDetails(e.selected[0]));
      }
    });
    return infoClick;
  };
}
