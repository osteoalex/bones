import { Box, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AppDispatch } from '../../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../../utils/enums';
import { RootState } from '../../../../store';
import { useHotkeys } from '../../hooks/use-hotkeys.hook';
import { setItems } from '../../slices/editor.slice';
import { setShowHints } from '../../slices/ui.slice';
import AddMultipleControls from '../add-multiple-controls/add-multiple-controls.component';
import AnnotationDialog from '../annotation-dialog/annotation-dialog.component';
import BonesList from '../bones-list/bones.list.component';
import CollectionGlobalButtons from '../collection-global-buttons/collection-global-buttons.component';
import CombineLayersDialog from '../combine-layers-dialog/combine-layers-dialog.component';
import CreateNewItem from '../create-new-item/create-new-item.component';
import DetailsBox from '../details-box/details-box.component';
import DrawerToolBox from '../drawer-tool-box/drawer-tool-box.component';
import EditLayerDialog from '../edit-layer-dialog/edit-layer-dialog.component';
import EditorBody from '../editor-body/editor-body.component';
import EditorDrawer from '../editor-drawer/editor-drawer.component';
import FragmentPropertiesDialog from '../fragment-properties-dialog/fragment-properties-dialog.component';
import HelpBox from '../help-box/help-box.component';
import Hint from '../hint/hint.component';
import HotkeysToggle from '../hotkeys-toggle/hotkeys-toggle.component';
import ItemsList from '../items-list/items-list.component';
import LayerDetailsDialog from '../layer-details-dialog/layer-details-dialog.component';
import LayersList from '../layers-list/layers-list.component';
import MoveToLayerDialog from '../move-to-layer-dialog/move-to-layer-dialog.component';
import NewLayerDialog from '../new-layer-dialog/new-layer-dialog.component';
import ToolBox from '../tool-box/tool-box.component';
import { CollectionHomeWrapper } from './collection-home.styles';

const CollectionHome: React.FC = () => {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  useHotkeys();

  useEffect(() => {
    async function init() {
      const config = await window.electron.readCollection();
      const items = await window.electron.getAllItems();
      dispatch(setItems(items));
      dispatch(setShowHints(config.showHints));
    }
    init();
  }, []);

  const [tabIdx, setTabIdx] = useState(0);
  const currentItem = useSelector(
    (state: RootState) => state.editor.currentItem,
  );
  const mode = useSelector((state: RootState) => state.editor.mode);

  return (
    <CollectionHomeWrapper>
      <Helmet
        title={`- ${params.name}${currentItem ? ` : ${currentItem}` : ''}`}
      />
      <CollectionGlobalButtons />
      <EditorDrawer>
        <DrawerToolBox />
        <Box sx={{ height: 'calc(100vh - 40px)' }}>
          <ItemsList />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIdx} onChange={(_e, idx) => setTabIdx(idx)}>
              <Tab label="Layers" sx={{ height: '40px' }} />
              <Tab label="Bones" sx={{ height: '40px' }} />
            </Tabs>
          </Box>
          {tabIdx === 0 && <LayersList />}
          {tabIdx === 1 && <BonesList />}
        </Box>
      </EditorDrawer>
      <EditorBody />
      {currentItem && <ToolBox />}
      {currentItem && mode === EDIT_MODE_TYPE.ADD_WHOLE && (
        <AddMultipleControls />
      )}
      {currentItem && mode === EDIT_MODE_TYPE.INFO && <DetailsBox />}
      <CreateNewItem />
      <NewLayerDialog />
      <EditLayerDialog />
      <CombineLayersDialog />
      <MoveToLayerDialog />
      <LayerDetailsDialog />
      <AnnotationDialog />
      {currentItem && <FragmentPropertiesDialog />}
      {currentItem && <HelpBox />}
      <Hint />
      <HotkeysToggle />
    </CollectionHomeWrapper>
  );
};

export default CollectionHome;
