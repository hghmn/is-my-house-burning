// Modules
import * as yargs from 'yargs';

// add what should be coming in from the command line
interface ICommandLineOpts {
    r: number;
    n: string;
    l: string;
}

const argv = yargs
    .usage('Usage: $0 [options]')
    // .command('count', 'Count the lines in a file')
    // .demand(1)
    .example('$0 -r 120', 'Get fire info within 120km of yosemite (default center)')
    // radius
    .default('r', 100)
    .alias('r', 'radius')
    .nargs('r', 1)
    .describe('r', 'Radius from center, in kilometers')
    // latitude
    .demand('l')
    .alias('l', 'latitude')
    .nargs('l', 1)
    .describe('l', 'Latitude for Center Point')
    // longitude
    .demand('n')
    .alias('n', 'longitude')
    .nargs('n', 1)
    .describe('n', 'Longitude for Center Point')
    //
    .help('h')
    .alias('h', 'help')
    .argv as yargs.Argv & ICommandLineOpts;

// export out the argv stuff
export const options = {
    radius: argv.r,
    lat: parseFloat(argv.l),
    long: parseFloat(argv.n),
};
