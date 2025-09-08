import { singleClick } from 'ol/events/condition';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { infoSelectedStyle } from '../components/collection-home/editor-styles';
import { setInfoDetails } from '../slices/selected.splice';
import { resetFeatureStyle } from './reset.action';

export function setupInfoClickInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef, layers, activeLayerIdx } =
      getState().layers;
    const { infoSelectRef } = getState().interactions;
    const { shift } = getState().hotkeys;
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
      condition: (event) => {
        // Only allow selection on single click
        return singleClick(event);
      },
      style: () => {
        // Always use infoDetails for selection state
        return infoSelectedStyle;
      },
      filter: (_feature, layer) => {
        const { layers, activeLayerIdx } = getState().layers;
        return (
          layer.getClassName() ===
            layers[activeLayerIdx]?.base.getClassName() ||
          layer.getClassName() ===
            layers[activeLayerIdx]?.annotationLayer.getClassName()
        );
      },
    });
    infoClick.setActive(false);
    olMapRef.addInteraction(infoClick);
    infoClick.on('select', (e) => {
      const event = e.mapBrowserEvent;
      const shiftPressed =
        (event && event.originalEvent && event.originalEvent.shiftKey) || shift;
      const selectedFeatures = getState().selected.infoDetails || [];
      const allFeatures = layers[activeLayerIdx].source.getFeatures();
      // If click is outside any feature, always deselect all
      if (!e.selected?.length) {
        allFeatures.forEach((f) => resetFeatureStyle(f));
        dispatch(setInfoDetails([]));
        return;
      }

      const clickedFeature = e.selected[0];
      const isAnnotation = !!clickedFeature.getProperties().annotation;
      let newSelection: typeof selectedFeatures;
      if (isAnnotation) {
        // Only one annotation can be selected at a time
        newSelection = [clickedFeature];
      } else if (shiftPressed) {
        // Multi-select fragments with shift
        const idx = selectedFeatures.indexOf(clickedFeature);
        if (idx === -1) {
          newSelection = [
            ...selectedFeatures.filter((f) => !f.getProperties().annotation),
            clickedFeature,
          ];
        } else {
          newSelection = selectedFeatures.filter(
            (f) => f !== clickedFeature && !f.getProperties().annotation,
          );
        }
      } else {
        // Single click: select only the clicked fragment
        newSelection = [clickedFeature];
      }
      // Update styles: selected get infoSelectedStyle, others get resetFeatureStyle
      allFeatures.forEach((f) => {
        if (newSelection.includes(f)) {
          f.setStyle(infoSelectedStyle);
        } else {
          resetFeatureStyle(f);
        }
      });
      dispatch(setInfoDetails(newSelection));
    });
    return infoClick;
  };
}
