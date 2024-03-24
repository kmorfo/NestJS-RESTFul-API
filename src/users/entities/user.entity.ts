import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities";

@Entity('users')
export class User {

    @ApiProperty({
        example: '02aff58c-95a2-4acd-ac3c-14f894247679',
        uniqueItems: true,
        description: 'User ID'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'test@test.es',
        uniqueItems: true,
        description: 'Email account'
    })
    @Column('text', { unique: true })
    email: string;

    @ApiProperty({
        description: 'Account password. The password must have a Uppercase, lowercase letter and a number',
        minLength: 6,
        maxLength: 50
    })
    //Se establece select false para que no se devuelva la contraseña al hacer un find si no se especifica manualmente
    @Column('text', { select: false })
    password: string;

    @ApiProperty({
        description: 'Full name of user',
        example: 'Pedro Garcia',
        minLength: 1
    })
    @Column('text')
    fullName: string;

    @ApiProperty()
    @Column('bool', { default: true })
    isActive: boolean;

    @ApiProperty({
        description: 'Indicates if the email of the user is verified'
    })
    @Column('bool', { default: false })
    isEmailVerified: boolean;
    
    @ApiProperty()
    @Column('text', { array: true, default: ['user'] })
    roles: string[];
    
    @OneToMany(
        ()=>Product,//Establece con que tabla se relaciona
        (product)=>product.user//Establece la columna de la tabla que se relaciona con esta
    )
    product:Product;

    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLocaleLowerCase().trim();
    }

}
 