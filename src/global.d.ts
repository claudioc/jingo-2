declare namespace Express {
  interface Boom {
    // Add boom's properties in here
    wrap: (error: Error, statusCode?: number, message?: string) => BoomError;
    create: (statusCode: number, message?: string, data?: any) => BoomError;

    // 4xx
    badRequest: (message?: string, data?: any) => BoomError;
    unauthorized: (message?: string, scheme?: any, attributes?: any) => BoomError;
    forbidden: (message?: string, data?: any) => BoomError;
    notFound: (message?: string, data?: any) => BoomError;
    methodNotAllowed: (message?: string, data?: any) => BoomError;
    notAcceptable: (message?: string, data?: any) => BoomError;
    proxyAuthRequired: (message?: string, data?: any) => BoomError;
    clientTimeout: (message?: string, data?: any) => BoomError;
    conflict: (message?: string, data?: any) => BoomError;
    resourceGone: (message?: string, data?: any) => BoomError;
    lengthRequired: (message?: string, data?: any) => BoomError;
    preconditionFailed: (message?: string, data?: any) => BoomError;
    entityTooLarge: (message?: string, data?: any) => BoomError;
    uriTooLong: (message?: string, data?: any) => BoomError;
    unsupportedMediaType: (message?: string, data?: any) => BoomError;
    rangeNotSatisfiable: (message?: string, data?: any) => BoomError;
    expectationFailed: (message?: string, data?: any) => BoomError;
    badData: (message?: string, data?: any) => BoomError;
    tooManyRequests: (message?: string, data?: any) => BoomError;

    // 5xx
    notImplemented: (message?: string, data?: any) => BoomError;
    badGateway: (message?: string, data?: any) => BoomError;
    serverTimeout: (message?: string, data?: any) => BoomError;
    gatewayTimeout: (message?: string, data?: any) => BoomError;
    badImplementation: (message?: string, data?: any) => BoomError;
    serverUnavailable: (message, data?) => BoomError;
  }

  export interface BoomError {
    data: any;
    reformat: () => void;
    isBoom: boolean;
    isServer: boolean;
    message: string;
    output: Output;
  }
  export interface Output {
    statusCode: number;
    headers: any;
    payload: any;
  }

  export interface Response {
    boom: Boom
  }
}

declare namespace Express {
  export interface Request {
    flash(event: string, message: any): any;
    flash(event: string): any;
  }
}

interface Flash {
  flash(type: string, message: any): void;
  flash(type: string): any;
}

declare module "express-flash";

declare namespace simplegit {
  export interface SimpleGit {
    add(files: string | string[]): Promise<void>;
  }
}
