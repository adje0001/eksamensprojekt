import { Controller, Get } from '@nestjs/common';

// GET /health: lets Docker, CI and the VPS check that the API is up.
// Controller = the "C" in MVC: it maps an HTTP route to a method and returns the response.
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
