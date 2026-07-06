import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './types/auth-payload.model';
import { LoginInput } from './types/login.input';
import {
  normalizeServiceError,
  throwIfErrorResponse,
} from 'src/common/utils/http-error.util';
import { LogOutUser } from './types/logout-user.output';
import { RegisterInput } from './inputs/register.input';
import { UserOutput } from '../users/outputs/user.output';
import { Public } from './decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserOutput)
  @Public()
  async register(
    @Args('registerInput') registerInput: RegisterInput,
  ): Promise<UserOutput> {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthPayload)
  @Public()
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthPayload> {
    try {
      const response = await this.authService.login(loginInput);
      throwIfErrorResponse(response);
      return response;
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => LogOutUser)
  @Public()
  async logout(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ): Promise<LogOutUser> {
    try {
      const response = await this.authService.logout(refreshToken);
      throwIfErrorResponse(response);
      return response;
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => AuthPayload)
  @Public()
  async refreshToken(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ): Promise<AuthPayload> {
    try {
      const response = await this.authService.refreshToken(refreshToken);
      throwIfErrorResponse(response);
      return response;
    } catch (error) {
      normalizeServiceError(error);
    }
  }
}
