import type { Connector, EstimateGasTransactionArgs, SendTransactionArgs, WcWallet, WriteContractArgs } from '../utils/TypeUtil.js';
import { type W3mFrameTypes } from '@web3modal/wallet';
import type { Chain } from '@web3modal/common';
export interface ConnectExternalOptions {
    id: Connector['id'];
    type: Connector['type'];
    provider?: Connector['provider'];
    info?: Connector['info'];
}
export interface ConnectionControllerClient {
    connectWalletConnect: (onUri: (uri: string) => void) => Promise<void>;
    disconnect: () => Promise<void>;
    signMessage: (message: string) => Promise<string>;
    sendTransaction: (args: SendTransactionArgs) => Promise<`0x${string}` | null>;
    estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>;
    parseUnits: (value: string, decimals: number) => bigint;
    formatUnits: (value: bigint, decimals: number) => string;
    connectExternal?: (options: ConnectExternalOptions) => Promise<void>;
    reconnectExternal?: (options: ConnectExternalOptions) => Promise<void>;
    checkInstalled?: (ids?: string[]) => boolean;
    writeContract: (args: WriteContractArgs) => Promise<`0x${string}` | null>;
    getEnsAddress: (value: string) => Promise<false | string>;
    getEnsAvatar: (value: string) => Promise<false | string>;
}
export interface ConnectionControllerState {
    _client?: ConnectionControllerClient;
    wcUri?: string;
    wcPairingExpiry?: number;
    wcLinking?: {
        href: string;
        name: string;
    };
    wcError?: boolean;
    recentWallet?: WcWallet;
    buffering: boolean;
}
export declare const ConnectionController: {
    state: ConnectionControllerState;
    subscribeKey<K extends keyof ConnectionControllerState>(key: K, callback: (value: ConnectionControllerState[K]) => void): () => void;
    _getClient(): ConnectionControllerClient;
    setClient(client: ConnectionControllerClient): void;
    connectWalletConnect(): Promise<void>;
    connectExternal(options: ConnectExternalOptions, chain?: Chain): Promise<void>;
    reconnectExternal(options: ConnectExternalOptions): Promise<void>;
    setPreferredAccountType(accountType: W3mFrameTypes.AccountType): Promise<void>;
    signMessage(message: string): Promise<string>;
    parseUnits(value: string, decimals: number): bigint;
    formatUnits(value: bigint, decimals: number): string;
    sendTransaction(args: SendTransactionArgs): Promise<`0x${string}` | null>;
    estimateGas(args: EstimateGasTransactionArgs): Promise<bigint>;
    writeContract(args: WriteContractArgs): Promise<`0x${string}` | null>;
    getEnsAddress(value: string): Promise<string | false>;
    getEnsAvatar(value: string): Promise<string | false>;
    checkInstalled(ids?: string[]): boolean | undefined;
    resetWcConnection(): void;
    setWcLinking(wcLinking: ConnectionControllerState['wcLinking']): void;
    setWcError(wcError: ConnectionControllerState['wcError']): void;
    setRecentWallet(wallet: ConnectionControllerState['recentWallet']): void;
    setBuffering(buffering: ConnectionControllerState['buffering']): void;
    disconnect(): Promise<void>;
};
