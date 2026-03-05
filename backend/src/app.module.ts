import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { MandalartModule } from './mandalart/mandalart.module';
import { CalendarModule } from './calendar/calendar.module';
import { Task } from './tasks/entities/task.entity';
import { User } from './auth/entities/user.entity';
import { FocusSession } from './tasks/entities/focus-session.entity';
import { Mandalart } from './mandalart/entities/mandalart.entity';
import { AppController } from './app.controller';
import { ProjectsModule } from './projects/projects.module';
import { Project } from './projects/entities/project.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST');
        const url = configService.get('DATABASE_URL');

        if (dbHost) {
          console.log(`Using individual DB variables. Host: ${dbHost}`);
          const isLocal = dbHost === 'localhost' || dbHost === '127.0.0.1';
          const isInternal = dbHost.includes('.neon.tech') || isLocal;
          return {
            type: 'postgres' as const,
            host: dbHost as string,
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE', 'neondb'),
            entities: [Task, User, FocusSession, Mandalart, Project],
            synchronize: true,
            ssl: isInternal ? false : { rejectUnauthorized: false },
          };
        }

        if (url) {
          console.log('Using DATABASE_URL for Postgres connection.');
          return {
            type: 'postgres' as const,
            url,
            entities: [Task, User, FocusSession, Mandalart, Project],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }

        console.warn('No database configuration found. Using SQLite for local development.');
        return {
          type: 'sqlite' as const,
          database: 'database.sqlite',
          entities: [Task, User, FocusSession, Mandalart, Project],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TasksModule,
    MandalartModule,
    CalendarModule,
    ProjectsModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
