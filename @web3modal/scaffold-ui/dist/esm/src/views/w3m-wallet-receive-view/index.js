var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccountController, AssetUtil, CoreHelperUtil, NetworkController, RouterController, SnackController, ThemeController } from '@web3modal/core';
import { UiHelperUtil, customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import styles from './styles.js';
import { state } from 'lit/decorators.js';
import { W3mFrameRpcConstants } from '@web3modal/wallet';
let W3mWalletReceiveView = class W3mWalletReceiveView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.address = AccountController.state.address;
        this.profileName = AccountController.state.profileName;
        this.network = NetworkController.state.caipNetwork;
        this.preferredAccountType = AccountController.state.preferredAccountType;
        this.unsubscribe.push(...[
            AccountController.subscribe(val => {
                if (val.address) {
                    this.address = val.address;
                    this.profileName = val.profileName;
                    this.preferredAccountType = val.preferredAccountType;
                }
                else {
                    SnackController.showError('Account not found');
                }
            })
        ], NetworkController.subscribeKey('caipNetwork', val => {
            if (val?.id) {
                this.network = val;
            }
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        if (!this.address) {
            throw new Error('w3m-wallet-receive-view: No account provided');
        }
        const networkImage = AssetUtil.getNetworkImage(this.network);
        return html ` <wui-flex
      flexDirection="column"
      .padding=${['0', 'l', 'l', 'l']}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${UiHelperUtil.getTruncateString({
            string: this.profileName || this.address || '',
            charsStart: this.profileName ? 18 : 4,
            charsEnd: this.profileName ? 0 : 4,
            truncate: this.profileName ? 'end' : 'middle'
        })}
        icon="copy"
        size="sm"
        imageSrc=${networkImage ? networkImage : ''}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${['l', '0', '0', '0']}
        alignItems="center"
        gap="s"
      >
        <wui-qr-code
          size=${232}
          theme=${ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${true}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="paragraph-500" color="fg-100" align="center">
          Copy your address or scan this QR code
        </wui-text>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`;
    }
    networkTemplate() {
        const requestedCaipNetworks = NetworkController.getRequestedCaipNetworks();
        const isNetworkEnabledForSmartAccounts = NetworkController.checkIfSmartAccountEnabled();
        const caipNetwork = NetworkController.state.caipNetwork;
        if (this.preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT &&
            isNetworkEnabledForSmartAccounts) {
            if (!caipNetwork) {
                return null;
            }
            return html `<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[AssetUtil.getNetworkImage(caipNetwork) ?? '']}
      ></wui-compatible-network>`;
        }
        const slicedNetworks = requestedCaipNetworks?.filter(network => network?.imageId)?.slice(0, 5);
        const imagesArray = slicedNetworks.map(AssetUtil.getNetworkImage).filter(Boolean);
        return html `<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${imagesArray}
    ></wui-compatible-network>`;
    }
    onReceiveClick() {
        RouterController.push('WalletCompatibleNetworks');
    }
    onCopyClick() {
        try {
            if (this.address) {
                CoreHelperUtil.copyToClopboard(this.address);
                SnackController.showSuccess('Address copied');
            }
        }
        catch {
            SnackController.showError('Failed to copy');
        }
    }
};
W3mWalletReceiveView.styles = styles;
__decorate([
    state()
], W3mWalletReceiveView.prototype, "address", void 0);
__decorate([
    state()
], W3mWalletReceiveView.prototype, "profileName", void 0);
__decorate([
    state()
], W3mWalletReceiveView.prototype, "network", void 0);
__decorate([
    state()
], W3mWalletReceiveView.prototype, "preferredAccountType", void 0);
W3mWalletReceiveView = __decorate([
    customElement('w3m-wallet-receive-view')
], W3mWalletReceiveView);
export { W3mWalletReceiveView };
//# sourceMappingURL=index.js.map