import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { User, UserDocument } from './schemas/user.schema';
import { UserNotFoundException } from 'src/common/exceptions/custom.exception';
import { DatabaseException } from 'src/common/exceptions/custom.exception';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async create(input: CreateUserInput): Promise<UserDocument> {
    try {
      return await this.userModel.create(this.normalizeCreateInput(input));
    } catch (error) {
      throw new DatabaseException()
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      return this.userModel.find().exec();
    } catch (error) {
      throw new DatabaseException()
    }
  }

  async findById(id: string, includePassword = false): Promise<UserDocument> {
    this.validateObjectId(id);
    try {
      const query = this.userModel.findById(id);
      if (includePassword) {
        query.select('+password');
      }

      const user = await query.exec();
      if (!user) {
        throw new UserNotFoundException();
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new DatabaseException()
    }
  }

  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    try {
      const query = this.userModel.findOne({ email: email.trim() });
      if (includePassword) {
        query.select('+password');
      }
      return query.exec();
    } catch (error) {
      throw new DatabaseException();
    }
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    try {
      return this.userModel.findOne({ phone: phone.trim() }).exec();
    } catch (error) {
      throw new DatabaseException();
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<UserDocument> {
    this.validateObjectId(id);

    try {
      const user = await this.userModel
        .findByIdAndUpdate(id, this.normalizeUpdateInput(input), {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!user) {
        throw new UserNotFoundException();
      }
      return user;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new DatabaseException();
    }
  }

  async delete(id: string): Promise<void> {
    this.validateObjectId(id);

    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();
      if (!user) {
        throw new UserNotFoundException();
      }
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new DatabaseException();
    }
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new UserNotFoundException();
    }
  }

  private normalizeCreateInput(input: CreateUserInput): CreateUserInput {
    return {
      ...input,
      email: input.email.trim(),
      phone: input.phone.trim(),
    };
  }

  private normalizeUpdateInput(input: UpdateUserInput): UpdateQuery<UserDocument> {
    return {
      ...input,
      ...(input.email ? { email: input.email.trim() } : {}),
      ...(input.phone ? { phone: input.phone.trim() } : {}),
    };
  }
}
