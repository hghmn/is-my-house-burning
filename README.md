# is-my-house-burning
Refer to the Inciweb Cal Fire database to determine if my house is in danger of burning

Run this from the command line with `node main.js -s 100 -lat 37.000 -long -120.000`

It will return a formatted list 

## Parameters

- `-s|--sensitivity` sensitivy: expects an int, the radius from center to check against fires
- `-lat|--latitute` latitude: the decimal latitude for center
- `-long|--longitude` longitude: the decimal longitude for center
