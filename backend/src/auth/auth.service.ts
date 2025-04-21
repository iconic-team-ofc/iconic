import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import admin from '../config/firebase.config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateFirebaseIdToken(idToken: string) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userInfo = await admin.auth().getUser(decodedToken.uid);

      const user = await this.usersService.findOrCreate({
        uid: decodedToken.uid,
        email: decodedToken.email,
        full_name: userInfo.displayName || 'Usuário sem nome',
        profile_picture_url: userInfo.photoURL || null,
        phone_number: userInfo.phoneNumber || null,
      });

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role || 'user',
      };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (err) {
      console.error('❌ Erro ao validar Firebase ID token:', err);
      throw new UnauthorizedException('ID token inválido');
    }
  }
}
