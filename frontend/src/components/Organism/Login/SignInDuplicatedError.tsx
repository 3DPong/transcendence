
import { useAlert } from "@/context/AlertContext";
import { useEffect } from "react";

export function SignInDuplicatedError() {
    // 해당 페이지로 들어온 경우, 즉시 에러 메시지를 띄우고 로그인 페이지로 다시 리다이렉트 시켜주기
    const { handleAlert } = useAlert();
    useEffect(() => {
        // handleAlert("Login", "사용자가 이미 로그인되어 있습니다.", "/signin");
        handleAlert("Login", "사용자가 이미 로그인되어 있습니다.",);
    }, [])
    return (<></>);
}