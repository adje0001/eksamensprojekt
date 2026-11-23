import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';

// Feature module: groups the health controller. Imported by AppModule.
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
