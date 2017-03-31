#!/usr/bin/env node
var fs = require ('fs'); 

const app = require ('./libs/framework/');

//const options = {};
//app.http('release', options);

app.http('release');