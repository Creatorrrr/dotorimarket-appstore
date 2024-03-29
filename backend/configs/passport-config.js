"use strict";

const createError = require("http-errors");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const HttpConfig = require("../configs/http-config");
const getAccountModel = require("../models/account");

class PassportConfig {
  /**
   * passport 초기화
   */
  static initPassport() {
    // 토큰, 세션에 저장할 사용자 정보 설정
    passport.serializeUser((user, done) => {
      done(null, user);
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
    return new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: PassportConfig.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const Account = await getAccountModel();
          const account = await Account.findOne({
            _id: jwtPayload.id,
          });
          if (account) {
            return done(null, {
              id: account._id,
              accountId: account.accountId,
              name: account.name,
              email: account.email,
            });
          } else {
            throw createError(
              HttpConfig.UNAUTHORIZED.statusCode,
              HttpConfig.UNAUTHORIZED.message
            );
          }
        } catch (err) {
          done(err);
        }
      }
    );
  }

  /**
   * JWT 토큰 인증 처리
   */
  static authenticateJWT(req, res, next) {
    let matched = PassportConfig.IGNORE_PATHS.find(
      (ignorePath) =>
        req.path.match(ignorePath.pattern) &&
        (req.method == ignorePath.method || !ignorePath.method)
    );

    if (matched) {
      next();
    } else {
      passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) next(err);
        else if (!user)
          next(
            createError(
              HttpConfig.UNAUTHORIZED.statusCode,
              HttpConfig.UNAUTHORIZED.message
            )
          );
        else {
          req.user = user;
          next();
        }
      })(req, res, next);
    }
  }
}
PassportConfig.JWT_SECRET = process.env.JWT_SECRET; // ***** DB를 통해 처리하도록 개선
PassportConfig.IGNORE_PATHS = [
  // ***** DB를 통해 처리하도록 개선
  {
    pattern: /^\/download\/(.*)$/,
    method: "GET",
  },
  {
    pattern: /^\/api\/mobile\/v[0-9]+\/users$/,
    method: "POST",
  },
  {
    pattern: /^\/upload\/(.*)$/,
    method: "GET",
  },
  {
    pattern: /^\/api\/mobile\/v[0-9]+\/accounts$/,
    method: "POST",
  },
  {
    pattern: /^\/api\/mobile\/v[0-9]+\/words\/random$/,
    method: "GET",
  },
];

// JWT_SECRET이 초기화 안 되어 있을 경우 에러 발생
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not initialized");
}

module.exports = PassportConfig;
