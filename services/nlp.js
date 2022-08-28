
const spacyNLP = require("spacy-nlp");
// const sw = require('stopword');
const request = require('request-promise');
// const { SparqlEndpointFetcher } = require("fetch-sparql-endpoint");
// const myFetcher = new SparqlEndpointFetcher({
//     method: 'POST',                   // A custom HTTP method for issuing (non-update) queries, defaults to POST. Update queries are always issued via POST.
//     fetch: fetch,                     // A custom fetch-API-supporting function
//     // dataFactory: DataFactory,         // A custom RDFJS data factory
//     prefixVariableQuestionMark: false // If variable names in bindings should be prefixed with '?', defaults to false
// });


const nlp = spacyNLP.nlp;

 module.exports = {
    // version: '0.0.1',
    // init: function (dataset) {
    //     db = dataset;
    //     //   send.initsgMail(milqconfig.for.sendgrid.apiKey);
    //     //   redis = require('milqredis').createNotificationsCount()('notificationcount');

    // },
    extractEntities
}


async function extractEntities(description) {


    const result = await nlp.parse(description)

    console.log(result);

    let set = new Set();
    for (const iterator of result) {
      
        if (Array.isArray(iterator.parse_list)) {
            for (const item of iterator.parse_list) {
          
                if (item.POS_coarse == 'PROPN') {
                    set.add(item.word)
                } else if (item.NE == 'NORP' || item.NE == 'ORG') {
                    set.add(item.word)
                }

            }
        }
    }
    // REMOVE DATES FROM THE STRING
    // REMOVE https:// LINKS FROM THE SET
    // CONVERT THE REDIRTED WORD IN WEKIPEDIS API AS A MAIN WORD IN SET


    // try to get tags from media wiki api
    console.log("------11111111111111111", set)
    // console.log(JSON.stringify(result));


    const url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles='
    const urls = []

    let array = [...set].slice(0, 15);
    set = new Set(array);

    for (var it = set.values(), val = null; val = it.next().value;) {
        urls.push(url + encodeURIComponent(val))
    }


    const promises = urls.map(url => request(url));
    const urlData = await Promise.all(promises);


    for (const iterator of urlData) {
        const parse = JSON.parse(iterator);

        if (parse.query.pages && parse.query.pages["-1"] && parse.query.pages["-1"].missing == '') {
         
            const str = parse.query.pages["-1"].title.charAt(0).toLowerCase() + parse.query.pages["-1"].title.slice(1);

            set.delete(parse.query.pages["-1"].title)
            set.delete(str)

        }
    }
  

    const tags = [...set].map(i => i.toLowerCase())

    for (const iterator of tags) {
        if (!iterator.includes(" ")) {
            for (const iterator2 of tags) {
                if (iterator2.includes(iterator) && iterator != iterator2) {
                    index = tags.indexOf(iterator);
                    tags.splice(index, 1);
                }
            }
        }
    }
    return tags;

    // Makin all in lower case

    // Promise.all([])
    // const bindingsStream = await myFetcher.fetchBindings('https://dbpedia.org/sparql',
    //     'SELECT * WHERE { ?s ?p ?o } LIMIT 100');
    // bindingsStream.on('data', (bindings) => console.log(bindings));
    //   callback(null, result);
}



