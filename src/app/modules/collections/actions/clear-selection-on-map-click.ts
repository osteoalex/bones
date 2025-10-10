import type Feature from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import type VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import { setInfoDetails, setSelectedBone } from '../slices/selected.slice';
import { resetBaseFeatureStyle, resetFeatureStyle } from './reset.action';

export function setupClearBoneSelectionOnMapClick(): TAction {
  return (dispatch, getState) => {
    const handler = (evt: MapBrowserEvent<UIEvent>) => {
      const { olMapRef, baseLayerRef } = getState().layers;
      const { currentItem } = getState().editor;
      if (!currentItem) return;
      const origEvt = evt.originalEvent as MouseEvent | undefined;
      const ctrlPressed =
        !!(origEvt && (origEvt.ctrlKey || origEvt.metaKey)) ||
        getState().hotkeys.ctrl;
      if (!ctrlPressed || getState().editor.mode !== EDIT_MODE_TYPE.SELECT)
        return;
      const pixel = olMapRef.getEventPixel(evt.originalEvent);
      const features = olMapRef.getFeaturesAtPixel(pixel, {
        layerFilter: (l) => l === baseLayerRef,
      });
      if (!features || features.length === 0) {
        const src = baseLayerRef.getSource();
        if (src) {
          (src as VectorSource<Feature>)
            .getFeatures()
            .forEach((f: Feature) => resetBaseFeatureStyle(f));
        }
        dispatch(setSelectedBone([]));
      }
    };
    getState().layers.olMapRef.on('singleclick', handler);
  };
}

/**
 * Handler to clear fragment selection when clicking outside any fragment, only if Ctrl is NOT pressed.
 */
// Redux-thunk style action
export function setupClearFragmentSelectionOnMapClick(): TAction {
  return (dispatch, getState) => {
    const handler = (evt: MapBrowserEvent<UIEvent>) => {
      const { olMapRef, layers, activeLayerIdx } = getState().layers;
      const { currentItem } = getState().editor;
      if (!currentItem) return;
      const origEvt = evt.originalEvent as MouseEvent | undefined;
      const ctrlPressed = !!(
        (origEvt && (origEvt.ctrlKey || origEvt.metaKey)) ||
        getState().hotkeys.ctrl
      );
      if (ctrlPressed || getState().editor.mode !== EDIT_MODE_TYPE.SELECT)
        return;
      const pixel = olMapRef.getEventPixel(evt.originalEvent);
      const activeLayers = [
        layers[activeLayerIdx]?.base,
        layers[activeLayerIdx]?.annotationLayer,
      ];
      let found = false;
      for (const lyr of activeLayers) {
        if (!lyr) continue;
        const features = olMapRef.getFeaturesAtPixel(pixel, {
          layerFilter: (l) => l === lyr,
        });
        if (features && features.length > 0) {
          found = true;
          break;
        }
      }
      if (!found) {
        const src = layers[activeLayerIdx].source;
        if (src) {
          src.getFeatures().forEach((f: Feature) => resetFeatureStyle(f));
        }
        dispatch(setInfoDetails([]));
      }
    };
    getState().layers.olMapRef.on('singleclick', handler);
  };
}
