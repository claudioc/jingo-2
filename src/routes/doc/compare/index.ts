import { RouteEntry, RouteHandler } from '@routes/route';
import DocRoute from '..';

export const get: RouteEntry = (route: DocRoute) => {
  return (req, res, next) => {
    return compare.apply(route, [req, res, next]);
  };
};

const compare: RouteHandler = async function(this: DocRoute, req, res, next) {
  const { hash, docName, into } = req.query;

  const diffs = await this.git.$diff(docName, into, hash[0], hash[1]);

  const lines = [];
  diffs.slice(4).forEach(line => {
    if (line.slice(0, 1) !== '\\') {
      lines.push({
        className: lineClass(line),
        ldln: leftDiffLineNumber(0, line),
        rdln: rightDiffLineNumber(0, line),
        text: line
      });
    }
  });

  const docTitle = this.wikiHelpers.unwikify(docName);

  const scope: object = {
    docName,
    docTitle,
    hash,
    into,
    lines
  };

  this.renderTemplate(res, __dirname, scope);
};

let ldln = 0;
let rdln = 0;
let cdln;

function leftDiffLineNumber(id, line) {
  let li;

  switch (true) {
    case line.slice(0, 2) === '@@':
      li = line.match(/\-(\d+)/)[1];
      ldln = parseInt(li, 10);
      cdln = ldln;
      return '...';

    case line.slice(0, 1) === '+':
      return '';

    case line.slice(0, 1) === '-':
    default:
      ldln++;
      cdln = ldln - 1;
      return cdln;
  }
}

function rightDiffLineNumber(id, line) {
  let ri;

  switch (true) {
    case line.slice(0, 2) === '@@':
      ri = line.match(/\+(\d+)/)[1];
      rdln = parseInt(ri, 10);
      cdln = rdln;
      return '...';

    case line.slice(0, 1) === '-':
      return ' ';

    case line.slice(0, 1) === '+':
    default:
      rdln += 1;
      cdln = rdln - 1;
      return cdln;
  }
}

function lineClass(line) {
  if (line.slice(0, 2) === '@@') {
    return 'gc';
  }
  if (line.slice(0, 1) === '-') {
    return 'gd';
  }
  if (line.slice(0, 1) === '+') {
    return 'gi';
  }
}
