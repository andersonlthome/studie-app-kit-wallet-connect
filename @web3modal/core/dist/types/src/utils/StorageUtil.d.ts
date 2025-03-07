import type { WcWallet, ConnectorType, SocialProvider } from './TypeUtil.js';
export declare const StorageUtil: {
    setWalletConnectDeepLink({ href, name }: {
        href: string;
        name: string;
    }): void;
    getWalletConnectDeepLink(): any;
    deleteWalletConnectDeepLink(): void;
    setWeb3ModalRecent(wallet: WcWallet): void;
    getRecentWallets(): WcWallet[];
    setConnectedWalletImageUrl(imageUrl: string): void;
    removeConnectedWalletImageUrl(): void;
    getConnectedWalletImageUrl(): string | null | undefined;
    setConnectedConnector(connectorType: ConnectorType): void;
    getConnectedConnector(): ConnectorType | undefined;
    setConnectedSocialProvider(socialProvider: SocialProvider): void;
    getConnectedSocialProvider(): string | null | undefined;
    getConnectedSocialUsername(): string | null | undefined;
};
