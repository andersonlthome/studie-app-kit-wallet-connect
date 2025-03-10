import { proxy, subscribe as sub, snapshot } from 'valtio/vanilla';
import { ConnectorController } from './ConnectorController.js';
import { getW3mThemeVariables } from '@web3modal/common';
const state = proxy({
    themeMode: 'dark',
    themeVariables: {},
    w3mThemeVariables: undefined
});
export const ThemeController = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    setThemeMode(themeMode) {
        state.themeMode = themeMode;
        try {
            const authConnector = ConnectorController.getAuthConnector();
            if (authConnector) {
                const themeVariables = ThemeController.getSnapshot().themeVariables;
                authConnector.provider.syncTheme({
                    themeMode,
                    themeVariables,
                    w3mThemeVariables: getW3mThemeVariables(themeVariables, themeMode)
                });
            }
        }
        catch {
            console.info('Unable to sync theme to auth connector');
        }
    },
    setThemeVariables(themeVariables) {
        state.themeVariables = { ...state.themeVariables, ...themeVariables };
        try {
            const authConnector = ConnectorController.getAuthConnector();
            if (authConnector) {
                const themeVariablesSnapshot = ThemeController.getSnapshot().themeVariables;
                authConnector.provider.syncTheme({
                    themeVariables: themeVariablesSnapshot,
                    w3mThemeVariables: getW3mThemeVariables(state.themeVariables, state.themeMode)
                });
            }
        }
        catch {
            console.info('Unable to sync theme to auth connector');
        }
    },
    getSnapshot() {
        return snapshot(state);
    }
};
//# sourceMappingURL=ThemeController.js.map