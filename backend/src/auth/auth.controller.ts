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
  ) { }

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
      // Web frontend callback - Codespaces 자동 감지
      let frontendUrl = this.configService.get('FRONTEND_URL');
      if (!frontendUrl) {
        const codespaceName = process.env.CODESPACE_NAME;
        const codespaceDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
        frontendUrl = codespaceName
          ? `https://${codespaceName}-3001.${codespaceDomain}`
          : 'http://localhost:3001';
      }
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

  // 테스트 로그인: 실제 DB에 테스트 유저를 생성하고 진짜 JWT 반환 (프로덕션 외 환경에서만 작동)
  @Get('test-login')
  async testLogin(@Res() res: Response) {
    const node_env = process.env.NODE_ENV || 'development';
    if (node_env === 'production') {
      return res.status(403).json({ message: 'Not available in production' });
    }

    const testUser = await this.authService.getOrCreateTestUser();
    const token = this.authService.generateToken(testUser);
    return res.json({ token, user: { id: testUser.id, email: testUser.email, name: testUser.name } });
  }
}
