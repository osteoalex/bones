import { TAction } from '../../../../types/store.types';
import { setLoading } from '../slices/ui.slice';

export function deleteBackgroundAction(bg: string): TAction<Promise<boolean>> {
  return async (dispatch) => {
    dispatch(setLoading(true));
    await window.electron.deleteBackground(bg);
    dispatch(setLoading(false));
    await window.electron.getConfig();
  };
}
