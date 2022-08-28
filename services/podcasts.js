

// Search Podcasts
const fetchUrl = require("fetch").fetchUrl;
const Parser = require('rss-parser');
const parse = require('csv-parse');
const multer = require('multer');

// const redisJson = require("./redisJson");
const redisSearch = require("./redisSearch");
const redisGraph = require("./redisGraph");
const nlp = require("./nlp");
const timer = ms => new Promise(res => setTimeout(res, ms));


async function searchpodcasts(req, res) {
    const data = await podcastAppleSearch(req.query);
    res.status(200).json(data)

}

async function podcastAppleSearch(options) {
    try {
        const result = [];
        return new Promise(async (resolve, reject) => {

            console.log("******************", options)
            if (!options.qs || options.qs === '') {
                console.log('Search query is not specified');
                return
            }
            let i = 0;
            var from = options.from || 0;

            var params = {
                term: encodeURIComponent(options.qs).replace(/%%/g, "%25%"),
                entity: 'podcast',
                from,
                limit: 10, // custom hard coded limit
            };
            var url = buildURL('https://itunes.apple.com/search', params);
            console.log("Url is", url)
            console.log(`Searching ${url}`);

            fetchUrl(url, function (error, meta, body) {
                if (!error && body) {
                    let podcasts = JSON.parse(body.toString());

                    for (const data of podcasts.results) {

                        if (data.feedUrl) {
                            const object = {
                                title: data.trackName && data.trackName.replace(/\n/g, '').replace(/ +(?= )/g, '').trim().toLowerCase(),
                                artistName: data.artistName || "",
                                collectionId: data.collectionId,
                                collectionViewUrl: data.collectionViewUrl,
                                image: data.artworkUrl600 && data.artworkUrl600.replace(/\n/g, '').replace(/ +(?= )/g, '').trim(),
                                releaseData: data.releaseDate,
                                trackCount: data.trackCount,
                                tags: (data.genres || []).map(i=>i.toLowerCase()),
                                href: data.feedUrl && data.feedUrl.replace(/\n/g, '').replace(/ +(?= )/g, '').trim(),
                                // description: info.description && info.description.replace(/\n/g, '').replace(/ +(?= )/g, '').trim(),
                            }

                            if (object.tags && Array.isArray(object.tags) && object.tags[0]) {
                                const index = object.tags.indexOf("Podcasts")
                                if (index > -1) {
                                    object.tags.splice(index, 1)
                                }
                            }
                            object.href = data.feedUrl

                            result.push(object);

                            parseRss(data.feedUrl, null, async (err, info) => {


                                object.description = info.description && info.description.replace(/\n/g, '').replace(/ +(?= )/g, '').trim().toLowerCase()
                                const nlpTags = await nlp.extractEntities(object.description) || []
                                object.tags.push(...nlpTags)
                                redisGraph.addPodcastRedisGraph(object)
                            })
                        }

                    }

                    return resolve(result)
                } else {
                    return resolve(null)

                }
            })
        })
    } catch (e) {
        console.log("ERROR->", e)
    }
}

function buildURL(url, options) {
    Object.keys(options).forEach((key, index) => {
        if (index === 0) {
            url += `?${key}=${options[key]}`;
        } else {
            url += `&${key}=${options[key]}`;
        }
    });
    return url;
}

// Parse podcasts

async function parseRss(url, check, callback) {
    let result;

    const feedURL = url.replace('0X0P 0', ':');
    const parser = new Parser({
        // requestOptions: {
        //   rejectUnauthorized: false
        // },
        headers: { 'User-Agent': 'rss-parser' },
        xml2js: {
            ignoreAttrs: false,
            attrKey: '$',
        },
        customFields: {
            feed: ['image', 'itunes:image'],
        },
    });
    const feed = parser.parseURL(feedURL);
    feed.then(async (data) => {
        result = processRssResult(data, feedURL);
          const object = {};

        object.image = result.image && result.image.replace(/\n/g, '').replace(/ +(?= )/g, '').trim();
        object.title = result.title && result.title.replace(/\n/g, '').replace(/ +(?= )/g, '').trim();
        object.description = result.description && result.description.replace(/\n/g, '').replace(/ +(?= )/g, '').trim();
        object.artistName = result.artistName && result.artistName.replace(/\n/g, '').replace(/ +(?= )/g, '').trim() || "";
        // object.link = result.link && (typeof result.link == 'object' ? result.link['_:'] : result.link.replace(/\n/g, '').replace(/ +(?= )/g, '').trim());
        object.href = (result.href && result.href.replace(/\n/g, '').replace(/ +(?= )/g, '').trim()) || feedURL;
        object.episodeCount = result.podcasts.length

        if (check) {
            callback(null, result)
        } else {
            callback(null, object)
        }
    })

}

