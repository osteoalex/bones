import { TAction } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import { setActiveLayerIdx } from '../slices/layers.slice';
import { setInfoDetails } from '../slices/selected.slice';
import { changeEditMode } from './mode.action';

export function changeLayer(idx: number): TAction {
  return (dispatch, getState) => {
    dispatch(setActiveLayerIdx(idx));
    dispatch(setInfoDetails(null));
    const mode = getState().editor.mode;
    if (mode === EDIT_MODE_TYPE.SELECT) {
      dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT));
    }
  };
}
