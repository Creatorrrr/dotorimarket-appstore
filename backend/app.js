"use strict";

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const { logger, expressLogger } = require("./configs/logger-config");
const PassportConfig = require("./configs/passport-config");
const HttpConfig = require("./configs/http-config");
const FileConfig = require("./configs/file-config");

const applicationRouter = require("./routes/application-router");
const userRouter = require("./routes/user-router");
const accountRouter = require("./routes/account-router");
const appRouter = require("./routes/app-router");
const dealRouter = require("./routes/deal-router");
const noticeRouter = require("./routes/notice-router");
const categoryRouter = require("./routes/category-router");
const chatRouter = require("./routes/chat-router");
const wordRouter = require("./routes/word-router");
const faqRouter = require("./routes/faq-router");
const favoritesRouter = require("./routes/favorite-router");

const bodyParser = require("body-parser");

const getApplicationModel = require("./models/application");

const app = express();

// 이미지 디렉토리 생성
const uploadDir = "upload";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 미들웨어 등록
app.use(expressLogger());
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    limit: "20mb",
  })
);
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/upload", express.static(path.join(__dirname, FileConfig.FILE_PATH)));

//app.use(fileUpload());
app.use(passport.initialize());
PassportConfig.initPassport();
app.use(PassportConfig.authenticateJWT);

// 버전을 확인하여 현재 버전보다 아래면 업데이트 요청 반환
app.use("/api", async (req, res, next) => {
  try {
    // 앱 버전 조회
    const Application = await getApplicationModel();
    const application = await Application.findOne({
      applicationId: 1,
    });

    const serverVersion = application.version;
    const appVersion = req.headers["app-version"];

    if (appVersion) {
      const serverVersionSplited = serverVersion.split(".");
      const appVersionSplited = appVersion.split(".");
      serverVersionSplited.forEach((version, index) => {
        const parsed = parseInt(version);
        serverVersionSplited.splice(index, 1, parsed);
      });
      appVersionSplited.forEach((version, index) => {
        const parsed = parseInt(version);
        appVersionSplited.splice(index, 1, parsed);
      });

      // 버전의 비교하여 서버 버전이 앱 버전보다 높으면 업데이트 요청
      if (
        serverVersionSplited[0] > appVersionSplited[0] ||
        (serverVersionSplited[0] == appVersionSplited[0] &&
          serverVersionSplited[1] > appVersionSplited[1]) ||
        (serverVersionSplited[0] == appVersionSplited[0] &&
          serverVersionSplited[1] == appVersionSplited[1] &&
          serverVersionSplited[2] > appVersionSplited[2])
      ) {
        res.statusCode = HttpConfig.UPGRADE_REQUIRED.statusCode;
        res.json({
          statusCode: HttpConfig.UPGRADE_REQUIRED.statusCode,
          message: HttpConfig.UPGRADE_REQUIRED.message,
        });
      } else {
        next();
      }
    } else {
      throw createError(
        HttpConfig.BAD_REQUEST.statusCode,
        `${HttpConfig.BAD_REQUEST.message} (서버 버전: ${serverVersion} 앱 버전: ${appVersion})`
      );
    }
  } catch (err) {
    next(err);
  }
});

// 라우터 등록
app.use("/system/", applicationRouter);
app.use("/download/", appRouter);
app.use(
  "/api/mobile",
  userRouter,
  accountRouter,
  dealRouter,
  noticeRouter,
  categoryRouter,
  chatRouter,
  wordRouter,
  faqRouter,
  favoritesRouter
);

// 라우터에 없는 경로는 404(Not Found)처리
app.use((req, res, next) => {
  next(
    createError(HttpConfig.NOT_FOUND.statusCode, HttpConfig.NOT_FOUND.message)
  );
});

// 에러 핸들러
app.use((err, req, res, next) => {
  if (err.status === undefined || err.status >= 500) logger.error(err.message);
  res
    .status(err.status || 500)
    .send({ statusCode: err.status || 500, message: err.message });
});

module.exports = app;
