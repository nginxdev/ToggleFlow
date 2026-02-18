import { Prisma } from '@prisma/client';
export class UpdateFlagStateDto {
  isEnabled?: boolean;
  rules?: Prisma.InputJsonValue; // JSON object for targeting rules
}
