import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { ProductImage } from ".";
import { User } from "src/auth/entities/user.entity";


@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: '02aff58c-95a2-4acd-ac3c-14f894247679',
        uniqueItems: true,
        description: 'Product ID'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Mens Powerwall Tee',
        uniqueItems: true,
        description: 'Product title'
    })
    @Column('text', { unique: true })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product price',
        default: 0
    })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({
        example: 'loreQui id officia voluptate officia voluptate consequat laboris.',
        description: 'Product description',
        default: null
    })
    //De igual forma que las anteriores se puede especificar el tipo dentro de los {}
    @Column({ type: 'text', nullable: true })
    description: string;

    @ApiProperty({
        example: 'men_powerwall_tee',
        description: 'Product SLUG - for SEO',
        uniqueItems: true,
    })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', { default: 0 })
    stock: number;

    @ApiProperty({
        example: ["XL", "XXL"],
        description: 'Product sizes'
    })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({
        example: 'men',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: ["shirt"],
        description: 'Product tags'
    })
    @Column('text', { array: true, default: [] })
    tags: string[];

    @ApiProperty({
        example: [
            "9877034-00-A_0_2000.jpg",
            "9877034-00-A_2.jpg"
        ],
        description: 'Product images'
    })
    //https://orkhan.gitbook.io/typeorm/docs/eager-and-lazy-relations
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }//Eager es para que carge directamente las relacionesal realizar algun find*
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) this.slug = this.title

        this.slug = this.slug
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

}
