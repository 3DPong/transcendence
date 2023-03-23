/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SignUp.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/23 18:55:41 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/23 22:10:10 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// 회원 가입
// 201 created
const SIGNUP_REQUEST = "POST /auth/signup";
interface POST_SignUpRespsoneFormat {
  user_id: number;
}

interface signUpProps {};

export function SignUp() {

    return (
        <div>
            signup page
        </div>
    );
}