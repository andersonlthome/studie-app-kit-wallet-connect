var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import styles from './styles.js';
import { ApiController, ChainController, ConnectorController, OptionsController, StorageUtil } from '@web3modal/core';
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common';
import { state } from 'lit/decorators.js';
import { ConstantsUtil } from '@web3modal/scaffold-utils';
import { WalletUtil } from '../../utils/WalletUtil.js';
let W3mConnectorList = class W3mConnectorList extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.connectors = ConnectorController.state.connectors;
        this.unsubscribe.push(ConnectorController.subscribeKey('connectors', val => (this.connectors = val)));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        const { custom, recent, announced, coinbase, injected, recommended, featured, external } = this.getConnectorsByType();
        return html `
      <wui-flex flexDirection="column" gap="xs">
        <w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>
        ${recent.length ? html `<w3m-connect-recent-widget></w3m-connect-recent-widget>` : null}
        ${announced.length
            ? html `<w3m-connect-announced-widget></w3m-connect-announced-widget>`
            : null}
        ${injected.length
            ? html `<w3m-connect-injected-widget></w3m-connect-injected-widget>`
            : null}
        ${featured.length
            ? html `<w3m-connect-featured-widget></w3m-connect-featured-widget>`
            : null}
        ${custom?.length ? html `<w3m-connect-custom-widget></w3m-connect-custom-widget>` : null}
        ${coinbase ? html `<w3m-connect-coinbase-widget></w3m-connect-coinbase-widget>` : null}
        ${external.length
            ? html `<w3m-connect-external-widget></w3m-connect-external-widget>`
            : null}
        ${recommended.length
            ? html `<w3m-connect-recommended-widget></w3m-connect-recommended-widget>`
            : null}
      </wui-flex>
    `;
    }
    getConnectorsByType() {
        const { featured, recommended } = ApiController.state;
        const { customWallets: custom } = OptionsController.state;
        const recent = StorageUtil.getRecentWallets();
        const filteredRecommended = WalletUtil.filterOutDuplicateWallets(recommended);
        const filteredFeatured = WalletUtil.filterOutDuplicateWallets(featured);
        const announced = this.connectors.filter(connector => connector.type === 'ANNOUNCED');
        const injected = this.connectors.filter(connector => connector.type === 'INJECTED');
        const external = this.connectors.filter(connector => connector.type === 'EXTERNAL');
        const coinbase = this.connectors.find(connector => connector.id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID);
        const isEVM = ChainController.state.activeChain === CommonConstantsUtil.CHAIN.EVM;
        const includeAnnouncedAndInjected = isEVM ? OptionsController.state.enableEIP6963 : true;
        return {
            custom,
            recent,
            coinbase,
            external,
            announced: includeAnnouncedAndInjected ? announced : [],
            injected: includeAnnouncedAndInjected ? injected : [],
            recommended: filteredRecommended,
            featured: filteredFeatured
        };
    }
};
W3mConnectorList.styles = styles;
__decorate([
    state()
], W3mConnectorList.prototype, "connectors", void 0);
W3mConnectorList = __decorate([
    customElement('w3m-connector-list')
], W3mConnectorList);
export { W3mConnectorList };
//# sourceMappingURL=index.js.map