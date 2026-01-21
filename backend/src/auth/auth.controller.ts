import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // Validate and get/create user
    const user = await this.authService.validateGoogleUser(req.user);

    // Generate JWT
    const token = this.authService.generateToken(user);

    // Check if redirect_uri is provided (for mobile app)
    const redirectUri = req.query.state;
    if (redirectUri && redirectUri.startsWith('mandalaplan://')) {
      // Mobile app callback
      res.redirect(`${redirectUri}?token=${token}`);
    } else {
      // Web frontend callback
      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    };
  }
}
