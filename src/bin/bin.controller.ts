import { Controller, Get, Post, Body } from '@nestjs/common';

import { Good } from 'src/good/good.interface';
import { BinService } from './bin.service';

@Controller('user/:id')
export class BinController {
  constructor(private binService: BinService) {}

  @Post('bin')
  add(@Body() body): string {
    this.binService.add(body);
    return 'Added successfully';
  }

  @Get('bin')
  get(): Good[] {
    return this.binService.getAll();
  }
}
