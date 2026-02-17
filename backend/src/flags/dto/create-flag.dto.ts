export class CreateFlagDto {
  name: string;
  key: string;
  description?: string;
  type?: string; // boolean, string, number, json
  defaultValue: string;
  variations?: any; // JSON array of possible variations
}
