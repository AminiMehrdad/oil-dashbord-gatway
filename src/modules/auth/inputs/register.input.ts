import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { JobRole, UserRole } from 'src/modules/users/schemas/user.schema';

@InputType()
export class RegisterInput {
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
  @IsNotEmpty({ message: 'Company is required' })
  company: string;

  @Field(() => JobRole)
  @IsEnum(JobRole, {
    message:
      'Job role must be one of: PETROLUM_ENGINEER, FIELD_OPERATOR, PRODUCT_SUPERVISOR, OPERATOR_MANAGER, DATA_ANALYST, OTHER',
  })
  jobRole: JobRole;

  @Field()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: ADMIN, USER, MANAGER' })
  role?: UserRole;
}
