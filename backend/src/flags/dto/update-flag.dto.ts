import { PartialType } from '@nestjs/mapped-types';
import { CreateFlagDto } from './create-flag.dto';

export class UpdateFlagDto extends PartialType(CreateFlagDto) {}
