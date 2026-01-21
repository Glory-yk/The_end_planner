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

        // Railway 개별 환경변수가 있으면 사용
        if (dbHost) {
          console.log(`Using individual DB variables. Host: ${dbHost}`);
          const isInternal = dbHost.includes('.railway.internal');
          return {
            type: 'postgres' as const,
            host: dbHost as string,
            port: configService.get<number>('DB_PORT', 5432),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE', 'railway'),
            entities: [Task, User, FocusSession, Mandalart],
            synchronize: true,
            // Railway 내부 네트워크는 SSL 불필요
            ssl: isInternal ? false : { rejectUnauthorized: false },
          };
        }

        // DATABASE_URL이 있으면 사용
        if (url) {
          console.log('Using DATABASE_URL for Postgres connection.');
          return {
            type: 'postgres' as const,
            url,
            entities: [Task, User, FocusSession, Mandalart],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          };
        }

        // 로컬 개발용 SQLite fallback
        console.warn('No database configuration found. Using SQLite for local development.');
        return {
          type: 'sqlite' as const,
          database: 'database.sqlite',
          entities: [Task, User, FocusSession, Mandalart],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TasksModule,
    MandalartModule,
    CalendarModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
