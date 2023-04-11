// session guard is used for verify that session is valid
// if session is valid and user id is exists, it is verified
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
