import { FetchResult, useQuery } from "@apollo/client";
import { Snackbar, TextField, Alert } from "@mui/material";
import { StyledEngineProvider } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/system";
import { default as React, useCallback, useState } from "react";
import Logo from "../../../assets/logo.png";
import { setCurrentUser, setToken, User } from "../../../index";
import { GET_USERS, LoginData, useLogin } from "../../../util/queryService";
import { LoginButton } from "../atoms/LoginButton";
import { useHistory } from "react-router-dom";

interface Creds {
  email: string;
  password: string;
}

const useStyles = makeStyles({
  loginBox: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
  },

  loginDiv: {
    display: "flex",
    flexDirection: "column",
  },

  loginOptionDivider: {
    color: "white",
    marginBottom: "24px",
    marginTop: "24px",

    "&::before": {
      borderColor: "white",
    },

    "&::after": {
      borderColor: "white",
    },
  },

  inputLabel: {
    color: "white",

    "&.Mui-focused": {
      color: "white",
    },
  },

  input: {
    backgroundColor: "#901324",
    borderRadius: "4px",
    color: "white",

    "& .MuiOutlinedInput-notchedOutline": {
      border: "0px",
    },
  },
});

export const LoginPrompt: React.FC = () => {
  const styles = useStyles();
  const [error, setError] = useState<boolean>(false);
  // eslint-disable-next-line prefer-const
  const [email, setEmail] = useState("");

  const history = useHistory();

  const attemptQuery = () => {
    if(!email.match("[a-zA-Z]+"))
      setError(true);
    else
      history.push("/dashboard");
  }

  return (
    <StyledEngineProvider injectFirst>
      <Box className={styles.loginBox}>
        <div className={styles.loginDiv}>
          <img src={Logo} alt="Auto-Scavenger" />
          <h3 style ={{color: "white"}}>Enter your scavenger hunt objective to find the location in Downtown Calgary</h3>
          <TextField
            className={styles.input}
            type="text"
            label="Enter Your Objective"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              style: { color: "white" },
            }}
            InputProps={{
              style: { color: "white" },
            }}
            FormHelperTextProps={{
              style: { color: "white" },
            }}
          />
          <div style={{ height: "24px" }} />
          <LoginButton text="Submit" onClick={attemptQuery} />
        </div>
      </Box>
      <Snackbar open={error} autoHideDuration={3000} sx={{ width: '90%'}}>
            <Alert severity={"error"} sx={{ width: '100%'}}>
              Please enter a valid text.
            </Alert>
      </Snackbar>
    </StyledEngineProvider>
  );
};
