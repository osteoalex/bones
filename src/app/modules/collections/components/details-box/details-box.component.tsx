/* eslint-disable */
import { Box, Typography } from '@mui/material';
import { SelectEvent } from 'ol/interaction/Select';
import { Fill, Stroke, Style } from 'ol/style';
import React, { useEffect, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { deleteAnnotation } from '../../actions/delete-annotation.action';
import { deleteSelectHandler } from '../../actions/delete.action';
import { exportFragmentHandler } from '../../actions/export.action';
import { setLayersData } from '../../slices/layers.slice';
import {
  setAnnotationDialog,
  setMoveToLayerDialogOpen,
  setShowPropsDialog,
} from '../../slices/ui.slice';
import { SelectedBox } from '../collection-home/collection-home.styles';
import DetailsButtons from './details-buttons.component';
/* eslint-enable */

const DetailsBox: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { infoDetails } = useSelector((state: RootState) => state.selected);
  const fragmentsArea = useSelector(
    (state: RootState) => state.selected.fragmentsArea,
  );
  const fullArea = useSelector((state: RootState) => state.selected.fullArea);
  const { layersData, layers, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );

  const [showFill, setShowFill] = useState(false);
  const [showStroke, setShowStroke] = useState(false);
  const [isAnnotation, setIsAnnotation] = useState(false);
  const changeColorHandler = async (
    color: ColorResult,
    path: 'fill' | 'stroke',
  ) => {
    const idx = layersData[activeLayerIdx].fragments.features.findIndex(
      (f) => f.id === infoDetails?.getId(),
    );
    const newData = {
      ...layersData[activeLayerIdx].fragments.features[idx],
      properties: {
        ...layersData[activeLayerIdx].fragments.features[Number(idx)]
          .properties,
        [path]: `rgb(${Object.values(color.rgb).join(',')})`,
      },
    };
    const updatedFeatures = [...layersData[activeLayerIdx].fragments.features];
    updatedFeatures.splice(idx, 1, newData);
    const updatedLayer = {
      ...layersData[activeLayerIdx],
      fragments: {
        ...layersData[activeLayerIdx].fragments,
        features: updatedFeatures,
      },
    };
    const updatedLayers = [...layersData];
    updatedLayers.splice(activeLayerIdx, 1, updatedLayer);

    dispatch(setLayersData(updatedLayers));

    const f = layers[activeLayerIdx].source.getFeatureById(infoDetails.getId());
    f.setProperties(newData.properties);
    await window.electron.saveFeaturesToTempFile(updatedLayers);
    f.setStyle(
      new Style({
        fill: new Fill({ color: newData.properties.fill }),
        stroke: new Stroke({
          color: newData.properties.stroke,
          width: newData.properties.strokeWidth,
        }),
      }),
    );

    setShowFill(false);
    setShowStroke(false);
  };

  useEffect(() => {
    setShowFill(false);
    setShowStroke(false);
    setIsAnnotation(
      Object.keys(infoDetails?.getProperties() || {}).includes('annotation'),
    );
  }, [infoDetails]);

  return (
    <SelectedBox>
      {infoDetails && (
        <DetailsButtons
          isAnnotation={isAnnotation}
          onMoveClick={() => dispatch(setMoveToLayerDialogOpen(true))}
          onExportClick={() => dispatch(exportFragmentHandler())}
          onEditClick={() => {
            if (isAnnotation) {
              dispatch(setAnnotationDialog(infoDetails.getId().toString()));
            } else {
              dispatch(setShowPropsDialog(true));
            }
          }}
          onDeleteClick={() => {
            if (isAnnotation) {
              dispatch(deleteAnnotation(infoDetails.getId().toString()));
            } else {
              dispatch(
                deleteSelectHandler({
                  selected: [infoDetails],
                } as SelectEvent),
              );
            }
          }}
        />
      )}
      <Typography variant="h6">Details:</Typography>
      <Box>
        {!infoDetails && <Typography>Nothing is selected.</Typography>}
        {infoDetails && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ pr: 3, fontWeight: 'bold' }}>Id: </Typography>
              <Typography>{infoDetails?.getId()}</Typography>
            </Box>

            {!isAnnotation && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                  Bone:{' '}
                </Typography>
                <Typography>
                  {infoDetails?.getProperties().targetId ||
                    infoDetails?.getId()}
                </Typography>
              </Box>
            )}
          </>
        )}
        {Object.entries(infoDetails ? infoDetails.getProperties() : {})
          .filter(
            ([key]) =>
              ![
                'geometry',
                'fill',
                'stroke',
                'strokeWidth',
                'targetId',
              ].includes(key),
          )
          .map(([key, value]) => (
            <Box
              key={key}
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                {key}:{' '}
              </Typography>
              <Typography
                sx={{ maxWidth: '200px', maxHeight: '200px', overflow: 'auto' }}
              >
                {value || '-'}
              </Typography>
            </Box>
          ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
            Preservation of skeleton:{' '}
          </Typography>
          <Typography>{`${((fragmentsArea * 100) / fullArea).toFixed(
            2,
          )}%`}</Typography>
        </Box>
        {infoDetails && (
          <>
            {infoDetails.getProperties().fill && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                  Fill:{' '}
                </Typography>
                <Typography component="div">
                  <div
                    style={{
                      height: '30px',
                      width: '30px',
                      background: infoDetails.getProperties().fill,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setShowStroke(false);
                      setShowFill(!showFill);
                    }}
                  ></div>
                  <div style={{ position: 'absolute', left: '-10px' }}>
                    {showFill && (
                      <div style={{ position: 'relative' }}>
                        <SketchPicker
                          color={infoDetails.getProperties().fill}
                          onChangeComplete={(color) =>
                            changeColorHandler(color, 'fill')
                          }
                        />
                      </div>
                    )}
                  </div>
                </Typography>
              </Box>
            )}
            {infoDetails.getProperties().stroke && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ pr: 3, fontWeight: 'bold' }}>
                  Stroke:{' '}
                </Typography>
                <Typography component="div">
                  <div
                    style={{
                      height: '30px',
                      width: '30px',
                      background: infoDetails.getProperties().stroke,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setShowFill(false);
                      setShowStroke(!showStroke);
                    }}
                  ></div>
                  <div style={{ position: 'absolute', left: '-10px' }}>
                    {showStroke && (
                      <div style={{ position: 'relative' }}>
                        <SketchPicker
                          color={infoDetails.getProperties().stroke}
                          onChangeComplete={(color) =>
                            changeColorHandler(color, 'stroke')
                          }
                        />
                      </div>
                    )}
                  </div>
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </SelectedBox>
  );
};

export default DetailsBox;
