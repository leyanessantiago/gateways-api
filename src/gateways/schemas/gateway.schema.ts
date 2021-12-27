import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Factory } from 'nestjs-seeder';

export const ipV4AddressRegex =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export type GatewayDocument = Gateway & Document;

@Schema()
export class Device {
  @Factory(() => Math.floor(1000000 + Math.random() * 9000000))
  @Prop({ type: Number, required: true, unique: true })
  uid: number;

  @Factory((faker) => faker.company.companyName())
  @Prop()
  vendor: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Factory((faker) => faker.random.arrayElement(Object.values(DeviceStatus)))
  @Prop({
    type: String,
    enum: {
      values: ['online', 'offline'],
      message: '{VALUE} is not supported',
    },
  })
  status: DeviceStatus;
}

@Schema()
export class Gateway {
  @Factory((faker) => faker.random.uuid())
  @Prop({ required: [true, 'Serial Number is a required field'], unique: true })
  serialNumber: string;

  @Factory((faker) => faker.random.word())
  @Prop()
  name: string;

  @Factory((faker) => faker.internet.ip())
  @Prop({
    type: String,
    match: [
      ipV4AddressRegex,
      '{VALUE} does not match the ip v4 address format.',
    ],
  })
  ipV4Address: string;

  @Prop({
    type: raw([
      {
        uid: { type: Number, required: true, unique: true },
        vendor: { type: String },
        createdAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: {
            values: ['online', 'offline'],
            message: '{VALUE} is not supported',
          },
        },
      },
    ]),
    validate: [
      validateDevices,
      '{PATH} exceeds the limit of 10 or have duplicate uids',
    ],
  })
  devices: any[];
}

function validateDevices(val) {
  let duplicated = false;
  let i = 0;
  while (!duplicated && i < val.length) {
    duplicated = val.slice(i + 1, val.length).some((v) => v.uid === val[i].uid);
    i++;
  }

  return val.length <= 10 && !duplicated;
}

export const GatewaySchema = SchemaFactory.createForClass(Gateway);
