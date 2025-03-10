import type { Web3ModalOptions } from '../src/client.js';
import { Web3Modal } from '../src/client.js';
export type { Web3ModalOptions } from '../src/client.js';
export declare function createWeb3Modal(options: Web3ModalOptions): Web3Modal;
export declare function useWeb3ModalProvider(): {
    walletProvider: import("vue").Ref<{
        request: (request: {
            method: string;
            params?: any[] | Record<string, any> | undefined;
        }) => Promise<any>;
    } | undefined>;
    walletProviderType: import("vue").Ref<any>;
};
export declare function useDisconnect(): {
    disconnect: () => Promise<void>;
};
export declare function useSwitchNetwork(): {
    switchNetwork: (chainId: number) => Promise<void>;
};
export declare function useWeb3ModalAccount(): {
    address: import("vue").Ref<string | undefined>;
    isConnected: import("vue").Ref<any>;
    chainId: import("vue").Ref<any>;
};
export declare function useWeb3ModalError(): {
    error: import("vue").Ref<any>;
};
export { useWeb3ModalTheme, useWeb3Modal, useWeb3ModalState, useWeb3ModalEvents, useWalletInfo } from '@web3modal/scaffold-vue';
export { defaultConfig } from '../src/utils/defaultConfig.js';
