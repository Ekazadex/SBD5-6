class BaseResponse {
    static success(message, payload) {
      return {
        succes: true,
        message: message,
        payload: payload
      };
    }
  
    static error(message, payload = null) {
      return {
        succes: false,
        message: message,
        payload: payload
      };
    }   
  }
  
  module.exports = BaseResponse;