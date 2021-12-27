import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { Gateway, GatewaySchema } from './gateways/schemas/gateway.schema';
import { GatewaysSeeder } from './seeders/gateways.seeder';

seeder({
  imports: [
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([{ name: Gateway.name, schema: GatewaySchema }]),
  ],
}).run([GatewaysSeeder]);
