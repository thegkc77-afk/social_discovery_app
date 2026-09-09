import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';

@ApiTags('Photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: "Get all photos for a specific user" })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  findByUser(@Param('userId') userId: string) {
    return this.photosService.findByUserId(userId);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'Add a new photo to user gallery' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  addPhoto(
    @Param('userId') userId: string,
    @Body() createPhotoDto: CreatePhotoDto,
  ) {
    return this.photosService.addPhoto(userId, createPhotoDto);
  }

  @Patch(':id/set-main')
  @ApiOperation({ summary: 'Set photo as the primary profile avatar' })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  setMainPhoto(@Param('id') id: string) {
    return this.photosService.setMainPhoto(id);
  }

  @Patch('user/:userId/reorder')
  @ApiOperation({ summary: 'Reorder user photos' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  reorder(
    @Param('userId') userId: string,
    @Body() reorderPhotosDto: ReorderPhotosDto,
  ) {
    return this.photosService.reorder(userId, reorderPhotosDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a photo by ID' })
  @ApiParam({ name: 'id', description: 'Photo UUID' })
  remove(@Param('id') id: string) {
    return this.photosService.removePhoto(id);
  }
}
