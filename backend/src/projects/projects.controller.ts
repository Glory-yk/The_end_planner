import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(req.user.id, createProjectDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.projectsService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.projectsService.findOne(id, req.user.id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.projectsService.update(id, req.user.id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.projectsService.remove(id, req.user.id);
    }
}
