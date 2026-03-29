import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  message: string;
}
