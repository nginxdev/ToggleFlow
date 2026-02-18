import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request as NestRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';

@Controller('segments')
@UseGuards(AuthGuard('jwt'))
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Post(':projectId')
  create(
    @Param('projectId') projectId: string,
    @Body() createSegmentDto: CreateSegmentDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.segmentsService.create(createSegmentDto, projectId, userId);
  }

  @Get('project/:projectId')
  findAll(@Param('projectId') projectId: string) {
    return this.segmentsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSegmentDto: UpdateSegmentDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.segmentsService.update(id, updateSegmentDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.segmentsService.remove(id, userId);
  }
}
