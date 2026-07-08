import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { DeleteUserOutput } from './outputs/delete-user.output';
import { UserOutput } from './outputs/user.output';
import { UserDocument } from './schemas/user.schema';
import { UsersRepository } from './users.repo';
import { EmailAlreadyExistsException } from 'src/common/exceptions/register-erros/email-already-exists.exception';
import { PhoneAlreadyExistsException } from 'src/common/exceptions/register-erros/phone-already-exists.exception';

type UserObject = Omit<UserDocument, 'toObject'> & {
  _id: { toString: () => string };
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(input: CreateUserInput): Promise<UserOutput> {
    const user_email = await this.usersRepository.findByEmail(input.email);
    if( user_email ) {
      throw new EmailAlreadyExistsException(input.email)
    }

    const user_phone = await this.usersRepository.findByPhone(input.phone);
    if(user_phone) {
      throw new PhoneAlreadyExistsException(input.phone)
    }

    const user = await this.usersRepository.create(input);
    return this.toUserOutput(user);
  }

  async findAll(): Promise<UserOutput[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toUserOutput(user));
  }

  async findOne(id: string): Promise<UserOutput> {
    const user = await this.usersRepository.findById(id);
    return this.toUserOutput(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserOutput> {
    const user = await this.usersRepository.update(id, input);
    return this.toUserOutput(user);
  }

  async remove(id: string): Promise<DeleteUserOutput> {
    await this.usersRepository.delete(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  private toUserOutput(document: UserDocument): UserOutput {
    const user = document.toObject() as UserObject;

    return {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      jobRole: user.jobRole,
      imageLink: user.imageLink,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
