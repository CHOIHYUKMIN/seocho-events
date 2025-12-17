import { Controller, Get, Post, Param, Query, Body, Patch, HttpCode } from '@nestjs/common';
import { EventsService } from './events.service';
import { QueryEventDto } from './dto/query-event.dto';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    async findAll(@Query() query: QueryEventDto) {
        return this.eventsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.eventsService.findOne(+id);
    }

    @Post(':id/view')
    @HttpCode(200)
    async incrementView(@Param('id') id: string) {
        return this.eventsService.incrementViewCount(+id);
    }
}
