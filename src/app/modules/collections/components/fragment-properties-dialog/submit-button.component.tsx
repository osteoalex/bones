import { Button } from '@mui/material';
import { useFormikContext } from 'formik';
import React, { useEffect } from 'react';

const SubmitButton: React.FC = () => {
  const formik = useFormikContext();
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        formik.submitForm();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);
  return <Button type="submit">Save</Button>;
};

export default SubmitButton;
