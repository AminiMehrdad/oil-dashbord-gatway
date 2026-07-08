import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { DeleteUserOutput } from './outputs/delete-user.output';
import { UserOutput } from './outputs/user.output';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Resolver(() => UserOutput)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [UserOutput])
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async users(): Promise<UserOutput[]> {
    return await this.usersService.findAll();
  }

  @Query(() => UserOutput)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async user(@Args('id', { type: () => ID }) id: string): Promise<UserOutput> {
    return await this.usersService.findOne(id);
  }

  @Mutation(() => UserOutput)
  @Roles(UserRole.ADMIN)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<UserOutput> {
    return await this.usersService.create(createUserInput);
  }

  @Mutation(() => UserOutput)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<UserOutput> {
    return await this.usersService.update(id, updateUserInput);
  }

  @Mutation(() => DeleteUserOutput)
  @Roles(UserRole.ADMIN)
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeleteUserOutput> {
    return await this.usersService.remove(id);
  }
}
