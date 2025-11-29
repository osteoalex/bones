import { DragPan } from 'ol/interaction';

// Returns a DragPan interaction that only activates on LMB when the
// `panToggle` flag is enabled. Callers should provide a getter function
// that returns the current runtime flag (for example a selector closure
// returning `state.hotkeys.panToggle`). The app maps the physical `p`
// key to that Redux flag; this utility no longer falls back to the Alt
// modifier.
export function createPLmbDragPan(getPanToggle: () => boolean) {
  return new DragPan({
    condition: (event) => {
      const originalEvent = event.originalEvent as MouseEvent | undefined;
      if (!originalEvent) return false;
      // Left mouse button only
      if (originalEvent.button !== 0) return false;
      // Prefer caller-provided runtime flag. This utility no longer relies
      // on the native Alt modifier — the app maps the physical `p` key to
      // the `panToggle` flag and should pass a getter here.
      const enabled = getPanToggle();
      return Boolean(enabled);
    },
  });
}
