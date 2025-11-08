import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import mongoose from "mongoose";
import isAuthenticated from "./middleware";
import Handler from "./RequestHandler";
import { subscriber } from "./Redis";

dotenv.config();

// Define connected client structure
export interface ClientInterface {
  userId: string;
  ws: WebSocket;
  rooms: string[];
}

// Connected clients list
let clients: ClientInterface[] = [];

// ======================== MongoDB Connection ========================
const mongodbUrl = process.env.MONGO_URI;
if (!mongodbUrl) {
  throw new Error("MongoDB URL is not defined in .env");
}

mongoose
  .connect(mongodbUrl)
  .then(() => console.log("Connected to MongoDB in WebSocket server"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ======================== WebSocket Server ==========================
const server = new WebSocketServer({ port: 8080 });
console.log("WebSocket server started on port 8080");


// After the server is createed, we will subscribe to the Redis channel
// server will be subscribed to the "chatRoom" channel
// whenever we publish a message to this channel, this funcition will be called
// and we will send the message to all the clients who are subscribed to the room
subscriber.subscribe("chatRoom",(message)=>{
  const data = JSON.parse(message);
  console.log("Received message from Redis Pub/Sub:", data);
  console.log("message to be sent on frontend" , data.content);

  clients.forEach((client)=>{
    if( client.rooms.includes(data.roomName) && client.ws.readyState === WebSocket.OPEN){
      client.ws.send(JSON.stringify(data.content))
    }
  })
})


// the above part is shared with all the clients . global scope


server.on("connection", async (ws: WebSocket, req: any) => {


// the below part is specific to each client connection

  // ======================== JWT Authentication ====================

    let authentic = false;
    try{
        authentic = await isAuthenticated(req);
    }
    catch(err){
            console.error("Authentication error:", err);
            ws.close(1008, "Authentication error");
            return;
    }

    if(!authentic) {
      ws.close(1008, "Authentication failed");
      console.error("Authentication failed for a WebSocket connection");
      return;
    }
  
  //================================================================



    let userId : string  = req.userId;
    clients = clients.filter(c => c.userId !== userId || c.ws.readyState === WebSocket.OPEN);
    // Add to clients list
    clients.push({ userId, ws, rooms: [] });
    console.log(`User ${userId} connected with socket: ${ws}`);



  // ======================= Message Handler ========================

  ws.on("message", async (rawData) => {


    try {

      const data = JSON.parse(rawData.toString());
      console.log("Received message on websocket:", data);
      // on message is triggered when the client sends a message
      // we broadcast the message to all the clients with handler function
      await Handler(data, userId, clients);  // userId here indicates the user who recieves the message

    } catch (err) {

      console.error("Message parse error:", err);
      ws.send(JSON.stringify({ type: "error", message: "error from index.ts file in catch block format",err:err }));

    }

  });

  // ======================= Close Handler ==========================

  ws.on("close", () => {
    clients = clients.filter((c) => c.ws !== ws);
    console.log(`User ${userId} disconnected`);
  });

  // ======================= Error Handler ==========================

  ws.on("error", (err) => {
    console.error(`Error from user ${userId}:`, err);
  });


});
