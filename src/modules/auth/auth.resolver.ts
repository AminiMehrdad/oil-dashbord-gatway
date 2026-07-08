import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './types/auth-payload.model';
import { LoginInput } from './types/login.input';
import { LogOutUser } from './types/logout-user.output';
import { RegisterInput } from './inputs/register.input';
import { UserOutput } from '../users/outputs/user.output';
import { Public } from '../../common/decorators/public.decorator';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

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
    return this.authService.login(loginInput);
  }

  @Mutation(() => LogOutUser)
  @Public()
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ): Promise<LogOutUser> {
    return this.authService.logout(refreshToken);
  }

  @Mutation(() => AuthPayload)
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ): Promise<AuthPayload> {
    return this.authService.refreshToken(refreshToken);
  }
}
