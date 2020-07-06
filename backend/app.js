'use strict';

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { logger, expressLogger } = require('./configs/logger-config');
const PassportConfig = require('./configs/passport-config');
const HttpConfig = require('./configs/http-config');

const indexRouter = require('./routes/index-router');
const usersRouter = require('./routes/user-router');
const appsRouter = require('./routes/apps-router');

const app = express();

// 미들웨어 등록
app.use(expressLogger());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
PassportConfig.initPassport();
app.use(PassportConfig.authenticateJWT);

// 라우터 등록
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/apps', appsRouter);

// 라우터에 없는 경로는 404(Not Found)처리
app.use((req, res, next) => {
  next(createError(HttpConfig.NOT_FOUND.statusCode, HttpConfig.NOT_FOUND.message));
});

// 에러 핸들러
app.use((err, req, res, next) => {
  if (err.status === undefined || err.status >= 500) logger.error(err.message);
  res.status(err.status || 500).send({"statusCode": err.status || 500, "message": err.message});
});

module.exports = app;
