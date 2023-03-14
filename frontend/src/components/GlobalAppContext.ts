/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GlobalAppContext.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/13 20:35:03 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:35:05 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createContext } from "react";
import { Assert } from "@/utils/Assert";

// * [ How to use useReducer + useContext ]
// https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm


// -----------------------------------------
// Game State enum
export enum eGameState {
    IS_NOT_CREATED,
    IS_MATCH_MAKING,
    IS_READY,
    IS_FINISHED,
}
// -----------------------------------------

/*
interface iGameContext {
    gameState: eGameState,
    setGameState: ((param: eGameState) => void) | null;
}
*/

/*
const initialGameContext: iGameContext = {
    gameState: eGameState.IS_NOT_CREATED,
    setGameState: null, // null function pointer
}
*/

// -----------------------------------------
// Game State Context
// export const gameContext = createContext<iGameContext>(initialGameContext);
export const gameContext = createContext<{
    // gameRef: eGameState;
    gameRef: eGameState;
    // setGameState: React.Dispatch<any>;
  }>({
    gameRef: eGameState.IS_NOT_CREATED,
    // setGameState: () => null
  });
// -----------------------------------------


interface iUser {
    name: string,
    mail: string,
}

export const initialUserState: iUser = {
    name: "",
    mail: ""
}

// LoggedUser State
/*
interface iUserContext {
    user: iUser;
    userDispatch: ((param: iUserAction) => void) | null;
}
*/

/*
const initalUserContext: iUserContext = {
    user: {
        name: "",
        mail: "",
    },
    userDispatch: null, // null function pointer
}
*/

// -----------------------------------------
// User State Context
export const userContext = createContext<{
    userState: iUser;
    userDispatch: React.Dispatch< {type: eUserActionType, payload: string} >;
  }>({
    userState: initialUserState,
    userDispatch: () => null
  });
// -----------------------------------------

// -----------------------------------------
// Dispath action type
export enum eUserActionType {
    SET_NAME,
    SET_MAIL,
}
// -----------------------------------------



interface iUserAction {
    type: eUserActionType;
    payload: string;
}

// export function userContextReducer(prevState: iUserContext, action: iUserAction) {
export function userStateReducer(prevState: iUser, action: iUserAction) {

    let newState = { ...prevState }; // copy original object properties
    switch (action.type)
    {
    case eUserActionType.SET_NAME:
        newState.name = action.payload;
        break;
    case eUserActionType.SET_MAIL:
        newState.mail = action.payload;
        break;
    default: // never reach default.
        Assert.MustBeTrue(false, "Wrong reducer swich case");
        break;
    }
    return newState;
}

// const [state, dispatch] = useReducer( userContextReducer, initalUserContext );
// onClick={() => dispatch({ type: eUserAction.SET_NAME, payload: "hi" })};