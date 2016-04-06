var fs = require('fs');
var _ = require('lodash');
var id3 = require('id3js');
var jsmediatags = require("jsmediatags");

var files = fs.readdirSync('./mp3');
console.log(files);

_.forEach(files, function(file){
    if(/2015/.test(file)) {
        jsmediatags.read("./mp3/" + file, {
          onSuccess: function(tag) {
            console.log(tag);
          },
          onError: function(error) {
            console.log(':(', error.type, error.info);
          }
        });    
    }
    
});