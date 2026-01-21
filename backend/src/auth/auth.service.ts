import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface GoogleUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        googleAccessToken: googleUser.accessToken,
        googleRefreshToken: googleUser.refreshToken,
      });
      await this.userRepository.save(user);
    } else {
      // Update existing user info and tokens
      user.email = googleUser.email;
      user.name = googleUser.name;
      user.picture = googleUser.picture || null;
      // Always update access token, only update refresh token if provided
      if (googleUser.accessToken) {
        user.googleAccessToken = googleUser.accessToken;
      }
      if (googleUser.refreshToken) {
        user.googleRefreshToken = googleUser.refreshToken;
      }
      await this.userRepository.save(user);
    }

    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}

