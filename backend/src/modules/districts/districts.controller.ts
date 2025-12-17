import { Controller, Get } from '@nestjs/common';
import { DistrictsService } from './districts.service';

@Controller('districts')
export class DistrictsController {
    constructor(private readonly districtsService: DistrictsService) { }

    @Get()
    async findAll() {
        return this.districtsService.findAll();
    }
}
