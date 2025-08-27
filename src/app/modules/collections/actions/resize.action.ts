import { TAction } from '../../../../types/store.types';
import { setWindowSize } from '../slices/ui.slice';

export function onResizeHandler(): TAction {
  return (dispatch, getState) => {
    const olMapRef = getState().layers.olMapRef;
    if (olMapRef) {
      dispatch(setWindowSize([window.innerHeight, window.innerWidth]));
      setTimeout(() => {
        olMapRef.render();
      });
    }
  };
}
