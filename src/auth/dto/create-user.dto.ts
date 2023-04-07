import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @ApiProperty({
        description: 'Registration user email',
        example: 'test@test.com'
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Account password. The password must have a Uppercase, lowercase letter and a number',
        minLength: 6,
        maxLength: 50
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @ApiProperty({
        description: 'Full name of user',
        example: 'Pedro Garcia',
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    fullName: string;
}