var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccountController, ApiController, ConnectionController, CoreHelperUtil, EventsController, ModalController, OptionsController, RouterController, SnackController, ThemeController } from '@web3modal/core';
import { UiHelperUtil, customElement, initializeTheming } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import styles from './styles.js';
const SCROLL_LOCK = 'scroll-lock';
let W3mModal = class W3mModal extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.abortController = undefined;
        this.open = ModalController.state.open;
        this.caipAddress = AccountController.state.caipAddress;
        this.isSiweEnabled = OptionsController.state.isSiweEnabled;
        this.connected = AccountController.state.isConnected;
        this.loading = ModalController.state.loading;
        this.initializeTheming();
        ApiController.prefetch();
        this.unsubscribe.push(ModalController.subscribeKey('open', val => (val ? this.onOpen() : this.onClose())), ModalController.subscribeKey('loading', val => {
            this.loading = val;
            this.onNewAddress(AccountController.state.caipAddress);
        }), AccountController.subscribeKey('isConnected', val => (this.connected = val)), AccountController.subscribeKey('caipAddress', val => this.onNewAddress(val)), OptionsController.subscribeKey('isSiweEnabled', val => (this.isSiweEnabled = val)));
        EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' });
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
        this.onRemoveKeyboardListener();
    }
    render() {
        return this.open
            ? html `
          <wui-flex @click=${this.onOverlayClick.bind(this)}>
            <wui-card role="alertdialog" aria-modal="true" tabindex="0">
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `
            : null;
    }
    async onOverlayClick(event) {
        if (event.target === event.currentTarget) {
            await this.handleClose();
        }
    }
    async handleClose() {
        if (this.isSiweEnabled) {
            const { SIWEController } = await import('@web3modal/siwe');
            if (SIWEController.state.status !== 'success' && this.connected) {
                await ConnectionController.disconnect();
            }
        }
        ModalController.close();
    }
    initializeTheming() {
        const { themeVariables, themeMode } = ThemeController.state;
        const defaultThemeMode = UiHelperUtil.getColorTheme(themeMode);
        initializeTheming(themeVariables, defaultThemeMode);
    }
    onClose() {
        this.open = false;
        this.classList.remove('open');
        this.onScrollUnlock();
        SnackController.hide();
        this.onRemoveKeyboardListener();
    }
    onOpen() {
        this.open = true;
        this.classList.add('open');
        this.onScrollLock();
        this.onAddKeyboardListener();
    }
    onScrollLock() {
        const styleTag = document.createElement('style');
        styleTag.dataset['w3m'] = SCROLL_LOCK;
        styleTag.textContent = `
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `;
        document.head.appendChild(styleTag);
    }
    onScrollUnlock() {
        const styleTag = document.head.querySelector(`style[data-w3m="${SCROLL_LOCK}"]`);
        if (styleTag) {
            styleTag.remove();
        }
    }
    onAddKeyboardListener() {
        this.abortController = new AbortController();
        const card = this.shadowRoot?.querySelector('wui-card');
        card?.focus();
        window.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                this.handleClose();
            }
            else if (event.key === 'Tab') {
                const { tagName } = event.target;
                if (tagName && !tagName.includes('W3M-') && !tagName.includes('WUI-')) {
                    card?.focus();
                }
            }
        }, this.abortController);
    }
    onRemoveKeyboardListener() {
        this.abortController?.abort();
        this.abortController = undefined;
    }
    async onNewAddress(caipAddress) {
        if (!this.connected || this.loading) {
            return;
        }
        const previousAddress = CoreHelperUtil.getPlainAddress(this.caipAddress);
        const newAddress = CoreHelperUtil.getPlainAddress(caipAddress);
        const previousNetworkId = CoreHelperUtil.getNetworkId(this.caipAddress);
        const newNetworkId = CoreHelperUtil.getNetworkId(caipAddress);
        this.caipAddress = caipAddress;
        if (this.isSiweEnabled) {
            const { SIWEController } = await import('@web3modal/siwe');
            const session = await SIWEController.getSession();
            if (session && previousAddress && newAddress && previousAddress !== newAddress) {
                if (SIWEController.state._client?.options.signOutOnAccountChange) {
                    await SIWEController.signOut();
                    this.onSiweNavigation();
                }
                return;
            }
            if (session && previousNetworkId && newNetworkId && previousNetworkId !== newNetworkId) {
                if (SIWEController.state._client?.options.signOutOnNetworkChange) {
                    await SIWEController.signOut();
                    this.onSiweNavigation();
                }
                return;
            }
            this.onSiweNavigation();
        }
    }
    onSiweNavigation() {
        if (this.open) {
            RouterController.push('ConnectingSiwe');
        }
        else {
            ModalController.open({
                view: 'ConnectingSiwe'
            });
        }
    }
};
W3mModal.styles = styles;
__decorate([
    state()
], W3mModal.prototype, "open", void 0);
__decorate([
    state()
], W3mModal.prototype, "caipAddress", void 0);
__decorate([
    state()
], W3mModal.prototype, "isSiweEnabled", void 0);
__decorate([
    state()
], W3mModal.prototype, "connected", void 0);
__decorate([
    state()
], W3mModal.prototype, "loading", void 0);
W3mModal = __decorate([
    customElement('w3m-modal')
], W3mModal);
export { W3mModal };
//# sourceMappingURL=index.js.map