#!/usr/bin/env node
var fs = require ('fs'); 

const app = require ('./libs/framework/');
const options = {};

options.ip = '0.0.0.0';
//options.port = parseInt(process.argv[2]);
options.port = process.env.PORT;

app.http('release',options);
