'use strict';

class HttpConfig {}
HttpConfig.UNAUTHORIZED = { statusCode: 401, message: '사용자 인증에 실패했습니다'};
HttpConfig.FORBIDDEN = { statusCode: 403, message: '  허용되지 않은 요청입니다'};
HttpConfig.NOT_FOUND = { statusCode: 404, message: '알 수 없는 경로입니다'};
HttpConfig.FILE_NOT_FOUND = { statusCode: 404, message: '알 수 없는 파일입니다'};

module.exports = HttpConfig;
