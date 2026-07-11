import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateTokenInput {
    @Field()
    @IsString({
        message: 'Refresh token must be a string',
    })
    @IsNotEmpty({
        message: 'Refresh token is required',
    })
    refreshTokenHash!: string;

    @Field()
    @IsString({
        message: 'User ID must be a string',
    })
    @IsNotEmpty({
        message: 'User ID is required',
    })
    userId: string;

    @Field({ nullable: true })
    expiresAt?: Date;

    @Field({ nullable: true })
    revoked?: boolean;

}