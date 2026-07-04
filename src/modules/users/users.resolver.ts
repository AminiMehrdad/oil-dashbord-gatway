import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserModel } from './outputs/user.model';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { normalizeServiceError } from 'src/common/utils/http-error.util';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    try {
      return this.usersService.findAll();
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Query(() => UserModel)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserModel> {
    try {
      return this.usersService.findOne(id);
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => UserModel)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<UserModel> {
    try {
      return this.usersService.create(createUserInput);
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => UserModel)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<UserModel> {
    try {
      return this.usersService.update(id, updateUserInput);
    } catch (error) {
      normalizeServiceError(error);
    }
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    try {
      return this.usersService.remove(id);
    } catch (error) {
      normalizeServiceError(error);
    }
  }
}
