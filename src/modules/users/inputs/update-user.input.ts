import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { JobRole, UserRole } from '../schemas/user.schema';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  company?: string;

  @Field(() => JobRole, { nullable: true })
  @IsOptional()
  @IsEnum(JobRole, {
    message:
      'Job role must be one of: PETROLUM_ENGINEER, FIELD_OPERATOR, PRODUCT_SUPERVISOR, OPERATOR_MANAGER, DATA_ANALYST, OTHER',
  })
  jobRole?: JobRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image link must be a valid URL' })
  imageLink?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: ADMIN, USER, MANAGER' })
  role?: UserRole;
}
