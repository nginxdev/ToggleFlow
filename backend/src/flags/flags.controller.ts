import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
  findByProject(@Param('projectId') projectId: string) {
    return this.flagsService.findByProject(projectId);
  }

  @Get('flags/:id')
  findOne(@Param('id') id: string) {
    return this.flagsService.findOne(id);
  }

  @Post('projects/:projectId/flags')
  create(
    @Param('projectId') projectId: string,
    @Body() createFlagDto: CreateFlagDto,
  ) {
    return this.flagsService.create(createFlagDto, projectId);
  }

  @Patch('flags/:id')
  update(@Param('id') id: string, @Body() updateFlagDto: UpdateFlagDto) {
    return this.flagsService.update(id, updateFlagDto);
  }

  @Delete('flags/:id')
  delete(@Param('id') id: string) {
    return this.flagsService.delete(id);
  }

  @Patch('flags/:flagId/environments/:environmentId')
  updateFlagState(
    @Param('flagId') flagId: string,
    @Param('environmentId') environmentId: string,
    @Body() updateFlagStateDto: UpdateFlagStateDto,
  ) {
    return this.flagsService.updateFlagState(
      flagId,
      environmentId,
      updateFlagStateDto,
    );
  }
}
