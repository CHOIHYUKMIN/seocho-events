import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { EventsModule } from './modules/events/events.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DataSourcesModule } from './modules/data-sources/data-sources.module';
import { CrawlerModule } from './modules/crawler/crawler.module';

@Module({
  imports: [
    PrismaModule,
    DistrictsModule,
    EventsModule,
    CategoriesModule,
    DataSourcesModule,
    CrawlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
