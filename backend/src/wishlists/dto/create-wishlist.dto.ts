import {
  IsString,
  Length,
  IsUrl,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsOptional()
  @Length(1, 1500)
  description?: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  itemsId: number[];
}
