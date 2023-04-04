
import { uploadImageToServer } from "@/api/upload/upload";
import { API_URL } from "../../../config/backend";
import {handleErrorFunction, useError} from "@/context/ErrorContext";
import GlobalContext from "@/context/GlobalContext";
import {useContext} from "react";
import {useNavigate} from "react-router";


export async function requestLogOut(handleError: handleErrorFunction)
{
  const requestUrl = `${API_URL}/api/auth/logout`;
  const signUpResponse = await fetch(requestUrl, { method: "GET" });

  // on error
  if (!signUpResponse.ok) {
    const errorData = await signUpResponse.json();
    handleError("Sign Up", errorData.message);
    return ;
  }
  // on success
  const navigate = useNavigate();
  navigate("/login");
};
