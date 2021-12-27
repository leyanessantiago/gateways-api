import {
  IsString,
  IsArray,
  IsIP,
  ArrayMaxSize,
  ArrayUnique,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export class DeviceDto {
  @IsNumber()
  @IsNotEmpty()
  uid: number;

  @IsOptional()
  @IsString()
  vendor: string;

  @IsOptional()
  @IsString()
  createdAt?: Date;

  @IsEnum(DeviceStatus)
  status: string;
}

export class CreateGatewayDto {
  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsString()
  name: string;

  @IsIP('4')
  ipV4Address: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique((device) => device.uid)
  @ValidateNested({ each: true })
  @Type(() => DeviceDto)
  devices?: DeviceDto[];
}
