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
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get('projects/:projectId/environments')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.environmentsService.findByProject(projectId);
  }

  @Post('projects/:projectId/environments')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ) {
    return this.environmentsService.create(createEnvironmentDto, projectId);
  }

  @Patch('environments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Delete('environments/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.environmentsService.delete(id);
  }
}
