import type { CaipNetwork, Connector, WcWallet } from '../utils/TypeUtil.js';
import type { SwapInputTarget } from './SwapController.js';
type TransactionAction = {
    goBack: boolean;
    view: RouterControllerState['view'] | null;
    close?: boolean;
    replace?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
};
export interface RouterControllerState {
    view: 'Account' | 'AccountSettings' | 'SelectAddresses' | 'AllWallets' | 'ApproveTransaction' | 'BuyInProgress' | 'WalletCompatibleNetworks' | 'ChooseAccountName' | 'Connect' | 'ConnectingExternal' | 'ConnectingFarcaster' | 'ConnectingWalletConnect' | 'ConnectingSiwe' | 'ConnectingSocial' | 'ConnectSocials' | 'ConnectWallets' | 'Downloads' | 'EmailVerifyOtp' | 'EmailVerifyDevice' | 'GetWallet' | 'Networks' | 'OnRampActivity' | 'OnRampFiatSelect' | 'OnRampProviders' | 'OnRampTokenSelect' | 'Profile' | 'RegisterAccountName' | 'RegisterAccountNameSuccess' | 'SwitchNetwork' | 'SwitchAddress' | 'Transactions' | 'UnsupportedChain' | 'UpdateEmailWallet' | 'UpdateEmailPrimaryOtp' | 'UpdateEmailSecondaryOtp' | 'UpgradeEmailWallet' | 'UpgradeToSmartAccount' | 'WalletReceive' | 'WalletSend' | 'WalletSendPreview' | 'WalletSendSelectToken' | 'WhatIsANetwork' | 'WhatIsAWallet' | 'WhatIsABuy' | 'Swap' | 'SwapSelectToken' | 'SwapPreview';
    history: RouterControllerState['view'][];
    data?: {
        connector?: Connector;
        wallet?: WcWallet;
        network?: CaipNetwork;
        email?: string;
        newEmail?: string;
        target?: SwapInputTarget;
        swapUnsupportedChain?: boolean;
    };
    transactionStack: TransactionAction[];
}
export declare const RouterController: {
    state: RouterControllerState;
    subscribeKey<K extends keyof RouterControllerState>(key: K, callback: (value: RouterControllerState[K]) => void): () => void;
    pushTransactionStack(action: TransactionAction): void;
    popTransactionStack(cancel?: boolean): void;
    push(view: RouterControllerState['view'], data?: RouterControllerState['data']): void;
    reset(view: RouterControllerState['view']): void;
    replace(view: RouterControllerState['view'], data?: RouterControllerState['data']): void;
    goBack(): void;
    goBackToIndex(historyIndex: number): void;
};
export {};
