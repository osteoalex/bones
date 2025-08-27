import { TAction } from '../../../../types/store.types';
import { setActiveLayerIdx } from '../slices/layers.slice';
import { setInfoDetails } from '../slices/selected.splice';

export function changeLayer(idx: number): TAction {
  return (dispatch) => {
    dispatch(setActiveLayerIdx(idx));
    dispatch(setInfoDetails(null));
  };
}
