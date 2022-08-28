const client = require("../redis");


async function searchRedisPodcast(query) {
   
    query = query.replace(/%/g, '').split(" ").join("%%%%%%")
    const data = await client.ft.search("myIdx", "%%%" + query + "%%%", {
        LIMIT: {
            from: 0,
            size: 20
        }
    });
    return data

}

//  FT.CREATE myIdx ON JSON SCHEMA $.title AS title TEXT 

module.exports = {
    searchRedisPodcast

}