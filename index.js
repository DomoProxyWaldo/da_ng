#!/usr/bin/env node

require = require('esm')(module);
const { cli } = require('./src/cli');
cli(process.argv);
