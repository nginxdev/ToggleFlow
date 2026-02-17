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
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get('projects/:projectId/environments')
  findByProject(@Param('projectId') projectId: string) {
    return this.environmentsService.findByProject(projectId);
  }

  @Post('projects/:projectId/environments')
  create(
    @Param('projectId') projectId: string,
    @Body() createEnvironmentDto: CreateEnvironmentDto,
  ) {
    return this.environmentsService.create(createEnvironmentDto, projectId);
  }

  @Patch('environments/:id')
  update(
    @Param('id') id: string,
    @Body() updateEnvironmentDto: UpdateEnvironmentDto,
  ) {
    return this.environmentsService.update(id, updateEnvironmentDto);
  }

  @Delete('environments/:id')
  delete(@Param('id') id: string) {
    return this.environmentsService.delete(id);
  }
}
