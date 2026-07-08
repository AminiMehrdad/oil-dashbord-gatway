import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginOutput } from './outputs/login.output';
import { LoginInput } from './inputs/login.input';
import { LogOutUser } from './outputs/logout.output';
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

  @Mutation(() => LoginOutput)
  @Public()
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<LoginOutput> {
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

  @Mutation(() => LoginOutput)
  @Public()
  @UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Args('refreshToken', { type: () => String }) refreshToken: string,
  ): Promise<LoginOutput> {
    return this.authService.refreshToken(refreshToken);
  }
}
