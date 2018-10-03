import { Config } from '@lib/config';

type TCustomThing = 'title' | 'logo' | 'favicon' | 'scripts' | 'content' | 'styles' | 'head';

import makeContent from './content';
import makeFavicon from './favicon';
import makeHead from './head';
import makeLogo from './logo';
import makeScripts from './scripts';
import makeStyles from './styles';
import makeTitle from './title';

export default (config: Config) => {
  const helpers = {
    content: makeContent(config),
    favicon: makeFavicon(config),
    head: makeHead(config),
    logo: makeLogo(config),
    scripts: makeScripts(config),
    styles: makeStyles(config),
    title: makeTitle(config)
  } as { [name in TCustomThing]: () => string };

  return (params: TCustomThing): string => helpers[params]();
};
