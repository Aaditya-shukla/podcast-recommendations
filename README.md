# podcast-recommendations
podcast recommendations using Redis stacks

![Screenshot](https://i.postimg.cc/nrWkyCHS/Screenshot-1.png)

How to run the app

# Terminal 1$

install spacy in python3 

python3 -m pip install -U socketIO-client 

python3 -m pip install -U spacy==2.1.3 

python3 -m spacy download en_core_web_md 

npm install 

node server.js 

# Terminal 2$

npm install --prefix my-app/

npm start --prefix my-app/

Please wait for 1 minutes after starting the node server since nlp server takes time to come up

Creating Data in all redis modules.
Create Podcasts data in RedisJSON

async function addPodcast(data) {

  const KEY = data.title.split(" ").join("-") + "-" + data.artistName.split(" ").join("-");
  client.json.set(KEY, '.', data);
}


Create Podcasts data in RedisGrapth

Before adding adding data , checked weather it is present or not. If present in DB ignored the insertion.

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


Retriving data to get the podcasts recomendations.

Retriving data from RedisGraph


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

Retriving data from RedisJSON usiing RedisSearch

Created index on the description key ->

FT.CREATE myIdx ON JSON SCHEMA $.title AS title TEXT 

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






