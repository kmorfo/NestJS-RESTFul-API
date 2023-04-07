import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from ".";

@Entity({name:'product_images'})
export class ProductImage {

    @ApiProperty({
        example: 419,
        description: 'Auto generated ID column',
        uniqueItems:true
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description:'Name of image',
        example:'7652426-00-A_0_2000.jpg'
    })
    @Column(('text'))
    url: string;

    @ApiProperty()
    @ManyToOne(
        () => Product,
        (product) => product.images,
        {onDelete:'CASCADE'}
    )
    product: Product;

}