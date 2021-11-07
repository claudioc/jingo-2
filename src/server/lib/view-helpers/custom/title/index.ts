import { Config } from '@lib/config';

export default (config: Config) => {
  return () => {
    return config.get('custom.title');
  };
};
