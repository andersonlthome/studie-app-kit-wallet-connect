var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AccountController, ChainController, ConnectorController, CoreHelperUtil, EventsController, RouterController, SnackController } from '@web3modal/core';
import { customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import styles from './styles.js';
import { SocialProviderEnum } from '@web3modal/scaffold-utils';
let W3mSocialLoginList = class W3mSocialLoginList extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.connectors = ConnectorController.state.connectors;
        this.connector = this.connectors.find(c => c.type === 'AUTH');
        this.unsubscribe.push(ConnectorController.subscribeKey('connectors', val => {
            this.connectors = val;
            this.connector = this.connectors.find(c => c.type === 'AUTH');
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        if (!this.connector?.socials) {
            return null;
        }
        return html ` <wui-flex flexDirection="column" gap="xs">
      ${this.connector.socials.map(social => html `<wui-list-social
            @click=${() => {
            this.onSocialClick(social);
        }}
            name=${social}
            logo=${social}
          ></wui-list-social>`)}
    </wui-flex>`;
    }
    async onSocialClick(socialProvider) {
        if (socialProvider) {
            AccountController.setSocialProvider(socialProvider, ChainController.state.activeChain);
            EventsController.sendEvent({
                type: 'track',
                event: 'SOCIAL_LOGIN_STARTED',
                properties: { provider: socialProvider }
            });
        }
        if (socialProvider === SocialProviderEnum.Farcaster) {
            RouterController.push('ConnectingFarcaster');
            const authConnector = ConnectorController.getAuthConnector();
            if (authConnector) {
                if (!AccountController.state.farcasterUrl) {
                    try {
                        const { url } = await authConnector.provider.getFarcasterUri();
                        AccountController.setFarcasterUrl(url);
                    }
                    catch (error) {
                        RouterController.goBack();
                        SnackController.showError(error);
                    }
                }
            }
        }
        else {
            RouterController.push('ConnectingSocial');
            const authConnector = ConnectorController.getAuthConnector();
            this.popupWindow = CoreHelperUtil.returnOpenHref('', 'popupWindow', 'width=600,height=800,scrollbars=yes');
            try {
                if (authConnector && socialProvider) {
                    const { uri } = await authConnector.provider.getSocialRedirectUri({
                        provider: socialProvider
                    });
                    if (this.popupWindow && uri) {
                        AccountController.setSocialWindow(this.popupWindow, ChainController.state.activeChain);
                        this.popupWindow.location.href = uri;
                    }
                    else {
                        this.popupWindow?.close();
                        throw new Error('Something went wrong');
                    }
                }
            }
            catch (error) {
                this.popupWindow?.close();
                SnackController.showError('Something went wrong');
            }
        }
    }
};
W3mSocialLoginList.styles = styles;
__decorate([
    state()
], W3mSocialLoginList.prototype, "connectors", void 0);
W3mSocialLoginList = __decorate([
    customElement('w3m-social-login-list')
], W3mSocialLoginList);
export { W3mSocialLoginList };
//# sourceMappingURL=index.js.map