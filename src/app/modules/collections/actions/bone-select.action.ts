import { singleClick } from 'ol/events/condition';
import Feature from 'ol/Feature';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { selectedBoneStyle } from '../components/collection-home/editor-styles';
import { setBoneSelectRef } from '../slices/interactions.slice';
import { setInfoDetails, setSelectedBone } from '../slices/selected.slice';
import { resetBaseFeatureStyle } from './reset.action';

export function setupBoneSelectInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef } = getState().layers;
    const { boneSelectRef } = getState().interactions;
    // Remove previous bone select
    if (boneSelectRef) {
      olMapRef.removeInteraction(boneSelectRef);
    }
    const boneSelect = new Select({
      layers: [baseLayerRef],
      style: selectedBoneStyle,
      condition: (event) => {
        // Only allow selection on Ctrl+Click (and optionally Shift for multi-select)
        const original = event.originalEvent;
        return (
          singleClick(event) &&
          original &&
          (original.ctrlKey || original.metaKey)
        );
      },
    });
    boneSelect.setActive(false);
    olMapRef.addInteraction(boneSelect);
    // Store ref for mutual exclusivity
    dispatch(setBoneSelectRef(boneSelect));
    boneSelect.on('select', (e) => {
      const ctrlPressed = !!getState().hotkeys.ctrl;
      const shift = getState().hotkeys.shift;
      const shiftPressed = !!shift;
      const selectedFeatures: Feature[] =
        getState().selected.selectedBone || [];
      const allFeatures = baseLayerRef.getSource().getFeatures();
      // If click is outside any feature, always deselect all
      if (!e.selected?.length) {
        allFeatures.forEach((f) => resetBaseFeatureStyle(f));
        dispatch(setSelectedBone([]));
        return;
      }
      let newSelection: typeof selectedFeatures;
      const clickedFeature = e.selected[0];
      if (clickedFeature && ctrlPressed) {
        dispatch(setInfoDetails([])); // Deselect any bones when selecting fragments/annotations
      }
      if (ctrlPressed && shiftPressed) {
        // Multi-select with Ctrl+Shift: toggle bone in selection
        const idx = selectedFeatures.indexOf(clickedFeature);
        if (idx === -1) {
          newSelection = [...selectedFeatures, clickedFeature];
        } else {
          newSelection = selectedFeatures.filter((f) => f !== clickedFeature);
        }
      } else if (ctrlPressed) {
        // Single select with Ctrl only
        newSelection = [clickedFeature];
      } else {
        // No selection if Ctrl is not pressed
        newSelection = selectedFeatures;
      }
      // Update styles
      allFeatures.forEach((f) => {
        if (newSelection.includes(f)) {
          f.setStyle(selectedBoneStyle);
        } else {
          resetBaseFeatureStyle(f);
        }
      });
      dispatch(setSelectedBone(newSelection));
    });
    return boneSelect;
  };
}
