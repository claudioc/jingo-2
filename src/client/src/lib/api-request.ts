type HttpMethod = 'get' | 'post';

type ApiError = {
  message: string;
};

type ApiResponse<T> = {
  statusCode: number;
  data: T & ApiError;
  error: boolean;
};

export const apiRequest: <T>(
  method: HttpMethod,
  url: string,
  options?: any
) => Promise<ApiResponse<T>> = async (method, url, options) => {
  const { headers, data, ...rest } = options || {};
  const reqHeaders = headers || {};
  if (!reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
    reqHeaders['Accept'] = 'application/json';
  }

  const requestConfig = {
    method,
    body: JSON.stringify(data),
    headers: reqHeaders,
    ...rest
  };

  const response = await fetch(url, requestConfig);
  const { ok, status } = response;

  let body;
  if (reqHeaders['Content-Type'] === 'application/json') {
    body = await response.json();
  }

  if (!body) {
    throw new Error('Unrecognized or unspecified content type for the request');
  }

  if (ok) {
    return {
      error: false,
      statusCode: status,
      data: body
    };
  }

  return {
    error: true,
    statusCode: status,
    data: body
  };
};
