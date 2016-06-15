import loadScrapers from './load-scrapers';
import * as fs from 'fs';
import * as path from 'path';

function scrape(sources) {
    sources.forEach(source => {
        source.scraper().then(data => {
            console.log('--------------------\n' + source.title);
            console.log(source.description + '\n--------------------\n');

            data.__generated = (new Date()).toISOString();

            // else write out the result
            fs.writeFileSync(
                path.join('./data', `${ source.title.replace(/\s/g, '_') }_${ +(new Date()) }.json`),
                JSON.stringify(data, null, 4)
            );
        }).catch(e => console.error(e));
    });
}

loadScrapers()
    .then(scrape)
    .catch(errors => console.log(errors));
