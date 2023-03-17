import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl } from "@mui/material";
import { FC, useState } from "react";
import {TextFields} from "@/components/Molecule/TextFields_A";

interface PasswordFieldProps {
  isVisible: boolean;
  setPassword: (password: string) => void;
  password: string;
};

const PasswordField : FC<PasswordFieldProps> = ({isVisible, setPassword, password}) => {

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  return (
    <>
    {isVisible && (
      <FormControl variant="outlined" fullWidth >
        <TextFields 
          state={password}
          setState={setPassword}
          type={showPassword ? "text" : "password"}
          placeholder={"비밀번호를 입력하세요"}
          label={"비밀번호"}
        />

        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
          onClick={handleClickShowPassword}
        >
          {showPassword ? <Visibility/> : <VisibilityOff />}
        </button>
      </FormControl>
    )}
    </>
  );
}

export default PasswordField;