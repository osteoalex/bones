import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    window.electron.openCollectionFromMenu(async () => {
      const config = await window.electron.openCollection();
      if (config) {
        navigate(`/collections/open/${config.name}`);
      }
    });
    window.electron.newCollectionFromMenu(async () => {
      navigate('/collections/create');
    });
    window.electron.saveCollectionFromMenu(async () => {
      await window.electron.saveItem();
    });
    return () => {
      window.electron.openCollectionFromMenu(async () => undefined);
      window.electron.newCollectionFromMenu(async () => undefined);
      window.electron.saveCollectionFromMenu(async () => undefined);
    };
  }, []);

  return <Outlet />;
};

export default AppRoutes;
