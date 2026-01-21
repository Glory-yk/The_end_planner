import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
      passReqToCallback: true,
    } as any);
  }

  // Override authenticate to pass state parameter
  authenticate(req: any, options: any) {
    // state 파라미터가 있으면 전달
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
      // Include tokens for Calendar API access
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
