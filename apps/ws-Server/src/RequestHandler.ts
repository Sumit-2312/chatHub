import { ClientInterface } from "./index";
import { publisher, subscriber } from "./Redis";

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

                
                const sender = clients.find((c) => c.userId === userId);

                if (!sender || !sender.rooms.includes(data.roomID)) {
                ws.send(JSON.stringify({ type: "error", message: "You are not in this room" }));
                return;
                }

             await   publisher.publish("chatRoom",JSON.stringify({
                    type:"chat",
                    roomID: data.roomID,
                    message: data.message,
                    userId: userId
                }));

            }


    }
    catch(err:any){
        throw new Error(`Error handling message: ${err || err.message}`);
    }


}