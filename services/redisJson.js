const client = require("../redis");

async function addPodcast(data) {
        const KEY = data.title.split(" ").join("-") + "-" + data.artistName.split(" ").join("-")
        client.json.set(KEY, '.', data);
}


module.exports ={
    addPodcast
}