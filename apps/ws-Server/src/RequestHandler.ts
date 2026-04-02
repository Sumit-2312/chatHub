import { Message, RoomModel } from "@repo/database/db";
import { generate } from "./AIRespose";
import { ClientInterface } from "./index";
import { publisher } from "./Redis";

export default async function Handler(data:any,userId:string,clients:ClientInterface[]){

    console.log("Handler function called with data:", data, "for userId:", userId);

    const ws = clients.find((client)=>{
        if( client.userId === userId){
            return true;
        }
    })?.ws;

    if( !ws || ws.readyState !== WebSocket.OPEN ) {
        console.error("WebSocket is not open or client not found for userId:", userId);
        throw new Error("WebSocket is not open or client not found");
    }

    try{

            // JOIN ROOM  --> working properly
            if (data.type === "joinRoom" && data.roomId) {
                console.log("Join request entered into handler function");
                const client = clients.find((c) => c.userId === userId);
                if (!client) return;

                    client.rooms = [data.roomId];
                    console.log(`user: ${userId} joined the room ${data.roomId}`);
                    ws.send(JSON.stringify({ type: "joinedRoom", roomId: data.roomId }));
                    console.log(`User ${userId} joined room ${data.roomId}`);                
            }


            // LEAVE ROOM --> working properly
            if (data.type === "leaveRoom" && data.roomId) {
                const client = clients.find((c) => c.userId === userId);
                if (client) {
                client.rooms = client.rooms.filter((room) => room !== data.roomId);
                ws.send(JSON.stringify({ type: "leftRoom", roomId: data.roomId }));
                console.log(`Client room after leave: `,client.rooms);
                console.log(`User ${userId} left room ${data.roomId}`);
                }
            }

            // SEND MESSAGE --> Working properly
            if (data.type === "chat" && data.roomId && data.message) {

                // use can only send the text message not the code
                const sender = clients.find((c) => c.userId === userId);

                if (!sender || !sender.rooms.includes(data.roomId)) {
                    ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                    return;
                }

                // use can send the text, image, file message
                // we need to chek the type of message and store accordingly
                // if the type is image and file then we will first store the image/file in cloudinary and store the url in the database



                // then send the message to publisher to broadcast to all connected clients
                if( data.messageType == 'text' ){

                    const {message, roomId} = data;

                    const room = await RoomModel.findOne({_id: roomId},'_id name');
                    if (!roomId) {
                        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                        return;
                    };
                    if(!room){
                        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
                        return;
                    }
                    //@ts-ignore
                    const newMessage = await Message.create({
                        ChatRoomId: roomId,
                        sender: userId,
                        messageType: data.messageType,
                        content: message,            
                        senderType: "user"                
                    });


                    console.log("Message stored in database:", newMessage);
                    console.log("Message sent to publisher:", {
                        type: 'chat',
                        messageType: data.messageType,
                        roomId: data.roomId,
                        message: newMessage.toObject()
                    });
                    await publisher.publish("chatRoom", JSON.stringify({
                        roomId: data.roomId,
                        content:{
                            ...newMessage.toObject(),
                        }
                    }));
                }

                else if( data.messageType == 'image' || data.messageType == 'file' ){                    
                    await publisher.publish("chatRoom", JSON.stringify({
                        type: 'chat',
                        messageType: data.messageType,
                        roomId: data.roomId,
                        url: data.url,
                        sender: userId
                    }));

                }

            }
            
            if (data.type === "AiChat" && data.roomId && data.query ) {

                let AI_USER_ID = "671f6a7e23e3b27e5412d890"; // Default AI user ID

                const sender = clients.find((c) => c.userId === userId);
                if (!sender || !sender.rooms.includes(data.roomId)) {
                    ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                    return;
                }
               
                const aiRes = await generate(data.query,userId);
                const aiResponse = JSON.stringify(aiRes);
                if (!aiResponse) {
                    ws.send(JSON.stringify({ type: "error", message: "AI response generation failed" }));
                    return;
                }
                // Store the User message in the database
                //@ts-ignore
                const newMsg = await Message.create({   
                    ChatRoomId: data.roomId,
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
                    ChatRoomId: data.roomId,
                    sender: AI_USER_ID, // Assuming AI responses are identified by "AI"
                    messageType: "text",
                    content: aiResponse,
                    senderType: 'AI'
                });

                // const aiMessage = await aiMsg.populate('sender','_id username email profilePicture discription');

                console.log("AI Response stored in database:", aiMsg);
                // Publish AI response to the chat room
                await publisher.publish("chatRoom", JSON.stringify({
                    roomId: data.roomId,
                    content: {
                        ...newMessage.toObject(),
                    }
                }));   
                await publisher.publish("chatRoom", JSON.stringify({
                    roomId: data.roomId,
                    content : {
                        ...aiMsg.toObject(),
                    }
                }));   
            }

    }


    catch(err:any){
        throw new Error(`Error handling message: ${err || err.message}`);
    }
}
