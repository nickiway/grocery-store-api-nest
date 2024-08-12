import { Injectable } from '@nestjs/common';

import { Good } from 'src/good/good.interface';

@Injectable()
export class BinService {
  private readonly bin: Good[] = [];

  add(good: Good) {
    this.bin.push(good);
  }

  getAll() {
    return this.bin;
  }
}
