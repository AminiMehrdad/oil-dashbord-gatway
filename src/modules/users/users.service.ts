import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { UserModel } from './outputs/user.model';

type UserRecord = User & {
  _id: { toString: () => string };
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<UserModel> {
    const created = await this.userModel.create(createUserInput);
    return this.toUserModel(created.toObject() as unknown as UserRecord);
  }

  async findAll(): Promise<UserModel[]> {
    const users = await this.userModel.find().lean<UserRecord[]>().exec();
    return users.map((user) => this.toUserModel(user));
  }

  async findOne(id: string): Promise<UserModel> {
    const user = await this.userModel.findById(id).lean<UserRecord>().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toUserModel(user);
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
  ): Promise<UserModel> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, updateUserInput, { new: true })
      .lean<UserRecord>()
      .exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.toUserModel(updated);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  private toUserModel(user: UserRecord): UserModel {
    return {
      _id: user._id.toString(),
      firstname: user.firstname,
      lastname: user.lastname,
      phonenumber: user.phonenumber,
      email: user.email,
      password: user.password,
      companyname: user.companyname,
      jobtitle: user.jobtitle,
      imageLink: user.imageLink,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
