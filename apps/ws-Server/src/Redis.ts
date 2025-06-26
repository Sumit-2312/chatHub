import {createClient} from 'redis';

 const publisher = createClient();
 const subscriber = createClient();

 async function main(){
    
        await publisher.connect();
        await subscriber.connect();
        console.log("✅ Connected to Redis Pub/Sub");

 }
 main();

export { publisher, subscriber };