import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder, DataFactory } from 'nestjs-seeder';
import {
  Gateway,
  Device,
  GatewayDocument,
} from '../gateways/schemas/gateway.schema';

@Injectable()
export class GatewaysSeeder implements Seeder {
  constructor(
    @InjectModel(Gateway.name) private gatewayModel: Model<GatewayDocument>,
  ) {}

  async seed(): Promise<any> {
    const gateways = DataFactory.createForClass(Gateway)
      .generate(50)
      .map((gateway) => {
        const devices = DataFactory.createForClass(Device).generate(
          Math.floor(1 + Math.random() * 10),
        );
        return {
          ...gateway,
          devices,
        };
      });

    return this.gatewayModel.insertMany(gateways);
  }

  async drop(): Promise<any> {
    return this.gatewayModel.deleteMany({});
  }
}
