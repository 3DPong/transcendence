/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TextFields_B.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 15:39:11 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:31:05 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { eFormStatus }     from '@/types/form';

const { ENABLE, DISABLE, ON_PROCESSING } = eFormStatus;

// https://mui.com/material-ui/react-text-field/


interface ITextFieldProps 
{
    // Required Props
    status              : eFormStatus,
    state               : string,
    setState            : (arg: string) => void,
    // Optional Props
    type?               : string, // text or password... etc
    label?              : string, // 표시할 내용.
    placeholder?        : string, // 미입력시 기본으로 표시할 내용.
    helperText?         : string, // 오류시 표기할 내용.
}

export function TextFields( { status, setState,
                                        label  = 'Label', 
                                        // placeholder = 'Placeholder', 
                                        type = 'text',
                                        helperText = 'helperText'
                                    }: ITextFieldProps )

{
    let text;
    if (status === DISABLE)
    {
        text = (
            <TextField
                // defaultValue={placeholder}
                variant="standard"
                type={type}
                label={label}
                onChange={(event) => {
                    setState(event.target.value);
                }}
                helperText={helperText}
                id="standard-error-helper-text"
                error
                required
            />
        );
    }
    else // ON_PROCESSING || ENABLE
    {
        text = (
            <TextField
                // defaultValue={placeholder}
                variant="standard"
                type={type}
                label={label}
                onChange={(event) => {
                    setState(event.target.value);
                }}
                id="standard-required"
                required
            />
        );
    }

    return (
        <Box
            component="form"
            sx={{
            // "& .MuiTextField-root": { m: 1, /*width: "28ch"*/ },
            "& .MuiTextField-root": { m: 1, width: "31ch" },
            }}
            noValidate
            autoComplete="off"
        >
            {text}
        </Box>
    );
}