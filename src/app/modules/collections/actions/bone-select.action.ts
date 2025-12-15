import { singleClick } from 'ol/events/condition';
import Feature from 'ol/Feature';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { selectedBoneStyle } from '../components/collection-home/editor-styles';
import { setBoneSelectRef } from '../slices/interactions.slice';
import { setInfoDetails, setSelectedBone } from '../slices/selected.slice';
import { resetBaseFeatureStyle, resetFeatureStyle } from './reset.action';

export function setupBoneSelectInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef } = getState().layers;
    const { boneSelectRef } = getState().interactions;
    const { layers, activeLayerIdx } = getState().layers;

    if (boneSelectRef) {
      olMapRef.removeInteraction(boneSelectRef);
    }
    const boneSelect = new Select({
      layers: [baseLayerRef],
      style: selectedBoneStyle,
      condition: (event) => {
        const original = event.originalEvent;
        const ctrlToggle = getState().hotkeys.ctrl;
        return (
          singleClick(event) &&
          original &&
          (original.ctrlKey || original.metaKey || ctrlToggle)
        );
      },
    });
    boneSelect.setActive(false);
    olMapRef.addInteraction(boneSelect);

    dispatch(setBoneSelectRef(boneSelect));
    boneSelect.on('select', (e) => {
      const ctrlPressed = !!getState().hotkeys.ctrl;
      const shift = getState().hotkeys.shift;
      const shiftPressed = !!shift;
      const selectedFeatures: Feature[] =
        getState().selected.selectedBone || [];
      const deselectedFeatures: Feature[] = e.deselected || [];
      const allFeatures = baseLayerRef.getSource().getFeatures();

      if (!e.selected?.length) {
        allFeatures.forEach((f) => resetBaseFeatureStyle(f));
        dispatch(setSelectedBone([]));
        return;
      }
      let newSelection: typeof selectedFeatures;
      const clickedFeature = e.selected[0];
      if (clickedFeature && ctrlPressed) {
        dispatch(setInfoDetails([]));
        if (layers[activeLayerIdx] && layers[activeLayerIdx].source) {
          layers[activeLayerIdx].source.getFeatures().forEach((f) => {
            resetFeatureStyle(f);
          });
        }

        allFeatures.forEach((f) => {
          if (f !== clickedFeature) {
            resetBaseFeatureStyle(f);
          }
        });
      }
      if (ctrlPressed && shiftPressed) {
        const alreadySelected = !!selectedFeatures.find(
          (f) => f.getId() === clickedFeature.getId(),
        );
        if (
          deselectedFeatures.length &&
          deselectedFeatures[0].getId() === clickedFeature.getId()
        ) {
          newSelection = selectedFeatures.filter(
            (f) => f.getId() !== clickedFeature.getId(),
          );
        } else if (!alreadySelected) {
          newSelection = [...selectedFeatures, clickedFeature];
        } else {
          newSelection = selectedFeatures.filter(
            (f) => f.getId() !== clickedFeature.getId(),
          );
        }
      } else if (ctrlPressed) {
        newSelection = [clickedFeature];
      } else {
        newSelection = selectedFeatures;
      }
      boneSelect.getFeatures().clear();
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
