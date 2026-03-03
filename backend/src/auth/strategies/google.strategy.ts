import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

function getCallbackUrl(configService: ConfigService): string {
  // 1. 환경변수 우선
  const envUrl = configService.get<string>('GOOGLE_CALLBACK_URL');
  if (envUrl) return envUrl;

  // 2. Codespaces 환경 자동 감지
  const codespaceName = process.env.CODESPACE_NAME;
  const codespaceDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
  if (codespaceName) {
    return `https://${codespaceName}-3000.${codespaceDomain}/auth/google/callback`;
  }

  // 3. 로컬 개발 fallback
  return 'http://localhost:3000/auth/google/callback';
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: getCallbackUrl(configService),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
      passReqToCallback: true,
    } as any);
  }

  // Override authenticate to pass state parameter
  authenticate(req: any, options: any) {
    if (req.query.state) {
      options = { ...options, state: req.query.state };
    }
    super.authenticate(req, options);
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      picture: photos[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
