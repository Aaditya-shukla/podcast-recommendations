const redis = require('redis');

const client = redis.createClient({
    // socket: {
    //     host: 'redis-13657.c273.us-east-1-2.ec2.cloud.redislabs.com',
    //     port: 13657
    // },
    // password: 'ev96usoRu1akKPFVDz9CgP0RK7fRfizG'
       socket: {
        host: 'localhost',
        port: 6379
    }
   
});

(async function connect(){
    await client.connect()
})()
client.on('error', err => {
    console.log('Error ' + err);
});
console.log("Server is running at 3000", client)

module.exports = client