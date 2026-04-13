import { IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsNumber()
  itemId: number;
}
