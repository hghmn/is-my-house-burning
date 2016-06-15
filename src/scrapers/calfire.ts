import scraperFactory from '../lib/scraper-factory';
/* tslint:disable:no-var-requires */
const parseString = require('xml2js').parseString;
// const parse = require('xml-parser');
/* tslint:enable:no-var-requires */

// Info for the scraper - keep these up here
const title = 'CDF Incidents';
const description = 'Scraper for Cal Fire incident report: http://cdfdata.fire.ca.gov/incidents/rss.xml';

function calFireXMLParser(xml) {
    const promise = new Promise((resolve, reject) => {
        parseString(xml, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

    return promise.then(result => (result as any).rss.channel[0])
        .then(result => ({
            'atom:link': result['atom:link'][0].$,
            title: result.title[0],
            description: result.description[0],
            link: result.link[0],
            copyright: result.copyright[0],
            items: result.item.map(item => ({
                title: item.title[0],
                description: item.description[0],
                link: item.link[0],
                pubDate: item.pubDate[0],
                'geo:lat': item['geo:lat'] ? item['geo:lat'][0] : null,
                'geo:long': item['geo:long'] ? item['geo:long'][0] : null,
            })),
        }));
}

export = {
    title,
    description,
    scraper: scraperFactory({
        type: 'rss',
        url: 'http://cdfdata.fire.ca.gov/incidents/rss.xml',
        parser: calFireXMLParser,
    }),
};
