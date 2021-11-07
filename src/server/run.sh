#!/bin/bash

echo "First of a all, a fresh compilation…"
npx tsc

echo "Now copying files in the right place…"
ln -sf $(pwd)/views dist/
ln -sf $(pwd)/public dist/
cp lib/config/defaults.json dist/lib/config
cp package.json dist
npx cpy '**/*.hbs' 'dist/'  --parents

echo "Watching changes in TS files."
NODE_ENV=development npx tsc-watch --noClear --outDir ./dist --onSuccess 'node dist/index -c config.json'
