import fs = require('fs');
import path = require('path');
import * as Joi from 'joi';

const scraperSchema = Joi.object().keys({
    title: Joi.string(),
    description: Joi.string(),
    scraper: Joi.func(),
});

const SCRAPER_ROOT = path.join(__dirname, 'scrapers');

export default function loadScrapers() {
    let promise = new Promise((resolve, reject) => {
        // Load the scraping sources
        fs.readdir(SCRAPER_ROOT, (err, data: Array<string>) => {
            if (err) {
                return reject(err);
            }

            resolve(data);
        });
    }).then((data: Array<string>) => {
        let scrapers: Array<Promise<any>> = data.map(filename => {
            return new Promise((resolve, reject) => {
                let imported = require(path.join(SCRAPER_ROOT, filename));

                Joi.validate(imported, scraperSchema, function(error, value) {
                    if (error) {
                        return reject({
                            filename,
                            error,
                        });
                    }

                    resolve(imported);
                });
            });
        });

        return Promise.all(scrapers);
    });

    return promise;
}
