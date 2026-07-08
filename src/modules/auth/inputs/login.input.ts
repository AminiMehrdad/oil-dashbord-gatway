import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { IsEmailOrPhone } from 'src/common/decorators/is-email-or-phone.decorator';

@InputType()
export class LoginInput {
  @Field()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'Email or phone must be a string',
  })
  @IsNotEmpty({
    message: 'Email or phone is required',
  })
  @IsEmailOrPhone({
    message: 'Enter a valid email address or phone number',
  })
  emailOrPhone!: string;

  @Field()
  @IsString({
    message: 'Password must be a string',
  })
  @IsNotEmpty({
    message: 'Password is required',
  })
  password!: string;
}