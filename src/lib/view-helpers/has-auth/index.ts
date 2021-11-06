import { Config } from '@lib/config';

export default (config: Config) => {
  return (params?) => {
    const method = params;
    return config.hasAuth(method);
  };
};
