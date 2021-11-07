#!/usr/bin/env node

/*
 * Jingo, wiki engine
 * http://github.com/claudioc/jingo-2
 *
 * Copyright 2013-2021 Claudio Cicali <claudio.cicali@gmail.com>
 * Released under the MIT license
 */

import * as moduleAlias from 'module-alias';

// Defines module aliases here instead of package.json.
// This list must be kept in sync with the same list in tsconfig.json
moduleAlias.addAliases({
  '@lib': __dirname + '/lib',
  '@events': __dirname + '/events',
  '@sdk': __dirname + '/sdk',
  '@api': __dirname + '/api',
  '@routes': __dirname + '/routes',
  '@middlewares': __dirname + '/middlewares'
});

const pkg = require('./package');

const DEFAULT_HTTP_PORT = 6767;
import * as program from 'commander';
import * as fs from 'fs';
import config from '@lib/config';
import Server from './server';
import * as http from 'http';

let httpServer;
let httpPort;

main();

async function main() {
  await parseCommandLine();
  await loadConfig();
  setupServer();
}

function setupServer() {
  httpPort = normalizePort(process.env.PORT || DEFAULT_HTTP_PORT);
  const app = Server.bootstrap(config).app;
  app.set('port', httpPort);
  httpServer = http.createServer(app);
  httpServer.listen(httpPort);
  httpServer.on('error', onError);
  httpServer.on('listening', onListening);
}

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return DEFAULT_HTTP_PORT;
}

/**
 * Event listener for HTTP server 'error' event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof httpPort === 'string' ? `Pipe ${httpPort}` : `Port ${httpPort}`;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;

    default:
      throw error;
  }
}

function onListening() {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  const hasIpc = config.hasFeature('ipcSupport');
  console.log(`🏁 Listening on ${bind} ${hasIpc ? '(with IPC)' : ''}`);
}

async function parseCommandLine() {
  program
    .version(pkg.version)
    .option('-c, --config <path>', 'Specify the config file')
    .option('-s, --sample-config', 'Dumps a config file template and exits')
    .parse(process.argv);

  if (program.sampleConfig) {
    console.log(await config.sample());
    process.exit(0);
  }

  if (!program.config) {
    program.help();
  }

  if (!fs.existsSync(program.config)) {
    console.error(`The specified config file doesn't exist: ${program.config}`);
    process.exit(-1);
  }

  if (!program.config || !fs.existsSync(program.config)) {
    program.help();
  }
}

async function loadConfig() {
  try {
    await config.load(program.config);
  } catch (err) {
    console.log(err);
    console.error(
      `There was an error reading your config file and Jingo cannot continue:\n${program.config}: ${err}`
    );
    process.exit(-1);
  }
}
