var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccountController, ConnectionController, ConnectorController, EventsController, ModalController, OptionsController, RouterController } from '@web3modal/core';
import { customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import styles from './styles.js';
const BETA_SCREENS = ['Swap', 'SwapSelectToken', 'SwapPreview'];
function headings() {
    const connectorName = RouterController.state.data?.connector?.name;
    const walletName = RouterController.state.data?.wallet?.name;
    const networkName = RouterController.state.data?.network?.name;
    const name = walletName ?? connectorName;
    const connectors = ConnectorController.getConnectors();
    const isEmail = connectors.length === 1 && connectors[0]?.id === 'w3m-email';
    return {
        Connect: `Connect ${isEmail ? 'Email' : ''} Wallet`,
        ChooseAccountName: undefined,
        Account: undefined,
        AccountSettings: undefined,
        AllWallets: 'All Wallets',
        ApproveTransaction: 'Approve Transaction',
        BuyInProgress: 'Buy',
        ConnectingExternal: name ?? 'Connect Wallet',
        ConnectingWalletConnect: name ?? 'WalletConnect',
        ConnectingSiwe: 'Sign In',
        Convert: 'Convert',
        ConvertSelectToken: 'Select token',
        ConvertPreview: 'Preview convert',
        Downloads: name ? `Get ${name}` : 'Downloads',
        EmailVerifyOtp: 'Confirm Email',
        EmailVerifyDevice: 'Register Device',
        GetWallet: 'Get a wallet',
        Networks: 'Choose Network',
        OnRampProviders: 'Choose Provider',
        OnRampActivity: 'Activity',
        OnRampTokenSelect: 'Select Token',
        OnRampFiatSelect: 'Select Currency',
        Profile: undefined,
        SelectAddresses: 'Select accounts',
        SwitchNetwork: networkName ?? 'Switch Network',
        SwitchAddress: 'Switch Address',
        Transactions: 'Activity',
        UnsupportedChain: 'Switch Network',
        UpgradeEmailWallet: 'Upgrade your Wallet',
        UpgradeToSmartAccount: undefined,
        UpdateEmailWallet: 'Edit Email',
        UpdateEmailPrimaryOtp: 'Confirm Current Email',
        UpdateEmailSecondaryOtp: 'Confirm New Email',
        WhatIsABuy: 'What is Buy?',
        RegisterAccountName: 'Choose name',
        RegisterAccountNameSuccess: '',
        WalletReceive: 'Receive',
        WalletCompatibleNetworks: 'Compatible Networks',
        Swap: 'Swap',
        SwapSelectToken: 'Select token',
        SwapPreview: 'Preview swap',
        WalletSend: 'Send',
        WalletSendPreview: 'Review send',
        WalletSendSelectToken: 'Select Token',
        WhatIsANetwork: 'What is a network?',
        WhatIsAWallet: 'What is a wallet?',
        ConnectWallets: 'Connect wallet',
        ConnectSocials: 'All socials',
        ConnectingSocial: AccountController.state.socialProvider
            ? AccountController.state.socialProvider
            : 'Connect Social',
        ConnectingFarcaster: 'Farcaster'
    };
}
let W3mHeader = class W3mHeader extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.heading = headings()[RouterController.state.view];
        this.buffering = false;
        this.showBack = false;
        this.unsubscribe.push(RouterController.subscribeKey('view', val => {
            this.onViewChange(val);
            this.onHistoryChange();
        }), ConnectionController.subscribeKey('buffering', val => (this.buffering = val)));
    }
    disconnectCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      <wui-flex .padding=${this.getPadding()} justifyContent="space-between" alignItems="center">
        ${this.dynamicButtonTemplate()} ${this.titleTemplate()}
        <wui-icon-link
          ?disabled=${this.buffering}
          icon="close"
          @click=${this.onClose.bind(this)}
          data-testid="w3m-header-close"
        ></wui-icon-link>
      </wui-flex>
    `;
    }
    onWalletHelp() {
        EventsController.sendEvent({ type: 'track', event: 'CLICK_WALLET_HELP' });
        RouterController.push('WhatIsAWallet');
    }
    async onClose() {
        if (OptionsController.state.isSiweEnabled) {
            const { SIWEController } = await import('@web3modal/siwe');
            if (SIWEController.state.status !== 'success') {
                await ConnectionController.disconnect();
            }
        }
        ModalController.close();
    }
    titleTemplate() {
        const isBeta = BETA_SCREENS.includes(RouterController.state.view);
        return html `
      <wui-flex class="w3m-header-title" alignItems="center" gap="xs">
        <wui-text variant="paragraph-700" color="fg-100">${this.heading}</wui-text>
        ${isBeta ? html `<wui-tag variant="main">Beta</wui-tag>` : null}
      </wui-flex>
    `;
    }
    dynamicButtonTemplate() {
        const { view } = RouterController.state;
        const isConnectHelp = view === 'Connect';
        const isApproveTransaction = view === 'ApproveTransaction';
        const isUpgradeToSmartAccounts = view === 'UpgradeToSmartAccount';
        const isConnectingSIWEView = view === 'ConnectingSiwe';
        const shouldHideBack = isApproveTransaction || isUpgradeToSmartAccounts || isConnectingSIWEView;
        if (this.showBack && !shouldHideBack) {
            return html `<wui-icon-link
        id="dynamic"
        icon="chevronLeft"
        ?disabled=${this.buffering}
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-link>`;
        }
        return html `<wui-icon-link
      data-hidden=${!isConnectHelp}
      id="dynamic"
      icon="helpCircle"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-link>`;
    }
    getPadding() {
        if (this.heading) {
            return ['l', '2l', 'l', '2l'];
        }
        return ['l', '2l', '0', '2l'];
    }
    async onViewChange(view) {
        const headingEl = this.shadowRoot?.querySelector('wui-flex.w3m-header-title');
        if (headingEl) {
            const preset = headings()[view];
            await headingEl.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            }).finished;
            this.heading = preset;
            headingEl.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            });
        }
    }
    async onHistoryChange() {
        const { history } = RouterController.state;
        const buttonEl = this.shadowRoot?.querySelector('#dynamic');
        if (history.length > 1 && !this.showBack && buttonEl) {
            await buttonEl.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            }).finished;
            this.showBack = true;
            buttonEl.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            });
        }
        else if (history.length <= 1 && this.showBack && buttonEl) {
            await buttonEl.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            }).finished;
            this.showBack = false;
            buttonEl.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            });
        }
    }
    onGoBack() {
        RouterController.goBack();
    }
};
W3mHeader.styles = [styles];
__decorate([
    state()
], W3mHeader.prototype, "heading", void 0);
__decorate([
    state()
], W3mHeader.prototype, "buffering", void 0);
__decorate([
    state()
], W3mHeader.prototype, "showBack", void 0);
W3mHeader = __decorate([
    customElement('w3m-header')
], W3mHeader);
export { W3mHeader };
//# sourceMappingURL=index.js.map