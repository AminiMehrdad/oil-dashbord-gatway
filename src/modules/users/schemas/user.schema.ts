import { registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
}

export enum JobRole {
  PETROLUM_ENGINEER = 'Petrolum Engineer',
  FIELD_OPERATOR = 'Field Operator',
  PRODUCT_SUPERVISOR = 'Production Supervisor',
  OPERATOR_MANAGER = 'Operator Manager',
  DATA_ANALYST = 'Data Analyst',
  OTHER = 'Other',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

registerEnumType(JobRole, {
  name: 'JobRole',
});

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ type: String, enum: Object.values(JobRole), required: true })
  jobRole: JobRole;

  @Prop({ trim: true })
  imageLink?: string;

  @Prop({default: UserRole.USER })
  role?: UserRole;

  createdAt?: Date;

  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
