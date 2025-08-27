import React from 'react';
import { Outlet, RouteObject } from 'react-router';

import CollectionHome from './components/collection-home/collection-home.component';
import CollectionCreate from './components/create/collection-create.component';
import EditCollectionDetails from './components/edit/edit-collection-details.component';

const routes: RouteObject = {
  path: 'collections',
  element: <Outlet />,
  children: [
    { path: 'create', element: <CollectionCreate /> },
    { path: 'open/:name', element: <CollectionHome /> },
    { path: ':id', element: <EditCollectionDetails /> },
  ],
};

export default routes;
