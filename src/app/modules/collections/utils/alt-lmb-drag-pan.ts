import { DragPan } from 'ol/interaction';

// Returns a DragPan interaction that only activates on Alt + LMB
export function createAltLmbDragPan() {
  return new DragPan({
    condition: (event) => {
      const originalEvent = event.originalEvent;
      // Alt + LMB (button === 0)
      return (
        originalEvent &&
        originalEvent.button === 0 &&
        originalEvent.altKey === true
      );
    },
  });
}
