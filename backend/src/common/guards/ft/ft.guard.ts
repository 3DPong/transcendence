// ft guard uses OAuth2 passport
// after 42 login, we get access token of 42api from /auth/redirect
// auth/redirect page give signup session to client

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtGuard extends AuthGuard('ft') {}
