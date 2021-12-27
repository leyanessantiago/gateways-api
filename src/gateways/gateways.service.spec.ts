import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../test-utils/mongo/MongooseTestModule';
import { GatewaysService } from './gateways.service';
import { GatewaySchema } from './schemas/gateway.schema';
import { CreateGatewayDto, DeviceDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import * as mongoose from 'mongoose';

const deviceDto: DeviceDto = {
  uid: 6111187,
  vendor: 'Walsh-Hane',
  status: 'online',
};

const createGatewayDto: CreateGatewayDto = {
  serialNumber: 'e319d610-2770-4cad-b7b6-592459cc9d2w',
  name: 'Konklux',
  ipV4Address: '0.44.35.122',
  devices: [deviceDto],
};

describe('GatewaysService', () => {
  let service: GatewaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: 'Gateway', schema: GatewaySchema }]),
      ],
      providers: [GatewaysService],
    }).compile();

    service = module.get<GatewaysService>(GatewaysService);
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Gateway', () => {
    it('should create a gateway', async () => {
      const response = await service.create(createGatewayDto);
      expect(response).not.toEqual(null);
    });

    it('should throw a Bad Request Exception when the serial number is duplicate', async () => {
      const duplicateSerialNumber: CreateGatewayDto = {
        ...createGatewayDto,
        devices: [
          {
            ...deviceDto,
            uid: deviceDto.uid + 1,
          },
        ],
      };
      await service.create(createGatewayDto);
      await service.find();
      await expect(service.create(duplicateSerialNumber)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw a Bad Request Exception when the ip address is invalid', async () => {
      const createGatewayDtoWithInvalidIp: CreateGatewayDto = {
        ...createGatewayDto,
        ipV4Address: 'invalid ip address',
      };
      await expect(
        service.create(createGatewayDtoWithInvalidIp),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a Bad Request Exception when there are more than 10 devices', async () => {
      const devices: DeviceDto[] = [];
      for (let i = 0; i < 11; i++) {
        devices.push({
          ...deviceDto,
          uid: deviceDto.uid + i,
        });
      }
      const duplicatedDevicesUID: CreateGatewayDto = {
        ...createGatewayDto,
        devices,
      };
      await expect(service.create(duplicatedDevicesUID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Update Gateway', () => {
    it('should update a gateway', async () => {
      const gateway = await service.create(createGatewayDto);

      const updateGatewayDto: UpdateGatewayDto = {
        ...createGatewayDto,
        name: 'Updated Gateway name',
      };

      const response = await service.update(gateway.id, updateGatewayDto);
      expect(response).not.toEqual(null);
    });

    it('should throw a Not Found Exception when the gateway does not exist', async () => {
      const id = new mongoose.Types.ObjectId().toString();
      await expect(service.update(id, createGatewayDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
