import { atom, selector } from "recoil";

export const SelectedState = atom({
    key:"selectedState",
    default: "Chats"
});


export const haveAnySelectedState = selector({
    key: "haveAnySelectedState",
    get: ({get}) => {
        const selected = get(SelectedState);
        return selected !== "";
    }
})