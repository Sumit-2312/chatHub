import { atom } from "recoil";

const websocketState = atom<WebSocket|null>({
    key: 'websocketState',
    default: null
});
export default websocketState;