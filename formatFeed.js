var fs = require('fs');
var url = require('url');
var path = require('path');

var _ = require('lodash');
var Podcast = require('podcast');
var md5 = require('md5');
var shell = require('shelljs');

shell.exec("ls feeds || mkdir feeds");


var records = require('./records.json');


String.prototype.capitalize = function(){
    return this.toLowerCase().replace( /\b\w/g, function (m) {
        return m.toUpperCase();
    });
};

/* sort please */

records.records.sort(function(a, b) {
    // Normal sort between years
    if(a.url < b.url) return -1;
    if(a.url > b.url) return 1;
    return 0;
});

var years = {};

_.forEach(records.records, function(record){
    if(!years[record.year]) {
        years[record.year] = {
            year: record.year,
            records: []
        };
    }

    years[record.year].records.push(record);
});

_.forEach(years, function(year){
    var feed = new Podcast({
        title: "LDS Conference Talks - " + year.year,
        description: "A list of LDS Conference Talks, I do not own these talks, I'm just providing an easy feed to them",
        feed_url: "http://www.justincarmony.com/misc/ldsgc/" + year.year + ".xml",
        site_url: "http://www.lds.org/",
        author: "The Church of Jesus Christ of Latter-day Saints",
        copyright: year.year + " by Intellectual Reserve, Inc. All rights reserved."
    });

    _.forEach(year.records, function(record){
        var urlString = record.url;

        if(urlString.indexOf('?') >= 0) {
            var parts = urlString.split('?');
            urlString = parts[0];
        }

        var parsed = url.parse(urlString);
        var fileName = path.basename(parsed.pathname);
        var parts = fileName.split('-');
        var year = parts[0];
        var month = parts[1];

        parts = urlString.split('/');
        var meeting = parts[5];
        meeting = meeting.replace(/\-/g, " ");
        meeting = meeting.capitalize();

        var title = record.title;
        

        //if(record.year == '2015') {
        feed.item({
            title: title + " | " + meeting,
            description: title,
            url: urlString,
            guid: md5(urlString),
            date: year + "-" + month + "-01",
            enclosure: {
                url: urlString
            }
        });    
        //}
    });

    fs.writeFileSync("./feeds/" + year.year + ".xml", feed.xml());
});




