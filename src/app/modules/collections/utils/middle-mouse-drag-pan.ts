import { DragPan } from 'ol/interaction';

// Returns a DragPan interaction that only activates on middle mouse button
export function createMiddleMouseDragPan() {
  return new DragPan({
    condition: (event) => {
      const originalEvent = event.originalEvent;
      // Middle mouse button is button === 1
      return originalEvent && originalEvent.button === 1;
    },
  });
}
