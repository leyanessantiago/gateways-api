import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { CreateGatewayDto, DeviceDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Controller('gateways')
export class GatewaysController {
  constructor(private readonly gatewaysService: GatewaysService) {}

  @Post()
  create(@Body() createGatewayDto: CreateGatewayDto) {
    return this.gatewaysService.create(createGatewayDto);
  }

  @Get()
  findAll(@Query('limit') limit: number, @Query('page') page: number) {
    return this.gatewaysService.find(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gatewaysService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGatewayDto: UpdateGatewayDto) {
    return this.gatewaysService.update(id, updateGatewayDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gatewaysService.remove(id);
  }

  @Patch(':id/device')
  addGatewayDevice(@Param('id') id: string, @Body() deviceDto: DeviceDto) {
    return this.gatewaysService.addGatewayDevice(id, deviceDto);
  }

  @Delete(':id/device/:uid')
  removeGatewayDevice(@Param('id') id: string, @Param('uid') uid: number) {
    return this.gatewaysService.removeGatewayDevice(id, uid);
  }
}