function processRssResult(data, url) {
    let defaultImage = '';
    if (data.image && data.image.url) {
        if (typeof (data.image.url) === 'string') {
            defaultImage = data.image.url;
        } else if (typeof (data.image.url) === 'object') {
            // eslint-disable-next-line prefer-destructuring
            defaultImage = data.image.url[0];
        }
    } else if (data.itunes && data.itunes.image) {
        if (typeof (data.itunes.image) === 'string') {
            defaultImage = data.itunes.image;
        } else if (typeof (data.itunes.image) === 'object') {
            // eslint-disable-next-line prefer-destructuring
            defaultImage = data.itunes.image[0];
        }
    } else if (data['itunes:image'] && data['itunes:image'].$ && data['itunes:image'].$.href) {
        if (typeof (data['itunes:image'].$.href) === 'string') {
            defaultImage = data['itunes:image'].$.href;
        } else if (typeof (data['itunes:image'].$.href) === 'object') {
            // eslint-disable-next-line prefer-destructuring
            defaultImage = data['itunes:image'].$.href[0];
        }
    }
    const defaults = {
        image: defaultImage,
        href: data.feedUrl,
        type: 'podcast',
        format: 'audio',
        startTime: 0,
        podcast_name: data.title,
    };
    // eslint-disable-next-line array-callback-return, consistent-return
    const podcasts = (data.items || []).map((item) => {
        if (item.enclosure && item.enclosure.url) {
            let duration = (item.itunes && item.itunes.duration) || 0;
            if (duration && duration.indexOf(':') !== -1) {
                const durationFormat = duration.split(':');
                if (durationFormat && durationFormat.length === 3) {
                    // eslint-disable-next-line max-len
                    duration = (+durationFormat[0]) * 60 * 60 + (+durationFormat[1]) * 60 + (+durationFormat[2]);
                } else if (durationFormat && durationFormat.length === 2) {
                    duration = (+duration.split(':')[0]) * 60 + (+duration.split(':')[1]);
                }
            } else {
                duration = +duration;
            }
            let pubDate = 0;
            if (item.pubDate) {
                pubDate = (new Date(item.pubDate)).getTime();
            }
            return Object.assign({}, defaults, {
                name: item.title,
                artistName: (item.itunes && item.itunes.author) || (data.itunes && data.itunes.author),
                audioUrl: item.enclosure.url,
                image: (item.itunes && item.itunes.image) || defaults.image,
                duration,
                endTime: duration,
                pubDate,
                description: item.contentSnippet || item.content || data.description,
            });
        }
    });

    return {
        // eslint-disable-next-line no-mixed-operators
        image: defaultImage,
        title: data.title,
        description: data.description,
        artistName: data.itunes && data.itunes.author,
        link: data.link,
        href: data.feedUrl,
        podcasts: podcasts.filter(item => item),
    };
}

async function searchRedisPodcast(req, res) {
    const data = await redisSearch.searchRedisPodcast();
    return res.status(200).json(data)
}

async function addPodcastInRedisGraph(req, res) {
    const data = await redisGraph.addPodcastRedisGraph();
    return res.status(200).json(data)
}

async function fetchPodcastsEpisodes(req, res) {

    parseRss(req.body.feedUrl, 1, async (err, info) => {

        if (err) {
            res.status(500).json({ message: "Please try again" })
        } else {
            res.status(200).json(info)

        }
    })
}

// Recomend podcasts

async function recommendedPodcasts(req, res) {

    const [Graph, Search] = await Promise.all(
        [redisGraph.recommendedPodcasts(req.body.name.toLowerCase()),

        redisSearch.searchRedisPodcast(req.body.name.toLowerCase())
        ]);

    const array = [];
    for (const iterator of Graph.data) {
        const obj = {};
        obj.name = iterator[0][2][1][0][1];
        obj.image = iterator[0][2][1][0][1];
   
        array.push(obj)
    }
    const repeateCheck = array.map(i=>i.name)
    for (const iterator of Search.documents) {
        if (iterator.value.title != req.body.name && !repeateCheck.includes(iterator.value.title) ) {
            const obj = {};
            obj.href = iterator.value.href;
            obj.image = iterator.value.image;
            obj.title = iterator.value.title;

            array.push(obj)
        }
    }
    // console.dir(Search, { depth: null })

    res.status(200).json(array)

}

// Feed data into nsystem

async function podcastsFromCSV(req, res) {
    try {
        const upload = multer({
            storage: multer.memoryStorage(),
        }).single('file');

        upload(req, res, function (err) {

            parse(
                req.file.buffer,
                { trim: true, skipEmptyLines: true, delimiter: ',', bom: true },
                async function (error, output) {
         
                    let processedRecords = output.map((record) => {
                        const object = {
                            qs: record[1]

                        }
                        return object
                    });

                    for (const iterator of processedRecords) {
                        await timer(2000);

                        podcastAppleSearch(iterator)
                    }

                })

        })
    } catch {
        return res.status(500).json({ err: JSON.stringify(err) })

    }
}

async function listPodcasts(req, res) {
    const data = await redisSearch.searchRedisPodcast("is");
    const array = []
    for (const iterator of data.documents) {

        const obj = {};
        obj.href = iterator.value.href;
        obj.image = iterator.value.image;
        obj.title = iterator.value.title;

        array.push(obj)

    }
    res.status(200).json(array)
}
module.exports = {
    searchpodcasts,
    searchRedisPodcast,
    addPodcastInRedisGraph,
    podcastsFromCSV,
    fetchPodcastsEpisodes,
    recommendedPodcasts,
    listPodcasts
}