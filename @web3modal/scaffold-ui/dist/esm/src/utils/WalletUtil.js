import { ConnectorController, CoreHelperUtil, OptionsController, StorageUtil } from '@web3modal/core';
export const WalletUtil = {
    filterOutDuplicatesByRDNS(wallets) {
        const connectors = OptionsController.state.enableEIP6963
            ? ConnectorController.state.connectors
            : [];
        const recent = StorageUtil.getRecentWallets();
        const connectorRDNSs = connectors
            .map(connector => connector.info?.rdns)
            .filter(Boolean);
        const recentRDNSs = recent.map(wallet => wallet.rdns).filter(Boolean);
        const allRDNSs = connectorRDNSs.concat(recentRDNSs);
        if (allRDNSs.includes('io.metamask.mobile') && CoreHelperUtil.isMobile()) {
            const index = allRDNSs.indexOf('io.metamask.mobile');
            allRDNSs[index] = 'io.metamask';
        }
        const filtered = wallets.filter(wallet => !allRDNSs.includes(String(wallet?.rdns)));
        return filtered;
    },
    filterOutDuplicatesByIds(wallets) {
        const connectors = ConnectorController.state.connectors;
        const recent = StorageUtil.getRecentWallets();
        const connectorIds = connectors.map(connector => connector.explorerId);
        const recentIds = recent.map(wallet => wallet.id);
        const allIds = connectorIds.concat(recentIds);
        const filtered = wallets.filter(wallet => !allIds.includes(wallet?.id));
        return filtered;
    },
    filterOutDuplicateWallets(wallets) {
        const uniqueByRDNS = this.filterOutDuplicatesByRDNS(wallets);
        const uniqueWallets = this.filterOutDuplicatesByIds(uniqueByRDNS);
        return uniqueWallets;
    }
};
//# sourceMappingURL=WalletUtil.js.map