import { Message, RoomModel, TextMessage } from "@repo/database/db";
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
            if (data.type === "joinRoom" && data.roomName) {
                // console.log("datatype:",data.type, "dataRoomId : ",data.roomName);
                const client = clients.find((c) => c.userId === userId);
                if (client && !client.rooms.includes(data.roomName)) {
                    client.rooms.push(data.roomName);
                    console.log("Client rooms after join:", client.rooms);
                    ws.send(JSON.stringify({ type: "joinedRoom", roomName: data.roomName }));
                    console.log(`User ${userId} joined room ${data.roomName}`);
                }
            }

            // LEAVE ROOM --> working properly
            if (data.type === "leaveRoom" && data.roomName) {
                const client = clients.find((c) => c.userId === userId);
                if (client) {
                client.rooms = client.rooms.filter((room) => room !== data.roomName);
                ws.send(JSON.stringify({ type: "leftRoom", roomID: data.roomName }));
                console.log(`Client room after leave: `,client.rooms);
                console.log(`User ${userId} left room ${data.roomName}`);
                }
            }

            // SEND MESSAGE --> Working properly
            if (data.type === "chat" && data.roomName && data.message) {

                // use can only send the text message not the code
                const sender = clients.find((c) => c.userId === userId);

                if (!sender || !sender.rooms.includes(data.roomName)) {
                ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                return;
                }

                // use can send the text, image, file message
                // we need to chek the type of message and store accordingly
                // if the type is image and file then we will first store the image/file in cloudinary and store the url in the database



                // then send the message to publisher to broadcast to all connected clients
                if( data.messageType == 'text' ){

                    const {message, roomName} = data;

                    const roomId = await RoomModel.findOne({name: roomName},'_id');
                    if (!roomId) {
                        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                        return;
                    };

                    const newMessage = await TextMessage.create({
                        ChatRoomId: roomId,
                        sender: userId,
                        messageType: "text",
                        content : message
                    });

                    console.log("Message stored in database:", newMessage);
                    await publisher.publish("chatRoom", JSON.stringify({
                        type: "chat",
                        messageType: data.messageType,
                        roomName: data.roomName,
                        message: data.message,
                        sender: userId
                    }));
                }

                else if( data.messageType == 'image' || data.messageType == 'file' ){                    
                    await publisher.publish("chatRoom", JSON.stringify({
                        type: 'chat',
                        messageType: data.messageType,
                        roomName: data.roomName,
                        url: data.url,
                        sender: userId
                    }));

                }

            }
            
            if (data.type === "AiChat" && data.roomID && data.query ) {

                const sender = clients.find((c) => c.userId === userId);
                if (!sender || !sender.rooms.includes(data.roomID)) {
                    ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                    return;
                }
                // Generate AI response
                const aiResponse = await generate(data.query);
                if (!aiResponse) {
                    ws.send(JSON.stringify({ type: "error", message: "AI response generation failed" }));
                    return;
                }
                // Store AI response in the database
                const newMessage = await TextMessage.create({   
                    ChatRoomId: data.roomID,
                    sender: "AI", // Assuming AI responses are identified by "AI"
                    messageType: "text",
                    content: aiResponse
                });
                console.log("AI Response stored in database:", newMessage);
                // Publish AI response to the chat room
                await publisher.publish("chatRoom", JSON.stringify({
                    type: "AiChat",
                    messageType: "text",
                    roomID: data.roomID,
                    message: aiResponse,
                    sender: "AI"
                }));   
            }

    }


    catch(err:any){
        throw new Error(`Error handling message: ${err || err.message}`);
    }
}
