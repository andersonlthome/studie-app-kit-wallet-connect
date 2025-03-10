import { type Balance } from '@web3modal/common';
export interface TxParams {
    receiverAddress: string;
    sendTokenAmount: number;
    gasPrice: bigint;
    decimals: string;
}
export interface ContractWriteParams {
    receiverAddress: string;
    tokenAddress: string;
    sendTokenAmount: number;
    decimals: string;
}
export interface SendControllerState {
    token?: Balance;
    sendTokenAmount?: number;
    receiverAddress?: string;
    receiverProfileName?: string;
    receiverProfileImageUrl?: string;
    gasPrice?: bigint;
    gasPriceInUSD?: number;
    loading: boolean;
}
export declare const SendController: {
    state: SendControllerState;
    subscribe(callback: (newState: SendControllerState) => void): () => void;
    subscribeKey<K extends keyof SendControllerState>(key: K, callback: (value: SendControllerState[K]) => void): () => void;
    setToken(token: SendControllerState['token']): void;
    setTokenAmount(sendTokenAmount: SendControllerState['sendTokenAmount']): void;
    setReceiverAddress(receiverAddress: SendControllerState['receiverAddress']): void;
    setReceiverProfileImageUrl(receiverProfileImageUrl: SendControllerState['receiverProfileImageUrl']): void;
    setReceiverProfileName(receiverProfileName: SendControllerState['receiverProfileName']): void;
    setGasPrice(gasPrice: SendControllerState['gasPrice']): void;
    setGasPriceInUsd(gasPriceInUSD: SendControllerState['gasPriceInUSD']): void;
    setLoading(loading: SendControllerState['loading']): void;
    sendToken(): void;
    sendNativeToken(params: TxParams): Promise<void>;
    sendERC20Token(params: ContractWriteParams): Promise<void>;
    resetSend(): void;
};
