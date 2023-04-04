import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { FC } from 'react';
import { useError } from '@/context/ErrorContext';
import Button from "@mui/material/Button";
import {useNavigate} from "react-router";


function AlertSnackbar() {
  const { errorTitle, errorMessage, handleError, action } = useError();
  const navigate = useNavigate();
  const open = errorTitle !== null;
  if (!open)
    return null;
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => {
        handleError(null, null);
        if (action) { action(); } // action callback 실행 (Re-direct 용)
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      // action={action}
    >
      <Alert severity="error">
        <AlertTitle>{errorTitle}</AlertTitle>
        <strong>{errorMessage}</strong>
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;