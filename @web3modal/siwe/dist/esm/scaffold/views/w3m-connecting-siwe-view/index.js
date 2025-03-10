var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccountController, ConnectionController, EventsController, ModalController, NetworkController, OptionsController, RouterController, SnackController } from '@web3modal/core';
import { customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { SIWEController } from '../../../core/controller/SIWEController.js';
import { W3mFrameRpcConstants } from '@web3modal/wallet';
let W3mConnectingSiweView = class W3mConnectingSiweView extends LitElement {
    constructor() {
        super(...arguments);
        this.dappName = OptionsController.state.metadata?.name;
        this.isSigning = false;
    }
    render() {
        this.onRender();
        return html `
      <wui-flex justifyContent="center" .padding=${['2xl', '0', 'xxl', '0']}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${['0', '4xl', 'l', '4xl']}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName ?? 'Dapp'} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${['0', '3xl', 'l', '3xl']}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl']} gap="s" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral"
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="main"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning ? 'Signing...' : 'Sign'}
        </wui-button>
      </wui-flex>
    `;
    }
    onRender() {
        if (SIWEController.state.session) {
            ModalController.close();
        }
    }
    async onSign() {
        this.isSigning = true;
        EventsController.sendEvent({
            event: 'CLICK_SIGN_SIWE_MESSAGE',
            type: 'track',
            properties: {
                network: NetworkController.state.caipNetwork?.id || '',
                isSmartAccount: AccountController.state.preferredAccountType ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
        try {
            SIWEController.setStatus('loading');
            const session = await SIWEController.signIn();
            SIWEController.setStatus('success');
            EventsController.sendEvent({
                event: 'SIWE_AUTH_SUCCESS',
                type: 'track',
                properties: {
                    network: NetworkController.state.caipNetwork?.id || '',
                    isSmartAccount: AccountController.state.preferredAccountType ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                }
            });
            return session;
        }
        catch (error) {
            const preferredAccountType = AccountController.state.preferredAccountType;
            const isSmartAccount = preferredAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT;
            if (isSmartAccount) {
                SnackController.showError('This application might not support Smart Accounts');
            }
            else {
                SnackController.showError('Signature declined');
            }
            SIWEController.setStatus('error');
            return EventsController.sendEvent({
                event: 'SIWE_AUTH_ERROR',
                type: 'track',
                properties: {
                    network: NetworkController.state.caipNetwork?.id || '',
                    isSmartAccount
                }
            });
        }
        finally {
            this.isSigning = false;
        }
    }
    async onCancel() {
        const isConnected = AccountController.state.isConnected;
        if (isConnected) {
            await ConnectionController.disconnect();
            ModalController.close();
        }
        else {
            RouterController.push('Connect');
        }
        EventsController.sendEvent({
            event: 'CLICK_CANCEL_SIWE',
            type: 'track',
            properties: {
                network: NetworkController.state.caipNetwork?.id || '',
                isSmartAccount: AccountController.state.preferredAccountType ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
    }
};
__decorate([
    state()
], W3mConnectingSiweView.prototype, "isSigning", void 0);
W3mConnectingSiweView = __decorate([
    customElement('w3m-connecting-siwe-view')
], W3mConnectingSiweView);
export { W3mConnectingSiweView };
//# sourceMappingURL=index.js.map