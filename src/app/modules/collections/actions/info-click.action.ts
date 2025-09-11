import { singleClick } from 'ol/events/condition';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { infoSelectedStyle } from '../components/collection-home/editor-styles';
import { setInfoSelectRef } from '../slices/interactions.slice';
import { setInfoDetails, setSelectedBone } from '../slices/selected.slice';
import { resetFeatureStyle } from './reset.action';

export function setupInfoClickInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef, layers, activeLayerIdx } =
      getState().layers;
    const { infoSelectRef } = getState().interactions;
    const { shift } = getState().hotkeys;
    // No boneSelectRef here; handled in bone-select.action.ts
    if (infoSelectRef) {
      olMapRef.removeInteraction(infoSelectRef);
    }
    // Bone select interaction is handled in its own file and is mutually exclusive
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
        if (getState().hotkeys.ctrl) return null; // Let bone select handle style when Ctrl is pressed
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
    // Store ref for mutual exclusivity
    dispatch(setInfoSelectRef(infoClick));
    infoClick.on('select', (e) => {
      const event = e.mapBrowserEvent;
      const shiftPressed =
        (event && event.originalEvent && event.originalEvent.shiftKey) || shift;
      const selectedFeatures = getState().selected.infoDetails || [];
      const allFeatures = layers[activeLayerIdx].source.getFeatures();
      const ctrlPressed = getState().hotkeys.ctrl;
      if (ctrlPressed) {
        return; // Ignore clicks when Ctrl is pressed to avoid conflict with bone select
      }
      // If click is outside any feature, always deselect all
      if (!e.selected?.length) {
        allFeatures.forEach((f) => resetFeatureStyle(f));
        dispatch(setInfoDetails([]));
        return;
      }

      const clickedFeature = e.selected[0];
      const isAnnotation = !!clickedFeature.getProperties().annotation;
      let newSelection: typeof selectedFeatures;
      if (clickedFeature) {
        dispatch(setSelectedBone([])); // Deselect any bones when selecting fragments/annotations
      }
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

// Bone select interaction moved to bone-select.action.ts
