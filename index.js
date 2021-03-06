const fs = require('fs');
const readline = require('readline');
const argv = require('yargs')
                .option('i', {
                    alias: 'inputfile',
                    default: 'source.xmls',
                    describe: 'input file',
                    nargs: 1,
                    type: 'string'
                })
                .option('o', {
                    alias: 'outputfile',
                    default: 'output.xml',
                    describe: 'output file',
                    nargs: 1,
                    type: 'string'
                })
                .option('s', {
                    alias: 'spaces',
                    default: false,
                    describe: 'assume indentation using spaces',
                    nargs: 0,
                    type: 'boolean'
                })
                .example('$0 -i source.xmls -o output.xml')
                .example('$0 -s')
                .example('$0')
                .help('h')
                .alias('h', 'help')
                .argv;

const log_ = argv.outputfile === "stdout" ? false : true;
function log(...args){
    if(log_ ===true)
        console.log(new Date().toISOString(), ...args);
}

const source = argv.inputfile;
const target = argv.outputfile;

log(`opening source file`, source);
const readInterface = readline.createInterface({
    input: fs.createReadStream(source, {encoding: "utf-8"}),
    output: false,
    console: false
});

let blueprint = [];
const lines = [];

log(`reading content`);
readInterface.on('line', function(line) {
    let depth = 0;
    if(argv.spaces){
        while (line.substr(0,4) == "    "){
            line = line.substr(4);
            depth++;
        }
    } else {
        while (line.charAt(0) == "\t"){
            line = line.substr(1);
            depth++;
        }
    }
    if(depth == 0){
        flushBluePrint(blueprint);
        log("blueprint flushed");
    }
    const elements = line.match(/(?:[^\s"]+|"[^"]*")+/g) 
    if(typeof elements !== 'undefined' && elements !== null){
        blueprint.push({
            depth: depth,
            name: elements[0],
            args: elements.slice(1)
        });
    }
});
readInterface.on('close', function() {
    flushBluePrint(blueprint);
    log("blueprint flushed");
    log("opening output file", target);
    if(argv.outputfile === "stdout"){
        process.stdout.write(lines.join('\n'));
    }else{
        const file = fs.createWriteStream('output.xml');
        file.on('error', function(err) { log("error opening file:", err) });
        log("writing lines");
        file.write(lines.join('\n'));
        file.end();
    }
    log("writing successful");
});

function flushBluePrint(){
    const backlog = [];
    blueprint.forEach((element, index) => {
        if(typeof blueprint[index+1] != 'undefined' && blueprint[index+1].depth > element.depth){
            lines.push(`${'\t'.repeat(element.depth)}<${formatTagContent(element.name, element.args)}>`);
            backlog.push(element.name);
        } else if((typeof blueprint[index+1] != 'undefined' && blueprint[index+1].depth < element.depth) || index == blueprint.length){
            lines.push(`${'\t'.repeat(element.depth)}<${formatTagContent(element.name, element.args)}/>`);
            while (backlog.length > blueprint[index+1].depth){
                const el = backlog.pop();
                lines.push(`${'\t'.repeat(backlog.length)}</${el}>`);
            }
        } else {
            lines.push(`${'\t'.repeat(element.depth)}<${formatTagContent(element.name, element.args)}/>`);
        }
    });
    while (backlog.length > 0){
        const el = backlog.pop();
        lines.push(`${'\t'.repeat(backlog.length)}</${el}>`);
    }
    blueprint = [];
}
function formatTagContent(name, args){
    return `${name}${args.length > 0 ? " " : ""}${args.join(" ")}`;
}