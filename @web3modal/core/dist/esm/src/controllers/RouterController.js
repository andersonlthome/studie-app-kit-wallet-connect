import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy } from 'valtio/vanilla';
const state = proxy({
    view: 'Connect',
    history: ['Connect'],
    transactionStack: []
});
export const RouterController = {
    state,
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    pushTransactionStack(action) {
        state.transactionStack.push(action);
    },
    popTransactionStack(cancel) {
        const action = state.transactionStack.pop();
        if (!action) {
            return;
        }
        if (cancel) {
            this.goBack();
            action?.onCancel?.();
        }
        else {
            if (action.goBack) {
                this.goBack();
            }
            else if (action.view) {
                this.reset(action.view);
            }
            action?.onSuccess?.();
        }
    },
    push(view, data) {
        if (view !== state.view) {
            state.view = view;
            state.history.push(view);
            state.data = data;
        }
    },
    reset(view) {
        state.view = view;
        state.history = [view];
    },
    replace(view, data) {
        if (state.history.length >= 1 && state.history.at(-1) !== view) {
            state.view = view;
            state.history[state.history.length - 1] = view;
            state.data = data;
        }
    },
    goBack() {
        if (state.history.length > 1) {
            state.history.pop();
            const [last] = state.history.slice(-1);
            if (last) {
                state.view = last;
            }
        }
    },
    goBackToIndex(historyIndex) {
        if (state.history.length > 1) {
            state.history = state.history.slice(0, historyIndex + 1);
            const [last] = state.history.slice(-1);
            if (last) {
                state.view = last;
            }
        }
    }
};
//# sourceMappingURL=RouterController.js.map