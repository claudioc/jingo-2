// @TODO find a way to import the Boom types in here
declare namespace Express {
  interface Response {
    boom: {
      badRequest: (message, data?) => {}
      unauthorized: (message, scheme, attributes) => {}
      forbidden: (message, data?) => {}
      notFound: (message, data?) => {}
      methodNotAllowed: (message, data?) => {}
      notAcceptable: (message, data?) => {}
      proxyAuthRequired: (message, data?) => {}
      clientTimeout: (message, data?) => {}
      conflict: (message, data?) => {}
      resourceGone: (message, data?) => {}
      lengthRequired: (message, data?) => {}
      preconditionFailed: (message, data?) => {}
      entityTooLarge: (message, data?) => {}
      uriTooLong: (message, data?) => {}
      unsupportedMediaType: (message, data?) => {}
      rangeNotSatisfiable: (message, data?) => {}
      expectationFailed: (message, data?) => {}
      badData: (message, data?) => {}
      locked: (message, data?) => {}
      preconditionRequired: (message, data?) => {}
      tooManyRequests: (message, data?) => {}
      illegal: (message, data?) => {}
      badImplementation: (message, data?) => {}
      notImplemented: (message, data?) => {}
      badGateway: (message, data?) => {}
      serverUnavailable: (message, data?) => {}
      gatewayTimeout: (message, data?) => {}
    }
  }
}



