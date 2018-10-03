import { Config } from '@lib/config';

let makeHelper;

export default (makeHelper = (config: Config) => {
  return (params?) => {
    const method = params;
    return config.hasAuth(method);
  };
});
