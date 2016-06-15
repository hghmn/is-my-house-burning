import * as http from 'http';
import * as url from 'url';

interface IScraperProps {
    method?: string;
    type: string;
    url: string;
    parser: any; // (url: string) => ;
}

// Promise wrapper around the node http request
function request(options: http.RequestOptions, data?: any) {
    return new Promise((resolve, reject) => {
        let body = '';
        let req = http.request(options, (res) => {
            // console.log(`STATUS: ${res.statusCode}`);
            // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                body += chunk;
                // console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                resolve(body);
                // console.log('No more data in response.');
            });
        });

        req.on('error', (e) => {
            reject(e);
            // console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

export default function scraperFactory(opts: IScraperProps) {
    let headers = undefined;

    switch (opts.type) {
        case 'rss':
            headers = { 'Accept': 'text/xml' };
        case 'json':
        default:
            headers = { 'Accept': 'application/json' };
    }

    let urlObject = url.parse(opts.url);
    let options = {
        method: opts.method || 'GET',
        hostname: urlObject.hostname,
        port: +urlObject.port || 80,
        path: urlObject.path,
        headers,
    };

    // Return a scraper, which will in turn fetch the data then parse it
    return () => request(options)
        .then(result => opts.parser(result));
}
