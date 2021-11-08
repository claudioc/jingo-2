type HttpMethod = 'get' | 'post';
type HttpResponse<T> = {
  statusCode: number;
  data: T | null;
  error: boolean;
  message?: any;
};

export const http: <T>(
  method: HttpMethod,
  url: string,
  options?: any
) => Promise<HttpResponse<T>> = async (method, url, options) => {
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
    data: null
  };
};
