import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../../store';
import { useCurrentItem } from '../../hooks/use-currentItem.hook';
import { useInitEditor } from '../../hooks/use-init-editor.hook';

const EditorBody: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  useInitEditor(mapRef);
  useCurrentItem();

  const windowSize = useSelector((state: RootState) => state.ui.windowSize);
  return (
    <div
      ref={mapRef}
      id="main-editor"
      style={
        /* eslint-disable */
        process.env.NODE_ENV === 'development'
          ? {
              height: `${windowSize[0]}px`,
              width: `${windowSize[1]}px`,
              marginTop: `${windowSize[0] * -1}px`,
              marginRight: `${windowSize[1] * -1}px`,
            }
          : {
              height: `${windowSize[0]}px`,
              width: `${windowSize[1]}px`,
            }
        /* eslint-enable */
      }
    ></div>
  );
};

export default EditorBody;
