# Path to 0.2
* Move to Typescript
* Make scrapers modular & consistent
* Add more sources
* ...

# is-my-house-burning
Refer to the Inciweb Cal Fire database to determine if my house is in danger of burning

Ex: Run this from the command line with `node main.js -t 100 -lat 37.735969 -lon -119.601631` to find all fires within 100 km of Yosemite.

This will currently output a formatted list of all fires within the threshold distance from the lat and lon specified to `console.log`

## Parameters

- `-t|--threshold` threshold: the radius from center to check against fires
- `-lat|--latitute` latitude: the decimal latitude for center
- `-lon|--longitude` longitude: the decimal longitude for center

## Current Output

- Fire title
- distance from center (lat & long given)
- direction from center
- fire size (if available)
- inciweb link for more info
- description
- stats on # of fires script was unable to check because of missing lat & git addlong