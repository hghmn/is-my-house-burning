// ==================================================
// Is My House On Fire
// ==================================================

// get feed from inciweb, and do something with it
var http = require('http'),
  xml2js = require('xml2js');

// The url we want is: 'http://inciweb.nwcg.gov/feeds/rss/incidents/'
var options = {
  host : 'inciweb.nwcg.gov',
  path : '/feeds/rss/incidents/',
  threshold : 100, // 100 km
  lat : 37.735969, // yosemite valley
  lon : -119.601631
};

// scrape command line arguments
for ( var i = 0; i < process.argv.length; i+=2 ) {
  if( /(-t|--threshold)/.test( process.argv[ i ] ) && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get threshold
    options.threshold = parseFloat( process.argv[ i + 1 ] );
  } else if( /(-lat|--latitute)/.test( process.argv[ i ] ) && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get latitute
    options.lat = parseFloat( process.argv[ i + 1 ] );
  } else if( /(-lon|--longitude)/.test( process.argv[ i ] ) && "NaN" !== parseFloat( process.argv[ i + 1 ] ) ) {
    // get longitude
    options.lon = parseFloat( process.argv[ i + 1 ] );
  }
}

// optput greeting
console.log( '---------\n' );
console.log( 'calculating closest fires from you, up to ' + options.threshold + ' km away.');
console.log( 'lat: ' + options.lat + ' lon: ' + options.lon + '\n');
// console.log( '---------\n' );

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
  
  for ( var i = 0; i < fires.length; i++ ) {
    var lat = parseFloat( fires[i]["geo:lat"][0] ),
      lon = parseFloat( fires[i]["geo:long"][0] );

    if( lat && lon ) {
      var distance = calcDistance( lat, lon, options.lat, options.lon );

      if( distance < options.threshold ) {

        console.log( '---------\n' + fires[i].title[0] + '\n' );
        console.log( 'distance: ' + distance.toPrecision(5)  + 'km ('+ ( distance * 0.621371 ).toPrecision(5) +' miles)\n' );
        console.log( 'link: ' + fires[i].link[0] + '\n');
        console.log( 'description: ' + fires[i].description[0] + '\n');
      }
    }
  }

});

// ==================================================
// HTTP GET
// ==================================================
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

http.request(options, callback).end();

// ==================================================
// END
// ==================================================
