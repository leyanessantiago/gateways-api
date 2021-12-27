import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGatewayDto, DeviceDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { Gateway, GatewayDocument } from './schemas/gateway.schema';

export interface PagedResponse {
  results: GatewayDocument[];
  count: number;
  page: number;
}

@Injectable()
export class GatewaysService {
  constructor(
    @InjectModel(Gateway.name) private gatewayModel: Model<GatewayDocument>,
  ) {}

  async create(createGatewayDto: CreateGatewayDto): Promise<GatewayDocument> {
    try {
      const createdGateway = new this.gatewayModel(createGatewayDto);
      return await createdGateway.save();
    } catch (err) {
      if (err.name === 'ValidationError' || err.code === 11000) {
        throw new BadRequestException(err.message, err.stack);
      }

      throw new InternalServerErrorException(
        'Oops, something went wrong. Someone is working to fix this.',
        err.stack,
      );
    }
  }

  async find(page?: number, limit?: number): Promise<PagedResponse> {
    const offset = page > 0 ? limit * (page - 1) : 0;
    const gateways = await this.gatewayModel
      .find({})
      .limit(limit || 0)
      .skip(offset);

    const count = await this.gatewayModel.countDocuments();

    return {
      results: gateways,
      count,
      page,
    };
  }

  async findOne(id: string) {
    const gateway = await this.gatewayModel.findById(id);
    if (!gateway) {
      throw new NotFoundException(
        'The gateway with the given id does not exist',
      );
    }
    return gateway;
  }

  async update(id: string, updateGatewayDto: UpdateGatewayDto) {
    try {
      const gateway = await this.gatewayModel.findByIdAndUpdate(
        id,
        updateGatewayDto,
        { new: true },
      );
      if (!gateway) {
        throw new NotFoundException(
          'The gateway with the given id does not exist',
        );
      }
      return gateway;
    } catch (err) {
      if (err.name === 'ValidationError' || err.code === 11000) {
        throw new BadRequestException(err.message, err.stack);
      }

      if (err.name === 'NotFoundException') {
        throw new NotFoundException(err.message);
      }

      throw new InternalServerErrorException(
        'Oops, something went wrong. Someone is working to fix this.',
        err.stack,
      );
    }
  }

  async remove(id: string) {
    const gateway = await this.gatewayModel.findByIdAndDelete(id);
    if (!gateway) {
      throw new NotFoundException(
        'The gateway with the given id does not exist',
      );
    }
    return gateway;
  }

  async addGatewayDevice(id: string, device: DeviceDto) {
    const gateway = await this.gatewayModel.findById(id);
    if (!gateway) {
      throw new NotFoundException(
        'The gateway with the given id does not exist',
      );
    }

    try {
      gateway.devices.push(device);
      await gateway.validate();
      return await gateway.save();
    } catch (err) {
      if (err.name === 'ValidationError' || err.code === 11000) {
        throw new BadRequestException(err.message, err.stack);
      }

      throw new InternalServerErrorException(
        'Oops, something went wrong. Someone is working to fix this.',
        err.stack,
      );
    }
  }

  async removeGatewayDevice(id: string, deviceUID: number) {
    const gateway = await this.gatewayModel.findById(id);
    if (!gateway) {
      throw new NotFoundException('The device does not exist');
    }

    try {
      gateway.devices = gateway.devices.filter(
        (device) => device.uid !== deviceUID,
      );
      return await gateway.save();
    } catch (err) {
      if (err.name === 'ValidationError' || err.code === 11000) {
        throw new BadRequestException(err.message, err.stack);
      }

      throw new InternalServerErrorException(
        'Oops, something went wrong. Someone is working to fix this.',
        err.stack,
      );
    }
  }
}
