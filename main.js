// ==================================================
// Is My House On Fire
// ==================================================

// get feed from inciweb, and do something with it
var http = require('http'),
  xml2js = require('xml2js'),
  pjson = require('./package.json');

// node-getopt  to scrape command line
var opt = require('node-getopt').create([
  ['t'  , 'threshold=ARG'   , 'threshold distance from center to search. Defaults to 100km.'],
  ['l'  , 'latitude=ARG'    , 'latitude for center of search.' ],
  ['n'  , 'longitude=ARG'   , 'longitude for center of search.' ],
  ['h'  , 'help'            , 'display this help.'],
  ['v'  , 'version'         , 'show version.']
])              // create Getopt instance
.bindHelp()     // bind option 'help' to default action
.parseSystem(); // parse command line

// if prompted for version, print and exit
if( opt.options.version ) {
  console.log( pjson.name + " - version: " + pjson.version );
  process.exit();
}

// otherwise, continue
// The url we want is: 'http://inciweb.nwcg.gov/feeds/rss/incidents/'
var options = {
  host : 'inciweb.nwcg.gov',
  path : '/feeds/rss/incidents/',
  threshold : parseFloat( opt.options.threshold ) || 100, // 100 km
  lat : parseFloat( opt.options.latitude )  || 37.735969, // yosemite valley
  lon : parseFloat( opt.options.longitude ) || -119.601631
};

/* // scrape command line arguments
for ( var i = 0; i < process.argv.length; i+=2 ) {
  if( /(-t|--threshold)/.test( process.argv[ i ] ) && process.argv[ i + 1 ] && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get threshold
    options.threshold = parseFloat( process.argv[ i + 1 ] );
  } else if( /(-lat|--latitute)/.test( process.argv[ i ] ) && process.argv[ i + 1 ] && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get latitute
    options.lat = parseFloat( process.argv[ i + 1 ] );
  } else if( /(-lon|--longitude)/.test( process.argv[ i ] ) && process.argv[ i + 1 ] && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get longitude
    options.lon = parseFloat( process.argv[ i + 1 ] );
  }
} */

// optput greeting
console.log( '----------\n' );
console.log( 'calculating closest fires to you, up to ' + options.threshold + ' km away.' );
console.log( 'lat: ' + options.lat + ' lon: ' + options.lon );

// ==================================================
// Lat Long Functions
// ==================================================
/**
 * Converts numeric degrees to radians
 * http://www.movable-type.co.uk/scripts/latlong.html
 */
if (typeof(Number.prototype.toRadians) === "undefined") {
  Number.prototype.toRadians = function() {
    return this * Math.PI / 180;
  };
}

/** 
 * Calculates distance between two points on the earth's surface
 * http://www.movable-type.co.uk/scripts/latlong.html
 */
function calcDistance( lat1, lon1, lat2, lon2 ){
  var R = 6371000; // metres
  var φ1 = lat1.toRadians();
  var φ2 = lat2.toRadians();
  var Δφ = (lat2-lat1).toRadians();
  var Δλ = (lon2-lon1).toRadians();

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d / 1000; // output km
}


// ==================================================
// XML Parser
// ==================================================
var parser = new xml2js.Parser();
parser.addListener('end', function(result) {
  var json = result;
  var fires = json.rss.channel[0].item;
  var pubDate = json.rss.channel[0].pubDate[0];

  // print published date - with localized date formatting
  // compare that to the time that we checked for update
  console.log( 'published date: ' + ( new Date( pubDate ) ) );
  console.log( 'last checked  : ' + ( new Date() ) + '\n' );
  
  for ( var i=0, j=0; i < fires.length; i++ ) {
    var lat = parseFloat( fires[i]["geo:lat"][0] ),
      lon = parseFloat( fires[i]["geo:long"][0] );

    if( lat && lon ) {
      var distance = calcDistance( lat, lon, options.lat, options.lon ),
        size = fires[i].description ? fires[i].description[0].match( /([\d,]+ acres)/ ) : false,
        direction = ( options.lat - lat > 0 ? 's' : 'n' ) + ( options.lon - lon > 0 ? 'w' : 'e' );

        // 
        j++;

      if( distance < options.threshold ) {
        var output = '----------\n' + fires[i].title[0] + '\n' +
          'distance  : ' + distance.toPrecision(5)  + 'km ('+ ( distance * 0.621371 ).toPrecision(5) +' miles)' +
          'direction : ' + direction +
          'fire size : ' + ( size ? size[1] : 'no info' ) +
          'info link : ' + fires[i].link[0] + '\n' +
          fires[i].description[0] + '\n';

        console.log( output );
      }
    }
  }

  // 
  console.log( '----------\n' + j + ' fires checked out of ' + i + ' total\n----------' );
});

// ==================================================
// HTTP GET
// ==================================================

function printConnectionError () {
  console.log( '----------\nerror connecting to feed at ' + options.host + ' \n----------' );
  process.exit();
}

callback = function(response) {
  var str = '';

  response.on('error', function(exception){
    printConnectionError();
  });

  if ( response.statusCode > '400' ){
    printConnectionError();
  }

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    parser.parseString( str );
  });
};

http.request(options, callback)
.on('error', printConnectionError )
.end();

// ==================================================
// END
// ==================================================