import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Fill, Stroke, Style } from 'ol/style';
import React from 'react';
import { SketchPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';

import { Layer } from '../../../../../types/collection-config-data.interface';
import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import {
  setLayerDetails,
  setShowLayerColorPicker,
  setShowLayerColorPickerCurrentColor,
  setShowLayerColorPickerPosition,
  setShowLayerColorPickerType,
} from '../../slices/editor.slice';
import { setLayersData } from '../../slices/layers.slice';

function generateColumns(layer: Layer, dispatch: AppDispatch): GridColDef[] {
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 25,
    },
    {
      field: 'fill',
      headerName: 'Fill',
      width: 100,
      renderCell: (params) => (
        <div
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            dispatch(setShowLayerColorPicker(Number(params.id)));
            dispatch(
              setShowLayerColorPickerPosition([
                rect.top + rect.height,
                rect.left,
              ]),
            );
            dispatch(setShowLayerColorPickerType('fill'));
            dispatch(setShowLayerColorPickerCurrentColor(params.value));
          }}
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
          }}
        />
      ),
    },
    {
      field: 'stroke',
      headerName: 'Stroke',
      width: 100,
      renderCell: (params) => (
        <div
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            dispatch(setShowLayerColorPicker(Number(params.id)));
            dispatch(
              setShowLayerColorPickerPosition([
                rect.top + rect.height,
                rect.left,
              ]),
            );
            dispatch(setShowLayerColorPickerType('stroke'));
            dispatch(setShowLayerColorPickerCurrentColor(params.value));
          }}
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
          }}
        />
      ),
    },
    {
      field: 'strokeWidth',
      headerName: 'Stroke Width (px)',
      width: 100,
      editable: true,
    },
  ];

  for (const property of layer.propertiesConfig) {
    columns.push({
      field: property.name,
      headerName: property.name,
      width: 150,
      editable: true,
    });
  }

  return columns;
}

const LayerDetailsDialog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const showDialog = useSelector(
    (state: RootState) => state.editor.layerDetails,
  );
  const {
    showLayerColorPicker,
    showLayerColorPickerPosition,
    showLayerColorPickerType,
    showLayerColorPickerCurrentColor,
  } = useSelector((state: RootState) => state.editor);

  const { layersData, layers } = useSelector(
    (state: RootState) => state.layers,
  );
  return (
    <Dialog open={showDialog !== null} maxWidth="lg">
      <IconButton
        aria-label="close"
        onClick={() => {
          dispatch(setLayerDetails(null));
          dispatch(setShowLayerColorPicker(null));
          dispatch(setShowLayerColorPickerPosition(null));
          dispatch(setShowLayerColorPickerType(null));
          dispatch(setShowLayerColorPickerCurrentColor(null));
        }}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>
      {showDialog !== null && (
        <>
          <DialogTitle>{layersData[showDialog].name}</DialogTitle>
          <DialogContent>
            <DataGrid
              columns={generateColumns(layersData[showDialog], dispatch)}
              rows={layersData[showDialog].fragments.features.map((f) => ({
                id: f.id,
                ...(f.properties || {}),
              }))}
              processRowUpdate={async (newRow, _oldRow, params) => {
                const newData = {
                  ...layersData[showDialog].fragments.features[
                    Number(params.rowId)
                  ],
                  properties: {
                    targetId: newRow.targetId,
                    "Fragment's area": newRow["Fragment's area"], // eslint-disable-line
                    ...layersData[showDialog].propertiesConfig
                      .map((item) => item.name)
                      .reduce<any>((acc, key) => {
                        acc[key] = newRow[key];
                        return acc;
                      }, {}),
                  },
                };
                const updatedFeatures = [
                  ...layersData[showDialog].fragments.features,
                ];
                updatedFeatures.splice(Number(params.rowId), 1, newData);
                const updatedLayer = {
                  ...layersData[showDialog],
                  fragments: {
                    ...layersData[showDialog].fragments,
                    features: updatedFeatures,
                  },
                };
                const updatedLayers = [...layersData];
                updatedLayers.splice(showDialog, 1, updatedLayer);
                dispatch(setLayersData(updatedLayers));
                await window.electron.saveFeaturesToTempFile(updatedLayers);
                return newRow;
              }}
              onProcessRowUpdateError={(error) => {
                console.log(error);
              }}
              slots={{ toolbar: GridToolbar }}
            />
            {showLayerColorPicker !== null && (
              <div
                style={{
                  position: 'fixed',
                  top: showLayerColorPickerPosition[0] || '0',
                  left: showLayerColorPickerPosition[1] || '0',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <SketchPicker
                    color={showLayerColorPickerCurrentColor}
                    onChangeComplete={async (color) => {
                      const newData = {
                        ...layersData[showDialog].fragments.features[
                          showLayerColorPicker
                        ],
                        properties: {
                          ...layersData[showDialog].fragments.features[
                            Number(showLayerColorPicker)
                          ].properties,
                          [showLayerColorPickerType]: `rgb(${Object.values(color.rgb).join(',')})`,
                        },
                      };
                      const updatedFeatures = [
                        ...layersData[showDialog].fragments.features,
                      ];
                      updatedFeatures.splice(showLayerColorPicker, 1, newData);
                      const updatedLayer = {
                        ...layersData[showDialog],
                        fragments: {
                          ...layersData[showDialog].fragments,
                          features: updatedFeatures,
                        },
                      };
                      const updatedLayers = [...layersData];
                      updatedLayers.splice(showDialog, 1, updatedLayer);
                      dispatch(setShowLayerColorPicker(null));
                      dispatch(setShowLayerColorPickerPosition(null));
                      dispatch(setShowLayerColorPickerType(null));
                      dispatch(setShowLayerColorPickerCurrentColor(null));
                      dispatch(setLayersData(updatedLayers));
                      const f =
                        layers[showDialog].source.getFeatureById(
                          showLayerColorPicker,
                        );
                      f.setProperties(newData.properties);
                      await window.electron.saveFeaturesToTempFile(
                        updatedLayers,
                      );
                      f.setStyle(
                        new Style({
                          fill: new Fill({ color: newData.properties.fill }),
                          stroke: new Stroke({
                            color: newData.properties.stroke,
                            width: newData.properties.strokeWidth,
                          }),
                        }),
                      );
                    }}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default LayerDetailsDialog;
