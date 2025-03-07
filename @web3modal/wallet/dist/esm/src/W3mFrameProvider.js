import { W3mFrame } from './W3mFrame.js';
import { DEFAULT_LOG_LEVEL, W3mFrameConstants, W3mFrameRpcConstants } from './W3mFrameConstants.js';
import { W3mFrameStorage } from './W3mFrameStorage.js';
import { W3mFrameHelpers } from './W3mFrameHelpers.js';
import { generateChildLogger, generatePlatformLogger, getDefaultLoggerOptions } from '@walletconnect/logger';
export class W3mFrameProvider {
    constructor(projectId) {
        this.connectEmailResolver = undefined;
        this.connectDeviceResolver = undefined;
        this.connectOtpResolver = undefined;
        this.connectResolver = undefined;
        this.connectSocialResolver = undefined;
        this.connectFarcasterResolver = undefined;
        this.getFarcasterUriResolver = undefined;
        this.disconnectResolver = undefined;
        this.isConnectedResolver = undefined;
        this.getChainIdResolver = undefined;
        this.getSocialRedirectUriResolver = undefined;
        this.switchChainResolver = undefined;
        this.rpcRequestResolver = undefined;
        this.updateEmailResolver = undefined;
        this.updateEmailPrimaryOtpResolver = undefined;
        this.updateEmailSecondaryOtpResolver = undefined;
        this.syncThemeResolver = undefined;
        this.syncDappDataResolver = undefined;
        this.smartAccountEnabledNetworksResolver = undefined;
        this.setPreferredAccountResolver = undefined;
        const loggerOptions = getDefaultLoggerOptions({
            level: DEFAULT_LOG_LEVEL
        });
        const { logger, chunkLoggerController } = generatePlatformLogger({
            opts: loggerOptions
        });
        this.logger = generateChildLogger(logger, this.constructor.name);
        this.chunkLoggerController = chunkLoggerController;
        if (typeof window !== 'undefined' && this.chunkLoggerController?.downloadLogsBlobInBrowser) {
            if (!window.dowdownloadAppKitLogsBlob) {
                window.downloadAppKitLogsBlob = {};
            }
            window.downloadAppKitLogsBlob['sdk'] = () => {
                if (this.chunkLoggerController?.downloadLogsBlobInBrowser) {
                    this.chunkLoggerController.downloadLogsBlobInBrowser({
                        projectId
                    });
                }
            };
        }
        this.w3mFrame = new W3mFrame(projectId, true);
        this.w3mFrame.events.onFrameEvent(event => {
            this.logger.info({ event }, 'Event received');
            switch (event.type) {
                case W3mFrameConstants.FRAME_CONNECT_EMAIL_SUCCESS:
                    return this.onConnectEmailSuccess(event);
                case W3mFrameConstants.FRAME_CONNECT_EMAIL_ERROR:
                    return this.onConnectEmailError(event);
                case W3mFrameConstants.FRAME_CONNECT_FARCASTER_SUCCESS:
                    return this.onConnectFarcasterSuccess(event);
                case W3mFrameConstants.FRAME_CONNECT_FARCASTER_ERROR:
                    return this.onConnectFarcasterError(event);
                case W3mFrameConstants.FRAME_GET_FARCASTER_URI_SUCCESS:
                    return this.onGetFarcasterUriSuccess(event);
                case W3mFrameConstants.FRAME_GET_FARCASTER_URI_ERROR:
                    return this.onGetFarcasterUriError(event);
                case W3mFrameConstants.FRAME_CONNECT_DEVICE_SUCCESS:
                    return this.onConnectDeviceSuccess();
                case W3mFrameConstants.FRAME_CONNECT_DEVICE_ERROR:
                    return this.onConnectDeviceError(event);
                case W3mFrameConstants.FRAME_CONNECT_OTP_SUCCESS:
                    return this.onConnectOtpSuccess();
                case W3mFrameConstants.FRAME_CONNECT_OTP_ERROR:
                    return this.onConnectOtpError(event);
                case W3mFrameConstants.FRAME_CONNECT_SOCIAL_SUCCESS:
                    return this.onConnectSocialSuccess(event);
                case W3mFrameConstants.FRAME_CONNECT_SOCIAL_ERROR:
                    return this.onConnectSocialError(event);
                case W3mFrameConstants.FRAME_GET_SOCIAL_REDIRECT_URI_SUCCESS:
                    return this.onGetSocialRedirectUriSuccess(event);
                case W3mFrameConstants.FRAME_GET_SOCIAL_REDIRECT_URI_ERROR:
                    return this.onGetSocialRedirectUriError(event);
                case W3mFrameConstants.FRAME_GET_USER_SUCCESS:
                    return this.onConnectSuccess(event);
                case W3mFrameConstants.FRAME_GET_USER_ERROR:
                    return this.onConnectError(event);
                case W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS:
                    return this.onIsConnectedSuccess(event);
                case W3mFrameConstants.FRAME_IS_CONNECTED_ERROR:
                    return this.onIsConnectedError(event);
                case W3mFrameConstants.FRAME_GET_CHAIN_ID_SUCCESS:
                    return this.onGetChainIdSuccess(event);
                case W3mFrameConstants.FRAME_GET_CHAIN_ID_ERROR:
                    return this.onGetChainIdError(event);
                case W3mFrameConstants.FRAME_SIGN_OUT_SUCCESS:
                    return this.onSignOutSuccess();
                case W3mFrameConstants.FRAME_SIGN_OUT_ERROR:
                    return this.onSignOutError(event);
                case W3mFrameConstants.FRAME_SWITCH_NETWORK_SUCCESS:
                    return this.onSwitchChainSuccess(event);
                case W3mFrameConstants.FRAME_SWITCH_NETWORK_ERROR:
                    return this.onSwitchChainError(event);
                case W3mFrameConstants.FRAME_RPC_REQUEST_SUCCESS:
                    return this.onRpcRequestSuccess(event);
                case W3mFrameConstants.FRAME_RPC_REQUEST_ERROR:
                    return this.onRpcRequestError(event);
                case W3mFrameConstants.FRAME_SESSION_UPDATE:
                    return this.onSessionUpdate(event);
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_SUCCESS:
                    return this.onUpdateEmailSuccess(event);
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_ERROR:
                    return this.onUpdateEmailError(event);
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_SUCCESS:
                    return this.onUpdateEmailPrimaryOtpSuccess();
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_PRIMARY_OTP_ERROR:
                    return this.onUpdateEmailPrimaryOtpError(event);
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_SUCCESS:
                    return this.onUpdateEmailSecondaryOtpSuccess(event);
                case W3mFrameConstants.FRAME_UPDATE_EMAIL_SECONDARY_OTP_ERROR:
                    return this.onUpdateEmailSecondaryOtpError(event);
                case W3mFrameConstants.FRAME_SYNC_THEME_SUCCESS:
                    return this.onSyncThemeSuccess();
                case W3mFrameConstants.FRAME_SYNC_THEME_ERROR:
                    return this.onSyncThemeError(event);
                case W3mFrameConstants.FRAME_SYNC_DAPP_DATA_SUCCESS:
                    return this.onSyncDappDataSuccess();
                case W3mFrameConstants.FRAME_SYNC_DAPP_DATA_ERROR:
                    return this.onSyncDappDataError(event);
                case W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS:
                    return this.onSmartAccountEnabledNetworksSuccess(event);
                case W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR:
                    return this.onSmartAccountEnabledNetworksError(event);
                case W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_SUCCESS:
                    return this.onSetPreferredAccountSuccess();
                case W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_ERROR:
                    return this.onSetPreferredAccountError();
                default:
                    return null;
            }
        });
    }
    getLoginEmailUsed() {
        return Boolean(W3mFrameStorage.get(W3mFrameConstants.EMAIL_LOGIN_USED_KEY));
    }
    getEmail() {
        return W3mFrameStorage.get(W3mFrameConstants.EMAIL);
    }
    rejectRpcRequest() {
        this.rpcRequestResolver?.reject();
    }
    async connectEmail(payload) {
        await this.w3mFrame.frameLoadPromise;
        W3mFrameHelpers.checkIfAllowedToTriggerEmail();
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_EMAIL, payload });
        return new Promise((resolve, reject) => {
            this.connectEmailResolver = { resolve, reject };
        });
    }
    async connectDevice() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_DEVICE });
        return new Promise((resolve, reject) => {
            this.connectDeviceResolver = { resolve, reject };
        });
    }
    async connectOtp(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_CONNECT_OTP, payload });
        return new Promise((resolve, reject) => {
            this.connectOtpResolver = { resolve, reject };
        });
    }
    async isConnected() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_IS_CONNECTED,
            payload: undefined
        });
        return new Promise((resolve, reject) => {
            this.isConnectedResolver = { resolve, reject };
        });
    }
    async getChainId() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_GET_CHAIN_ID });
        return new Promise((resolve, reject) => {
            this.getChainIdResolver = { resolve, reject };
        });
    }
    async getFarcasterUri() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_GET_FARCASTER_URI
        });
        return new Promise((resolve, reject) => {
            this.getFarcasterUriResolver = { resolve, reject };
        });
    }
    async getSocialRedirectUri(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_GET_SOCIAL_REDIRECT_URI,
            payload
        });
        return new Promise((resolve, reject) => {
            this.getSocialRedirectUriResolver = { resolve, reject };
        });
    }
    async updateEmail(payload) {
        await this.w3mFrame.frameLoadPromise;
        W3mFrameHelpers.checkIfAllowedToTriggerEmail();
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_UPDATE_EMAIL, payload });
        return new Promise((resolve, reject) => {
            this.updateEmailResolver = { resolve, reject };
        });
    }
    async updateEmailPrimaryOtp(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_UPDATE_EMAIL_PRIMARY_OTP,
            payload
        });
        return new Promise((resolve, reject) => {
            this.updateEmailPrimaryOtpResolver = { resolve, reject };
        });
    }
    async updateEmailSecondaryOtp(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_UPDATE_EMAIL_SECONDARY_OTP,
            payload
        });
        return new Promise((resolve, reject) => {
            this.updateEmailSecondaryOtpResolver = { resolve, reject };
        });
    }
    async syncTheme(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_SYNC_THEME, payload });
        return new Promise((resolve, reject) => {
            this.syncThemeResolver = { resolve, reject };
        });
    }
    async syncDappData(payload) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_SYNC_DAPP_DATA, payload });
        return new Promise((resolve, reject) => {
            this.syncDappDataResolver = { resolve, reject };
        });
    }
    async getSmartAccountEnabledNetworks() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_GET_SMART_ACCOUNT_ENABLED_NETWORKS
        });
        return new Promise((resolve, reject) => {
            this.smartAccountEnabledNetworksResolver = { resolve, reject };
        });
    }
    async setPreferredAccount(type) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_SET_PREFERRED_ACCOUNT,
            payload: { type }
        });
        return new Promise((resolve, reject) => {
            this.setPreferredAccountResolver = { resolve, reject };
        });
    }
    async connect(payload) {
        const chainId = payload?.chainId ?? this.getLastUsedChainId() ?? 1;
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_GET_USER,
            payload: { chainId }
        });
        return new Promise((resolve, reject) => {
            if (!this.connectResolver) {
                this.connectResolver = { resolve, reject };
            }
        });
    }
    async connectSocial(uri) {
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_CONNECT_SOCIAL,
            payload: { uri }
        });
        return new Promise((resolve, reject) => {
            this.connectSocialResolver = { resolve, reject };
        });
    }
    async connectFarcaster() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_CONNECT_FARCASTER
        });
        return new Promise((resolve, reject) => {
            this.connectFarcasterResolver = { resolve, reject };
        });
    }
    async switchNetwork(chainId) {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_SWITCH_NETWORK,
            payload: { chainId }
        });
        return new Promise((resolve, reject) => {
            this.switchChainResolver = { resolve, reject };
        });
    }
    async disconnect() {
        await this.w3mFrame.frameLoadPromise;
        this.w3mFrame.events.postAppEvent({ type: W3mFrameConstants.APP_SIGN_OUT });
        return new Promise((resolve, reject) => {
            this.disconnectResolver = { resolve, reject };
        });
    }
    async request(req) {
        await this.w3mFrame.frameLoadPromise;
        if (W3mFrameRpcConstants.GET_CHAIN_ID === req.method) {
            return this.getLastUsedChainId();
        }
        this.w3mFrame.events.postAppEvent({
            type: W3mFrameConstants.APP_RPC_REQUEST,
            payload: req
        });
        return new Promise((resolve, reject) => {
            this.rpcRequestResolver = { resolve, reject };
        });
    }
    onRpcRequest(callback) {
        this.w3mFrame.events.onAppEvent(event => {
            if (event.type.includes(W3mFrameConstants.RPC_METHOD_KEY)) {
                callback(event?.payload);
            }
        });
    }
    onRpcResponse(callback) {
        this.w3mFrame.events.onFrameEvent(event => {
            if (event.type.includes(W3mFrameConstants.RPC_METHOD_KEY)) {
                callback(event);
            }
        });
    }
    onIsConnected(callback) {
        this.w3mFrame.events.onFrameEvent(event => {
            if (event.type === W3mFrameConstants.FRAME_GET_USER_SUCCESS) {
                callback(event.payload);
            }
        });
    }
    onNotConnected(callback) {
        this.w3mFrame.events.onFrameEvent(event => {
            if (event.type === W3mFrameConstants.FRAME_IS_CONNECTED_ERROR) {
                callback();
            }
            if (event.type === W3mFrameConstants.FRAME_IS_CONNECTED_SUCCESS &&
                !event.payload.isConnected) {
                callback();
            }
        });
    }
    onSetPreferredAccount(callback) {
        this.w3mFrame.events.onFrameEvent(event => {
            if (event.type === W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_SUCCESS) {
                callback(event.payload);
            }
            else if (event.type === W3mFrameConstants.FRAME_SET_PREFERRED_ACCOUNT_ERROR) {
                callback({ type: W3mFrameRpcConstants.ACCOUNT_TYPES.EOA });
            }
        });
    }
    onGetSmartAccountEnabledNetworks(callback) {
        this.w3mFrame.events.onFrameEvent(event => {
            if (event.type === W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_SUCCESS) {
                callback(event.payload.smartAccountEnabledNetworks);
            }
            else if (event.type === W3mFrameConstants.FRAME_GET_SMART_ACCOUNT_ENABLED_NETWORKS_ERROR) {
                callback([]);
            }
        });
    }
    onConnectEmailSuccess(event) {
        this.connectEmailResolver?.resolve(event.payload);
        this.setNewLastEmailLoginTime();
    }
    onConnectEmailError(event) {
        this.connectEmailResolver?.reject(event.payload.message);
    }
    onGetFarcasterUriSuccess(event) {
        this.getFarcasterUriResolver?.resolve(event.payload);
    }
    onGetFarcasterUriError(event) {
        this.getFarcasterUriResolver?.reject(event.payload.message);
    }
    onConnectFarcasterSuccess(event) {
        if (event.payload.userName) {
            this.setSocialLoginSuccess(event.payload.userName);
        }
        this.connectFarcasterResolver?.resolve(event.payload);
    }
    onConnectFarcasterError(event) {
        this.connectFarcasterResolver?.reject(event.payload.message);
    }
    onConnectDeviceSuccess() {
        this.connectDeviceResolver?.resolve(undefined);
    }
    onConnectDeviceError(event) {
        this.connectDeviceResolver?.reject(event.payload.message);
    }
    onConnectOtpSuccess() {
        this.connectOtpResolver?.resolve(undefined);
    }
    onConnectOtpError(event) {
        this.connectOtpResolver?.reject(event.payload.message);
    }
    onConnectSuccess(event) {
        this.setLoginSuccess(event.payload.email);
        this.setLastUsedChainId(event.payload.chainId);
        this.connectResolver?.resolve(event.payload);
        this.connectResolver = undefined;
    }
    onConnectError(event) {
        this.connectResolver?.reject(event.payload.message);
        this.connectResolver = undefined;
    }
    onConnectSocialSuccess(event) {
        if (event.payload.userName) {
            this.setSocialLoginSuccess(event.payload.userName);
        }
        this.connectSocialResolver?.resolve(event.payload);
    }
    onConnectSocialError(event) {
        this.connectSocialResolver?.reject(event.payload.message);
    }
    onIsConnectedSuccess(event) {
        if (!event.payload.isConnected) {
            this.deleteAuthLoginCache();
        }
        this.isConnectedResolver?.resolve(event.payload);
    }
    onIsConnectedError(event) {
        this.isConnectedResolver?.reject(event.payload.message);
    }
    onGetChainIdSuccess(event) {
        this.setLastUsedChainId(event.payload.chainId);
        this.getChainIdResolver?.resolve(event.payload);
    }
    onGetChainIdError(event) {
        this.getChainIdResolver?.reject(event.payload.message);
    }
    onGetSocialRedirectUriSuccess(event) {
        this.getSocialRedirectUriResolver?.resolve(event.payload);
    }
    onGetSocialRedirectUriError(event) {
        this.getSocialRedirectUriResolver?.reject(event.payload.message);
    }
    onSignOutSuccess() {
        this.disconnectResolver?.resolve(undefined);
        this.deleteAuthLoginCache();
    }
    onSignOutError(event) {
        this.disconnectResolver?.reject(event.payload.message);
    }
    onSwitchChainSuccess(event) {
        this.setLastUsedChainId(event.payload.chainId);
        this.switchChainResolver?.resolve(event.payload);
    }
    onSwitchChainError(event) {
        this.switchChainResolver?.reject(event.payload.message);
    }
    onRpcRequestSuccess(event) {
        this.rpcRequestResolver?.resolve(event.payload);
    }
    onRpcRequestError(event) {
        this.rpcRequestResolver?.reject(event.payload.message);
    }
    onSessionUpdate(event) {
        const { payload } = event;
        if (payload) {
        }
    }
    onUpdateEmailSuccess(event) {
        this.updateEmailResolver?.resolve(event.payload);
        this.setNewLastEmailLoginTime();
    }
    onUpdateEmailError(event) {
        this.updateEmailResolver?.reject(event.payload.message);
    }
    onUpdateEmailPrimaryOtpSuccess() {
        this.updateEmailPrimaryOtpResolver?.resolve(undefined);
    }
    onUpdateEmailPrimaryOtpError(event) {
        this.updateEmailPrimaryOtpResolver?.reject(event.payload.message);
    }
    onUpdateEmailSecondaryOtpSuccess(event) {
        const { newEmail } = event.payload;
        this.setLoginSuccess(newEmail);
        this.updateEmailSecondaryOtpResolver?.resolve({ newEmail });
    }
    onUpdateEmailSecondaryOtpError(event) {
        this.updateEmailSecondaryOtpResolver?.reject(event.payload.message);
    }
    onSyncThemeSuccess() {
        this.syncThemeResolver?.resolve(undefined);
    }
    onSyncThemeError(event) {
        this.syncThemeResolver?.reject(event.payload.message);
    }
    onSyncDappDataSuccess() {
        this.syncDappDataResolver?.resolve(undefined);
    }
    onSyncDappDataError(event) {
        this.syncDappDataResolver?.reject(event.payload.message);
    }
    onSmartAccountEnabledNetworksSuccess(event) {
        this.persistSmartAccountEnabledNetworks(event.payload.smartAccountEnabledNetworks);
        this.smartAccountEnabledNetworksResolver?.resolve(event.payload);
    }
    onSmartAccountEnabledNetworksError(event) {
        this.persistSmartAccountEnabledNetworks([]);
        this.smartAccountEnabledNetworksResolver?.reject(event.payload.message);
    }
    onSetPreferredAccountSuccess() {
        this.setPreferredAccountResolver?.resolve(undefined);
    }
    onSetPreferredAccountError() {
        this.setPreferredAccountResolver?.reject();
    }
    setNewLastEmailLoginTime() {
        W3mFrameStorage.set(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME, Date.now().toString());
    }
    setSocialLoginSuccess(username) {
        W3mFrameStorage.set(W3mFrameConstants.SOCIAL_USERNAME, username);
    }
    setLoginSuccess(email) {
        if (email) {
            W3mFrameStorage.set(W3mFrameConstants.EMAIL, email);
        }
        W3mFrameStorage.set(W3mFrameConstants.EMAIL_LOGIN_USED_KEY, 'true');
        W3mFrameStorage.delete(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME);
    }
    deleteAuthLoginCache() {
        W3mFrameStorage.delete(W3mFrameConstants.EMAIL_LOGIN_USED_KEY);
        W3mFrameStorage.delete(W3mFrameConstants.EMAIL);
        W3mFrameStorage.delete(W3mFrameConstants.LAST_USED_CHAIN_KEY);
        W3mFrameStorage.delete(W3mFrameConstants.SOCIAL_USERNAME);
        W3mFrameStorage.delete(W3mFrameConstants.SOCIAL, true);
    }
    setLastUsedChainId(chainId) {
        W3mFrameStorage.set(W3mFrameConstants.LAST_USED_CHAIN_KEY, String(chainId));
    }
    getLastUsedChainId() {
        return Number(W3mFrameStorage.get(W3mFrameConstants.LAST_USED_CHAIN_KEY));
    }
    persistSmartAccountEnabledNetworks(networks) {
        W3mFrameStorage.set(W3mFrameConstants.SMART_ACCOUNT_ENABLED_NETWORKS, networks.join(','));
    }
}
//# sourceMappingURL=W3mFrameProvider.js.map