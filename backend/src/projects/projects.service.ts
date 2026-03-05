import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async create(userId: string, createProjectDto: CreateProjectDto): Promise<Project> {
        // sortOrder: 현재 최대값 + 1
        const maxOrder = await this.projectRepository
            .createQueryBuilder('p')
            .select('MAX(p.sortOrder)', 'max')
            .where('p.userId = :userId', { userId })
            .getRawOne();
        const project = this.projectRepository.create({
            ...createProjectDto,
            userId,
            sortOrder: (maxOrder?.max ?? -1) + 1,
        });
        return await this.projectRepository.save(project);
    }

    async findAll(userId: string): Promise<Project[]> {
        return await this.projectRepository.find({
            where: { userId },
            order: { sortOrder: 'ASC', createdAt: 'DESC' },
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
        // FK 제약 우회: 태스크의 projectId를 먼저 null로 초기화
        await this.taskRepository.update({ projectId: id }, { projectId: null } as any);
        await this.projectRepository.remove(project);
    }

    // 순서 일괄 업데이트: orderedIds = [id1, id2, id3, ...]
    async reorder(userId: string, orderedIds: string[]): Promise<void> {
        const projects = await this.projectRepository.find({
            where: { id: In(orderedIds), userId },
        });
        const updates = orderedIds.map((id, index) => {
            const project = projects.find(p => p.id === id);
            if (project) {
                project.sortOrder = index;
            }
            return project;
        }).filter(Boolean) as Project[];
        await this.projectRepository.save(updates);
    }
}
