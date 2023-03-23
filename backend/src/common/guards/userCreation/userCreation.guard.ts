// signup guard check that session is signup status
// in user creation route, service uses request.session.access token to get profile.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserCreationGuard extends AuthGuard('creation') {}
