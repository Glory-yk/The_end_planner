import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
        const project = this.projectRepository.create({
            ...createProjectDto,
            userId,
        });
        return await this.projectRepository.save(project);
    }

    async findAll(userId: string): Promise<Project[]> {
        return await this.projectRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id, userId },
        });
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    async update(id: string, userId: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const project = await this.findOne(id, userId);
        Object.assign(project, updateProjectDto);
        return await this.projectRepository.save(project);
    }

    async remove(id: string, userId: string): Promise<void> {
        const project = await this.findOne(id, userId);
        await this.projectRepository.remove(project);
    }
}
