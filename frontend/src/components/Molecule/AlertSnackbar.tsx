import { AlertTitle, Snackbar } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { useError } from "@/context/ErrorContext";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

// https://mui.com/material-ui/react-snackbar/
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function AlertSnackbar() {
  const { errorTitle, errorMessage, handleError, redirectUrl } = useError();
  const [open, setOpen] = useState<boolean>(errorTitle !== null);
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(errorTitle !== null);
  }, [errorTitle]);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    handleError(null, null);
    if (redirectUrl) {
      // action callback 실행 (Re-direct 용)
      // navigate(redirectUrl);
    }
  };

  const ActionBtn = (
    <React.Fragment>
      {/*<Button color="secondary" size="small" onClick={handleClose}>*/}
      {/*  UNDO*/}
      {/*</Button>*/}
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={open}
      // autoHideDuration={3000}
      // message={`${errorTitle}: ${errorMessage}`}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
        <AlertTitle>{errorTitle}</AlertTitle>
        <strong>{errorMessage}</strong>
      </Alert>
    </Snackbar>
  );
}

export default AlertSnackbar;
