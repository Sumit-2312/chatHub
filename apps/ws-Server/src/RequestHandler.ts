import { Message, TextMessage } from "@repo/database/db";
import { generate } from "./AIRespose";
import { ClientInterface } from "./index";
import { publisher } from "./Redis";

export default async function Handler(data:any,userId:string,clients:ClientInterface[]){



    const ws = clients.find((client)=>{
        if( client.userId === userId){
            return true;
        }
    })?.ws;

    if( !ws || ws.readyState !== WebSocket.OPEN ) {
        throw new Error("WebSocket is not open or client not found");
    }





    try{

              // JOIN ROOM  --> working properly
            if (data.type === "joinRoom" && data.roomID) {
                // console.log("datatype:",data.type, "dataRoomId : ",data.roomID);
                const client = clients.find((c) => c.userId === userId);
                if (client && !client.rooms.includes(data.roomID)) {
                client.rooms.push(data.roomID);
                ws.send(JSON.stringify({ type: "joinedRoom", roomID: data.roomID }));
                console.log(`User ${userId} joined room ${data.roomID}`);
                }
            }

            // LEAVE ROOM --> working properly
            if (data.type === "leaveRoom" && data.roomID) {
                const client = clients.find((c) => c.userId === userId);
                if (client) {
                client.rooms = client.rooms.filter((room) => room !== data.roomID);
                ws.send(JSON.stringify({ type: "leftRoom", roomID: data.roomID }));
                console.log(`User ${userId} left room ${data.roomID}`);
                }
            }

            // SEND MESSAGE --> Working properly
            if (data.type === "chat" && data.roomID && data.message) {

                // use can only send the text message not the code
                const sender = clients.find((c) => c.userId === userId);

                if (!sender || !sender.rooms.includes(data.roomID)) {
                ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                return;
                }

                // use can send the text, image, file message
                // we need to chek the type of message and store accordingly
                // if the type is image and file then we will first store the image/file in cloudinary and store the url in the database

                if(data.messageType == 'text'){
                    const {message, roomID} = data;
                const newMessage = await TextMessage.create({
                    ChatRoomId: roomID,
                    senderId: sender.userId,
                    messageType: "text",
                    blocks: [
                        {
                            type: "text",
                            content: message
                        }
                    ]
                });

                    console.log("Message stored in database:", newMessage);
                }


                // then send the message to publisher to broadcast to all connected clients
             await  publisher.publish("chatRoom",JSON.stringify({
                    type:"chat",
                    roomID: data.roomID,
                    message: data.message,
                    userId: userId
                }));

            }

            if(data.type === "AiChat" && data.roomID && data.query && data.isAI){
                console.log("Reached in AI chat handler");
                               
                if(!data.isAI){
                    ws.send(JSON.stringify({type:"error",message:"You are not allowed to use AI chat"}));
                    return;
                }
                const query = data.query;
                // const response --> get the response from AI
                const response = await generate(query);

                await publisher.publish("chatRoom",JSON.stringify({
                    sender:"AI",
                    type:"AiChat",
                    roomID : data.roomID,
                    message : response,
                    query : query
                }));

            }

    }


    catch(err:any){
        throw new Error(`Error handling message: ${err || err.message}`);
    }
}