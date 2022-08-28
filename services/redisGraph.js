const client = require("../redis");
const redisJson = require("./redisJson");


async function addPodcastRedisGraph(object) {

    const podCheckQuery = `MATCH (p:Podcasts{name:"${object.title}"}) RETURN p`;
    const podCheck = await client.graph.QUERY("podcasts", podCheckQuery);
    if (podCheck && !podCheck.data[0]) {
        const q = `CREATE (podcasts:Podcasts{name:"${object.title}",_type:'podcasts',description:"${object.description}", href:"${object.href}" , image:"${object.image}"})  
    WITH   podcasts AS p
    UNWIND ${JSON.stringify(object.tags)} AS parentTags
    MERGE (ta:Tag{name:parentTags})
    MERGE (p)-[tag:tag]->(ta)
        `
        redisJson.addPodcast(object)

        await client.graph.QUERY("podcasts",
            q
        )
    }

}

async function recommendedPodcasts(name) {

    const query = `MATCH (me:Podcasts {name: '${name}'})-[:tag]->(f:Tag),
(f)-[:tag]-(x:Podcasts) WHERE x.name <> '${name}' 
RETURN x, count(x) as NrMutFr ORDER BY NrMutFr DESC LIMIT 10
UNION ALL
MATCH (me:Podcasts)-[:tag]->(f:Tag{name:'${name}'}) 
RETURN me AS x, count(me) as NrMutFr ORDER BY NrMutFr  DESC LIMIT 10`

    const data = await client.graph.QUERY("podcasts", query);
    return data || [];
}

module.exports = {
    addPodcastRedisGraph,
    recommendedPodcasts

}
