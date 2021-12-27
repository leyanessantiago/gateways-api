import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.DATABASE_URL), GatewaysModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
