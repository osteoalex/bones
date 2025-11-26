import { TAction } from '../../../../types/store.types';
import { pushSnapshot } from '../slices/history.slice';

/*
  saveSnapshot helper

  - Centralized place to create a deep-cloned snapshot of `layersData` and
    dispatch `pushSnapshot`. Actions that represent a single user operation
    (for example: add, subtract, split) should call this once at the logical
    operation boundary rather than letting internal helper functions call it
    repeatedly.
  - Uses the `history.suppressed` flag in Redux to avoid creating
    history entries while programmatically setting state (undo/redo
    rehydration should dispatch `suppressHistory()`/`unsuppressHistory()`).
*/
export function saveSnapshot(): TAction {
  return (dispatch, getState) => {
    const suppressed = getState().history?.suppressed;
    if (suppressed) return;
    const { layersData } = getState().layers;
    const snapshot = JSON.parse(JSON.stringify(layersData));
    dispatch(pushSnapshot(snapshot));
  };
}
