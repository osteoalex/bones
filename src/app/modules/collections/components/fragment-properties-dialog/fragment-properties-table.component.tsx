import { Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '../../../../../types/store.types';
import { RootState } from '../../../../store';
import { updateProps } from '../../actions/update-props.action';
import { setShowPropsDialog } from '../../slices/ui.slice';

const FragmentPropertiesTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { layersData, activeLayerIdx } = useSelector(
    (state: RootState) => state.layers,
  );
  const infoDetailsArr = useSelector(
    (state: RootState) => state.selected.infoDetails,
  );
  // Local state for edited rows
  const [tableRows, setTableRows] = useState<Record<string, string>[]>(
    infoDetailsArr.map((f, idx) => ({
      id: f.getId ? f.getId().toString() : idx.toString(),
      ...f.getProperties(),
    })),
  );
  // Color picker state
  const [colorPicker, setColorPicker] = useState<{
    rowId: number | string;
    field: string;
  } | null>(null);
  const [colorValue, setColorValue] = useState('');

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 25 },
    {
      field: 'fill',
      headerName: 'Fill',
      width: 100,
      editable: false,
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
          onClick={() => {
            setColorPicker({ rowId: params.id, field: 'fill' });
            setColorValue(params.value);
          }}
        />
      ),
    },
    {
      field: 'stroke',
      headerName: 'Stroke',
      width: 100,
      editable: false,
      renderCell: (params) => (
        <div
          style={{
            backgroundColor: params.value,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
          onClick={() => {
            setColorPicker({ rowId: params.id, field: 'stroke' });
            setColorValue(params.value);
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
    ...layersData[activeLayerIdx].propertiesConfig.map((property) => ({
      field: property.name,
      headerName: property.name,
      width: 150,
      editable: true,
    })),
  ];

  // Save handler
  const handleSave = () => {
    dispatch(updateProps(tableRows));
    dispatch(setShowPropsDialog(false));
  };

  // Handle color change
  const handleColorChange = (color: ColorResult) => {
    if (!colorPicker) return;
    const newColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a || 1})`;
    setTableRows((prev) =>
      prev.map((row) =>
        row.id === colorPicker.rowId
          ? { ...row, [colorPicker.field]: newColor }
          : row,
      ),
    );
    setColorValue(newColor);
  };

  return (
    <div style={{ minWidth: 400, position: 'relative' }}>
      <DataGrid
        columns={columns}
        rows={tableRows}
        disableRowSelectionOnClick
        processRowUpdate={(newRow) => {
          setTableRows((prev) =>
            prev.map((row) => (row.id === newRow.id ? newRow : row)),
          );
          return newRow;
        }}
        onCellEditStop={(params) => {
          if (
            params.reason === 'cellFocusOut' ||
            params.reason === 'enterKeyDown'
          ) {
            setTableRows((prev) =>
              prev.map((row) =>
                row.id === params.id
                  ? { ...row, [params.field]: params.value }
                  : row,
              ),
            );
          }
        }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSave}
      >
        Save
      </Button>
      {colorPicker && (
        <div style={{ position: 'absolute', zIndex: 10, top: 50, left: 200 }}>
          <SketchPicker
            color={colorValue}
            onChangeComplete={handleColorChange}
          />
          <Button size="small" onClick={() => setColorPicker(null)}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default FragmentPropertiesTable;
