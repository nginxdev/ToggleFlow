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
import { FlagsService } from './flags.service';
import { CreateFlagDto } from './dto/create-flag.dto';
import { UpdateFlagDto } from './dto/update-flag.dto';
import { UpdateFlagStateDto } from './dto/update-flag-state.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get('projects/:projectId/flags')
  findByProject(@Param('projectId') projectId: string) {
    return this.flagsService.findByProject(projectId);
  }

  @Get('projects/:projectId/flags/archived')
  findArchivedByProject(@Param('projectId') projectId: string) {
    return this.flagsService.findArchivedByProject(projectId);
  }

  @Get('flags/:id')
  findOne(@Param('id') id: string) {
    return this.flagsService.findOne(id);
  }

  @Post('projects/:projectId/flags')
  create(
    @Param('projectId') projectId: string,
    @Body() createFlagDto: CreateFlagDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.create(createFlagDto, projectId, userId);
  }

  @Patch('flags/:id')
  update(
    @Param('id') id: string,
    @Body() updateFlagDto: UpdateFlagDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.update(id, updateFlagDto, userId);
  }

  @Delete('flags/:id')
  delete(@Param('id') id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.delete(id, userId);
  }

  @Patch('flags/:id/archive')
  archive(@Param('id') id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.archive(id, userId);
  }

  @Patch('flags/:id/unarchive')
  unarchive(@Param('id') id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.unarchive(id, userId);
  }

  @Patch('flags/:flagId/environments/:environmentId')
  updateFlagState(
    @Param('flagId') flagId: string,
    @Param('environmentId') environmentId: string,
    @Body() updateFlagStateDto: UpdateFlagStateDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.flagsService.updateFlagState(
      flagId,
      environmentId,
      updateFlagStateDto.isEnabled ?? false,
      userId,
    );
  }

  @Get('flags/:id/audits')
  getAudits(@Param('id') id: string) {
    return this.flagsService.getAudits(id);
  }
}
