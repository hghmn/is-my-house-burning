import scraperFactory from '../lib/scraper-factory';
/* tslint:disable:no-var-requires */
// const parseString = require('xml2js').parseString;
const parse = require('xml-parser');
/* tslint:enable:no-var-requires */

// Info for the scraper - keep these up here
const title = 'Inciweb';
const description = 'Scraper for Inciweb: http://inciweb.nwcg.gov/';

function getFrom(obj: any, needles: Array<string>) {
    let result = {};

    needles.forEach(key => {
        let value = 'No attribute \'' + key + '\' Found';
        let len = obj.len || Object.keys(obj).length;

        for (let i = 0; i < len; i++) {
            if (obj[i].name === key) {
                value = obj[i].content || value;
                break;
            }
        }

        result[key] = value;
    });

    return result;
}

function inciwebXMLParser(xml) {
    return Promise.resolve(parse(xml))
        .then(result => result.root.children[0].children)
        .then(result => {
            // flatten out the items
            let items = result.filter(child => child.name && child.name === 'item')
                .map(item => {
                    let tmp = {};
                    item.children.forEach(child => tmp[child.name] = child.content);
                    return tmp;
                });

            // flatten just the props
            let props: any = getFrom(result, ['title', 'link', 'description', 'pubDate']);

            props.items = items;
            return props;
        });
}

export = {
    title,
    description,
    scraper: scraperFactory({
        type: 'rss',
        url: 'http://inciweb.nwcg.gov/feeds/rss/incidents/',
        parser: inciwebXMLParser,
    }),
};
