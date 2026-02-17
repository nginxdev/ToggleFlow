import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
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
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.flagsService.findByProject(projectId);
  }

  @Get('flags/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flagsService.findOne(id);
  }

  @Post('projects/:projectId/flags')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createFlagDto: CreateFlagDto,
  ) {
    return this.flagsService.create(createFlagDto, projectId);
  }

  @Patch('flags/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlagDto: UpdateFlagDto,
  ) {
    return this.flagsService.update(id, updateFlagDto);
  }

  @Delete('flags/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.flagsService.delete(id);
  }

  @Patch('flags/:flagId/environments/:environmentId')
  updateFlagState(
    @Param('flagId', ParseIntPipe) flagId: number,
    @Param('environmentId', ParseIntPipe) environmentId: number,
    @Body() updateFlagStateDto: UpdateFlagStateDto,
  ) {
    return this.flagsService.updateFlagState(flagId, environmentId, updateFlagStateDto);
  }
}
