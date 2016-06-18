import loadScrapers from './load-scrapers';
import * as fs from 'fs';
import * as path from 'path';

import { options } from './cli';
import { Distance } from './lib/calc';

const LINE = '--------------------';

function scrape(sources) {
    console.log('Scraping:');

    let promised = sources.map(source =>
        source.scraper()
            .then(data => {
                console.log(source.title);

                data.__generated = (new Date()).toISOString();

                // else write out the result
                // fs.writeFileSync(
                //     path.join('./data', `${ source.title.replace(/\s/g, '_') }_${ +(new Date()) }.json`),
                //     JSON.stringify(data, null, 4)
                // );

                return Promise.resolve(data);
            }));

    return Promise.all(promised);
}

function filter(results) {
    // console.log('Filtering\n' + LINE);

    let filtered = results.map(result => {
        result.hasGeo = 0;
        result.noGeo = 0;

        result.items = result.items.filter(item => {
            if (item['geo:lat'] && item['geo:long']) {
                result.hasGeo++;
                item.distance = Distance(options.lat, options.long, item['geo:lat'], item['geo:long']);
                return options.radius >= item.distance;
            } else {
                result.noGeo++;
            }

        });

        return result;
    });

    return Promise.resolve(filtered);
}

function log(results) {
    console.log(LINE);
    console.log('Results');

    results.forEach(result => {
        console.log([
            '--------------------',
            result.title,
            result.description,
            'hasGeo: ' + result.hasGeo,
            'noGeo: ' + result.noGeo,
            '--------------------\n',
        ].join('\n'));

        result.items.forEach(item => {
            console.log([
                '',
                item.title,
                // item.description,
                item.distance,
            ].join('\n  '));
        });
    });
}

// Go Time
// --------------------------------------------------
console.log('Checking Fire Incidents');
console.log((new Date()).toLocaleString());
console.log(LINE);

loadScrapers()
    .then(scrape)
    .then(filter)
    .then(log)
    .catch(errors => console.log(errors));
