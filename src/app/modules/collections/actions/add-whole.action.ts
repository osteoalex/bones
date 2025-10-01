import { Feature } from 'ol';
import { singleClick } from 'ol/events/condition';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { setSelectedBone } from '../slices/selected.slice';
import { addMultipleCommitHandler } from './add-multiple.action';

// Sets up an interaction to add a whole bone to fragments on click
export function setupAddWholeInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef } = getState().layers;
    const { addWholeRef } = getState().interactions;
    // Remove previous add whole interaction
    if (addWholeRef) {
      olMapRef.removeInteraction(addWholeRef);
    }
    const addWholeSelect = new Select({
      layers: [baseLayerRef],
      style: null, // No style change on click
      condition: singleClick,
    });
    addWholeSelect.setActive(false);
    olMapRef.addInteraction(addWholeSelect);
    addWholeSelect.on('select', (e) => {
      if (e.selected.length) {
        dispatch(setSelectedBone([e.selected[0] as Feature<Geometry>]));
        dispatch(addMultipleCommitHandler());
      }
    });
    return addWholeSelect;
  };
}
