import { Message, RoomModel } from "@repo/database/db";
import { generate } from "./AIRespose";
import { ClientInterface } from "./index";
import { publisher } from "./Redis";

export default async function Handler(data:any,userId:string,clients:ClientInterface[]){

    console.log(clients);

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
                console.log("Join request entered into handler function");
                const client = clients.find((c) => c.userId === userId);
                if (!client) return;

                // If already in a room, automatically leave it
                if (client.rooms.length > 0) {
                    const previousRoom = client.rooms[0];
                    if( previousRoom != data.roomName){
                        client.rooms = [];
                        client.rooms = [data.roomName];
                        ws.send(JSON.stringify({ type: "joinedRoom", roomName: data.roomName }));
                        console.log(`User ${userId} switched from room ${previousRoom} to room ${data.roomName}`);
                        return;
                    }
                }
                else{
                    client.rooms = [data.roomName];
                    ws.send(JSON.stringify({ type: "joinedRoom", roomName: data.roomName }));
                    console.log(`User ${userId} joined room ${data.roomName}`);
                    return;
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
                    //@ts-ignore
                    const newMessage = await Message.create({
                        ChatRoomId: roomId._id,
                        sender: userId,
                        messageType: data.messageType,
                        content: data.message,            
                        senderType: "user"                
                    });


                    console.log("Message stored in database:", newMessage);
                    console.log("Message sent to publisher:", {
                        type: 'chat',
                        messageType: data.messageType,
                        roomName: data.roomName,
                        message: newMessage.toObject()
                    });
                    await publisher.publish("chatRoom", JSON.stringify({
                        roomName: data.roomName,
                        content:{
                            ...newMessage.toObject(),
                            roomName: data.roomName
                        }
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
            
            if (data.type === "AiChat" && data.roomName && data.query ) {

                let AI_USER_ID = "671f6a7e23e3b27e5412d890"; // Default AI user ID

                const sender = clients.find((c) => c.userId === userId);
                if (!sender || !sender.rooms.includes(data.roomName)) {
                    ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                    return;
                }
                // Generate AI response
                const roomId = await RoomModel.findOne({name: data.roomName},'_id');
                if (!roomId) {
                    ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                    return;
                };
                const aiRes = await generate(data.query,userId);
                const aiResponse = JSON.stringify(aiRes);
                if (!aiResponse) {
                    ws.send(JSON.stringify({ type: "error", message: "AI response generation failed" }));
                    return;
                }
                // Store the User message in the database
                //@ts-ignore
                const newMsg = await Message.create({   
                    ChatRoomId: roomId._id,
                    sender: data.sender, // Assuming AI responses are identified by "AI"
                    messageType: "text",
                    content: data.query,
                    senderType: 'user'
                });
                const newMessage = await newMsg.populate('sender','_id username email profilePicture discription');

                console.log("User Message stored in database:", newMessage);

                // now store the AI response in the database
                //@ts-ignore
                const aiMsg = await Message.create({
                    ChatRoomId: roomId._id,
                    sender: AI_USER_ID, // Assuming AI responses are identified by "AI"
                    messageType: "text",
                    content: aiResponse,
                    senderType: 'AI'
                });

                const aiMessage = await aiMsg.populate('sender','_id username email profilePicture discription');

                console.log("AI Response stored in database:", aiMessage);
                // Publish AI response to the chat room
                await publisher.publish("chatRoom", JSON.stringify({
                    roomName: data.roomName,
                    content: {
                        ...newMessage.toObject(),
                        roomName: data.roomName
                    }
                }));   
                await publisher.publish("chatRoom", JSON.stringify({
                    roomName: data.roomName,
                    content : {
                        ...aiMessage.toObject(),
                        roomName: data.roomName
                    }
                }));   
            }

    }


    catch(err:any){
        throw new Error(`Error handling message: ${err || err.message}`);
    }
}
