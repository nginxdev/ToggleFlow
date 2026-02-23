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
} from "@nestjs/common";
import { Request } from "express";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("projects")
@UseGuards(AuthGuard("jwt"))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.projectsService.findAll(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.projectsService.findOne(id, userId);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.projectsService.create(createProjectDto, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @NestRequest() req: Request,
  ) {
    const userId = (req.user as { userId: string }).userId;
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(":id")
  delete(@Param("id") id: string, @NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    return this.projectsService.delete(id, userId);
  }
}
