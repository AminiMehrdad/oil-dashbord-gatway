import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { AuthPayload } from '../types/auth-payload.model';
import { CreatedUser } from '../types/create-user.output';
import { CreateUserInput } from '../types/create-user.input';
import { LoginInput } from '../types/login.input';
import {
  normalizeServiceError,
  throwIfErrorResponse,
} from 'src/common/utils/http-error.util';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LogOutUser } from '../types/logout-user.output';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => CreatedUser)
  @Public()
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<CreatedUser> {
    try {
      const response = await this.authService.createUser(createUserInput);
      throwIfErrorResponse(response);
      return response;
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => AuthPayload)
  @Public()
  async login(
    @Args('loginInput') loginInput: LoginInput,
  ): Promise<AuthPayload> {
    const response = await this.authService.login(loginInput);

    console.log('Auth Service Response:', response);

    if (response.statusCode && response.statusCode >= 400) {
      if (response.statusCode === 401) {
        throw new UnauthorizedException('Rong Username or PassWord');
      }
      if (response.statusCode === 400) {
        throw new BadRequestException(
          response.message || 'UnCorrect Input variables',
        );
      }
      throw new InternalServerErrorException('Internal server error');
    }

    return response;
  }

  @Mutation(() => LogOutUser)
  async logout(
    @Args('refresh', { type: () => String }) refresh: string,
  ): Promise<LogOutUser> {
    const response = await this.authService.logout(refresh);

    console.log('Auth Service Response:', response);

    if (response.statusCode && response.statusCode >= 400) {
      if (response.statusCode === 401) {
        throw new UnauthorizedException('Wrong Username or Password');
      }

      if (response.statusCode === 400) {
        throw new BadRequestException(
          response.message || 'Incorrect input variables',
        );
      }

      throw new InternalServerErrorException('Internal server error');
    }

    return response;
  }
}
