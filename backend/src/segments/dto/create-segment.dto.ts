import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator";

export class CreateSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  rules: any[];
}
