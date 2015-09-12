// quick n dirty scraper for 
// http://cdfdata.fire.ca.gov/incidents/incidents_current

// no feed available, and details are located on incident feed page #s

var fires = document.querySelectorAll(".incident_table tbody");

var parsed = [];


for (var i = 0; i < fires.length; i++ ) {
	var tmp = {};
  
	if( fires[i].querySelector("input") ) {
		// skip the first, because this is a search bar? 
		continue;
	}

	var header = fires[i].querySelector(".header_td");

	if (header.children.length) {
		// get the first line of text for a fire
		tmp["_name"] = header.children[0].childNodes[0];

		// a link to more info on the fire, including the fire id #
		tmp["_id"] = header.children[0].childNodes[1];	
	} else {
		tmp["_name"] = header.textContent;
	}
	
	for (var j=2; j < fires[i].children.length; j++) {
		// each row has 2 cells, use them for key/value
		var row = fires[i].querySelector(":nth-child("+j+")");
		var key = row.children[0].textContent.replace(":","");
		var value = row.children[1].textContent;

		tmp[key] = value;
	}
	
	parsed.push( tmp );
}

// check our work
console.log( parsed );
