import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './ol.css';

import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Provider } from 'react-redux';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';

import AppRoutes from './app-route';
import collections from './modules/collections';
import Start from './modules/start';
import { store } from './store';

const router = createHashRouter([
  {
    path: '/',
    element: <AppRoutes />,
    children: [{ index: true, element: <Start /> }, collections],
  },
]);

const App: React.FC = () => {
  const [meta, setMeta] = useState({ name: 'Bones', version: 'Loading...' });

  useEffect(() => {
    async function getVersionAndName() {
      try {
        const data = await window.electron.getVersion();
        setMeta(data);
      } catch (error) {
        console.error('Failed to fetch version:', error);
        setMeta((prev) => ({ ...prev, version: 'Unknown' }));
      }
    }
    getVersionAndName();
  }, []);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <Helmet
          titleTemplate={`${meta.name} - ${meta.version} %s`}
          defaultTitle={`${meta.name} - ${meta.version}`}
        />
        <RouterProvider router={router} />
        <CssBaseline />
        <Outlet />
      </Provider>
    </React.StrictMode>
  );
};

export default App;
