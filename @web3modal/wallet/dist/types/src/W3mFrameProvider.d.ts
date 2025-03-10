import type { W3mFrameTypes } from './W3mFrameTypes.js';
import { type ChunkLoggerController, type Logger } from '@walletconnect/logger';
export declare class W3mFrameProvider {
    private w3mFrame;
    private connectEmailResolver;
    private connectDeviceResolver;
    private connectOtpResolver;
    private connectResolver;
    private connectSocialResolver;
    private connectFarcasterResolver;
    private getFarcasterUriResolver;
    private disconnectResolver;
    private isConnectedResolver;
    private getChainIdResolver;
    private getSocialRedirectUriResolver;
    private switchChainResolver;
    private rpcRequestResolver;
    private updateEmailResolver;
    private updateEmailPrimaryOtpResolver;
    private updateEmailSecondaryOtpResolver;
    private syncThemeResolver;
    private syncDappDataResolver;
    private smartAccountEnabledNetworksResolver;
    private setPreferredAccountResolver;
    logger: Logger;
    chunkLoggerController: ChunkLoggerController | null;
    constructor(projectId: string);
    getLoginEmailUsed(): boolean;
    getEmail(): string | null;
    rejectRpcRequest(): void;
    connectEmail(payload: W3mFrameTypes.Requests['AppConnectEmailRequest']): Promise<{
        action: "VERIFY_DEVICE" | "VERIFY_OTP";
    }>;
    connectDevice(): Promise<unknown>;
    connectOtp(payload: W3mFrameTypes.Requests['AppConnectOtpRequest']): Promise<unknown>;
    isConnected(): Promise<{
        isConnected: boolean;
    }>;
    getChainId(): Promise<{
        chainId: number;
    }>;
    getFarcasterUri(): Promise<{
        url: string;
    }>;
    getSocialRedirectUri(payload: W3mFrameTypes.Requests['AppGetSocialRedirectUriRequest']): Promise<{
        uri: string;
    }>;
    updateEmail(payload: W3mFrameTypes.Requests['AppUpdateEmailRequest']): Promise<{
        action: "VERIFY_PRIMARY_OTP" | "VERIFY_SECONDARY_OTP";
    }>;
    updateEmailPrimaryOtp(payload: W3mFrameTypes.Requests['AppUpdateEmailPrimaryOtpRequest']): Promise<unknown>;
    updateEmailSecondaryOtp(payload: W3mFrameTypes.Requests['AppUpdateEmailSecondaryOtpRequest']): Promise<{
        newEmail: string;
    }>;
    syncTheme(payload: W3mFrameTypes.Requests['AppSyncThemeRequest']): Promise<unknown>;
    syncDappData(payload: W3mFrameTypes.Requests['AppSyncDappDataRequest']): Promise<unknown>;
    getSmartAccountEnabledNetworks(): Promise<{
        smartAccountEnabledNetworks: number[];
    }>;
    setPreferredAccount(type: W3mFrameTypes.AccountType): Promise<unknown>;
    connect(payload?: W3mFrameTypes.Requests['AppGetUserRequest']): Promise<{
        chainId: number;
        address: string;
        email?: string | null | undefined;
        smartAccountDeployed?: boolean | undefined;
        accounts?: {
            type: "eoa" | "smartAccount";
            address: string;
        }[] | undefined;
        preferredAccountType?: string | undefined;
    }>;
    connectSocial(uri: string): Promise<{
        chainId: number;
        address: string;
        email?: string | null | undefined;
        smartAccountDeployed?: boolean | undefined;
        accounts?: {
            type: "eoa" | "smartAccount";
            address: string;
        }[] | undefined;
        preferredAccountType?: string | undefined;
    }>;
    connectFarcaster(): Promise<unknown>;
    switchNetwork(chainId: number): Promise<{
        chainId: number;
    }>;
    disconnect(): Promise<unknown>;
    request(req: W3mFrameTypes.RPCRequest): Promise<any>;
    onRpcRequest(callback: (request: W3mFrameTypes.RPCRequest) => void): void;
    onRpcResponse(callback: (request: W3mFrameTypes.FrameEvent) => void): void;
    onIsConnected(callback: (request: W3mFrameTypes.Responses['FrameGetUserResponse']) => void): void;
    onNotConnected(callback: () => void): void;
    onSetPreferredAccount(callback: ({ type, address }: {
        type: string;
        address?: string;
    }) => void): void;
    onGetSmartAccountEnabledNetworks(callback: (networks: number[]) => void): void;
    private onConnectEmailSuccess;
    private onConnectEmailError;
    private onGetFarcasterUriSuccess;
    private onGetFarcasterUriError;
    private onConnectFarcasterSuccess;
    private onConnectFarcasterError;
    private onConnectDeviceSuccess;
    private onConnectDeviceError;
    private onConnectOtpSuccess;
    private onConnectOtpError;
    private onConnectSuccess;
    private onConnectError;
    private onConnectSocialSuccess;
    private onConnectSocialError;
    private onIsConnectedSuccess;
    private onIsConnectedError;
    private onGetChainIdSuccess;
    private onGetChainIdError;
    private onGetSocialRedirectUriSuccess;
    private onGetSocialRedirectUriError;
    private onSignOutSuccess;
    private onSignOutError;
    private onSwitchChainSuccess;
    private onSwitchChainError;
    private onRpcRequestSuccess;
    private onRpcRequestError;
    private onSessionUpdate;
    private onUpdateEmailSuccess;
    private onUpdateEmailError;
    private onUpdateEmailPrimaryOtpSuccess;
    private onUpdateEmailPrimaryOtpError;
    private onUpdateEmailSecondaryOtpSuccess;
    private onUpdateEmailSecondaryOtpError;
    private onSyncThemeSuccess;
    private onSyncThemeError;
    private onSyncDappDataSuccess;
    private onSyncDappDataError;
    private onSmartAccountEnabledNetworksSuccess;
    private onSmartAccountEnabledNetworksError;
    private onSetPreferredAccountSuccess;
    private onSetPreferredAccountError;
    private setNewLastEmailLoginTime;
    private setSocialLoginSuccess;
    private setLoginSuccess;
    private deleteAuthLoginCache;
    private setLastUsedChainId;
    private getLastUsedChainId;
    private persistSmartAccountEnabledNetworks;
}
