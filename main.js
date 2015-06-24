// load dependencies
var http = require('http'),
  xml2js = require('xml2js');
  
//The url we want is: 'http://inciweb.nwcg.gov/feeds/rss/incidents/'
var options = {
  host: 'inciweb.nwcg.gov',
  path: '/feeds/rss/incidents/'
};

// set my rough geographical location
var myGeo = {
  lat: 38.000,
  long: -120.000
};

// set the sensitivity to look for
var sensitivity = process.argv[2] || 100;

// init xml2js, and prepare it to handle data from inciweb
var parser = new xml2js.Parser();
parser.addListener('end', function(result) {
  var json = result;
  var fires = json.rss.channel[0].item;
  
  for (var i = fires.length - 1; i >= 0; i--) {
    var lat = parseFloat( fires[i]["geo:lat"][0] ),
      long = parseFloat( fires[i]["geo:long"][0] );

    if( lat && long ) {
      // some entries don't have geo coordinates. please don't burn my house
      if( Math.abs( myGeo.lat - lat ) < ( 0.1 * sensitivity ) &&  Math.abs( myGeo.long - long ) < ( 0.2 * sensitivity) ){

        console.log( '---------\n' + fires[i].title[0] + '\n' );
        console.log( 'distance: ' + Math.abs( myGeo.lat - lat ) + ', ' + Math.abs( myGeo.long - long ) + '\n' );
        console.log( 'link: ' + fires[i].link[0] + '\n');
        console.log( 'description: ' + fires[i].description[0] + '\n');
      }
    }
  }

});

// callback for http
callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    parser.parseString( str );
  });
};

// make the request
http.request(options, callback).end();
