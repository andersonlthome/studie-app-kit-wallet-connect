import { proxy, subscribe as sub } from 'valtio/vanilla';
const state = proxy({
    loading: false,
    open: false,
    selectedNetworkId: undefined,
    activeChain: undefined
});
export const PublicStateController = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    set(newState) {
        Object.assign(state, { ...state, ...newState });
    }
};
//# sourceMappingURL=PublicStateController.js.map