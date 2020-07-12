'use strict';

const createError = require('http-errors');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const HttpConfig = require('../configs/http-config');

class PassportConfig {
  /**
   * passport 초기화
   */
  static initPassport() {
    // 토큰, 세션에 저장할 사용자 정보 설정
    passport.serializeUser((user, done) => {
      done(null, user)
    });
    // 사용자 정보 원형 불러오기
    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    passport.use(PassportConfig.createJWTStrategy());
  }

  /**
   * 토큰 인증 전략 (JWT Strategy)
   */
  static createJWTStrategy() {
    return new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: PassportConfig.JWT_SECRET,
      }, (jwtPayload, done) => {
        return done(null, {
          userId: jwtPayload.userId,
          password: jwtPayload.password,
        })
      }
    );
  }

  /**
   * JWT 토큰 인증 처리
   */
  static authenticateJWT(req, res, next) {
    // if (!PassportConfig.IGNORE_PATHS.includes(req.path)) {
    //   passport.authenticate('jwt', { session: false }, (err, user, info) => {
    //     if (err) next(err); 
    //     else if (!user) next(createError(HttpConfig.UNAUTHORIZED.statusCode, HttpConfig.UNAUTHORIZED.message));
    //     else next();
    //   })(req, res, next);
    // } else {
      next();
    // }
  }
}
PassportConfig.JWT_SECRET = process.env.JWT_SECRET; // ***** DB를 통해 처리하도록 개선
PassportConfig.IGNORE_PATHS = [                     // ***** ANT 패턴으로 매칭하도록 개선
  '/api/users',
  '/api/apps/dotori-android.apk',
  '/api/apps/dotori-ios.plist',
  '/api/apps/dotori-ios.ipa',
];

// JWT_SECRET이 초기화 안 되어 있을 경우 에러 발생
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not initialized');
}

module.exports = PassportConfig;
