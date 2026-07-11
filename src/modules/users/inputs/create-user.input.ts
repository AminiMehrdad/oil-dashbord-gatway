import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { JobRole, UserRole } from '../schemas/user.schema';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @Field(() => JobRole)
  @IsEnum(JobRole, {
    message:
      'Job role must be one of: PETROLUM_ENGINEER, FIELD_OPERATOR, PRODUCT_SUPERVISOR, OPERATOR_MANAGER, DATA_ANALYST, OTHER',
  })
  jobRole: JobRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image link must be a valid URL' })
  imageLink?: string;

}
