import { IsEnum } from 'class-validator';
import { InquiryStatus } from '../inquiry-status.enum.js';

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus, {
    message: `status must be one of: ${Object.values(InquiryStatus).join(', ')}`,
  })
  status: InquiryStatus;
}
