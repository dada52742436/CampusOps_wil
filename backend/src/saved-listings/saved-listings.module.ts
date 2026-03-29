import { Module } from '@nestjs/common';
import { SavedListingsController } from './saved-listings.controller.js';
import { SavedListingsService } from './saved-listings.service.js';

@Module({
  controllers: [SavedListingsController],
  providers: [SavedListingsService],
})
export class SavedListingsModule {}
