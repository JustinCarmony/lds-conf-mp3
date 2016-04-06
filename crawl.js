var Crawler = require("crawler");
var url = require('url');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var shell = require('shelljs');

shell.exec("ls mp3 || mkdir mp3");

var desiredPatterns = [
    /^\/general-conference\/[0-9]{4}\/[0-9]{2}/
];

var downloaded = [];
var records = [];

var urlsToCrawl = [];

var c = new Crawler({
    maxConnections : 20,
    // This will be called for each crawled page
    callback : function (error, result, $) {
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        $('a').each(function(index, a) {
            var foundUrl = $(a).attr('href');
            
            _.forEach(desiredPatterns, function(pattern){
                if(pattern.test(foundUrl)) {
                    //console.log(foundUrl);
                    if(urlsToCrawl.indexOf(foundUrl) < 0) {
                        urlsToCrawl.push(foundUrl);

                        setTimeout(function(){
                            c.queue('https://www.lds.org' + foundUrl);
                        }, 0);    
                    }
                }
            });
            
            // Lets see if we want to download it
            if (/\.mp3/.test(foundUrl)) {
                var parsed = url.parse(foundUrl);
                var fileName = path.basename(parsed.pathname);
                var parts = fileName.split('-');
                var year = parts[0];
                var month = (parseInt(parts[1]) <= 4) ? "April" : "October";
                var dataId = parseInt(parts[2]);

                console.log(dataId);

                if(downloaded.indexOf(fileName) < 0 && dataId % 1000 != 0) {
                    downloaded.push(fileName);
                    //urls.push(foundUrl);

                    var record = {
                        url: foundUrl,
                        author: $('meta[name=author]').attr('content'),
                        title: $('title').html(),
                        year: year,
                        month: month
                    };

                    records.push(record);

                    /*
                    setTimeout(function(){
                        shell.exec("cd mp3; wget -O " + fileName + " " + foundUrl, { silent: true }, function(){
                            console.log("downloaded: " + foundUrl);
                        });
                    }, 0);
                    */
                }
            }
        });


    },

    onDrain: function() {
        fs.writeFileSync("./records.json", JSON.stringify({ records: records }, null, 4));
    }
});

// Queue just one URL, with default callback
urlsToCrawl.push('https://www.lds.org/general-conference/conferences?lang=eng');
c.queue('https://www.lds.org/general-conference/conferences?lang=eng');
