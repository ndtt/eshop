#!/usr/bin/env node
var fs = require ('fs'); 

const app = require ('./libs/framework/');
const options = {};

options.ip = '50.16.238.111';
//const options = {};
//app.http('release', options);

app.http('release',options);
