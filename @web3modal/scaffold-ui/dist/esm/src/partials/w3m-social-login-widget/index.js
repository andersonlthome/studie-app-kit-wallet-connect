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
import { ifDefined } from 'lit/directives/if-defined.js';
import { SocialProviderEnum } from '@web3modal/scaffold-utils';
const MAX_TOP_VIEW = 2;
const MAXIMUM_LENGTH = 6;
let W3mSocialLoginWidget = class W3mSocialLoginWidget extends LitElement {
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
        return html `
      <wui-flex
        class="container"
        flexDirection="column"
        gap="xs"
        .padding=${['0', '0', 'xs', '0']}
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
      ${this.separatorTemplate()}
    `;
    }
    topViewTemplate() {
        if (!this.connector?.socials) {
            return null;
        }
        if (this.connector.socials.length === 2) {
            return html ` <wui-flex gap="xs">
        ${this.connector.socials.slice(0, MAX_TOP_VIEW).map(social => html `<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social);
            }}
              logo=${social}
            ></wui-logo-select>`)}
      </wui-flex>`;
        }
        return html ` <wui-list-social
      data-testid=${`social-selector-${this.connector?.socials?.[0]}`}
      @click=${() => {
            this.onSocialClick(this.connector?.socials?.[0]);
        }}
      logo=${ifDefined(this.connector.socials[0])}
      align="center"
      name=${`Continue with ${this.connector.socials[0]}`}
    ></wui-list-social>`;
    }
    bottomViewTemplate() {
        if (!this.connector?.socials) {
            return null;
        }
        if (this.connector?.socials.length <= MAX_TOP_VIEW) {
            return null;
        }
        if (this.connector?.socials.length > MAXIMUM_LENGTH) {
            return html `<wui-flex gap="xs">
        ${this.connector.socials.slice(1, MAXIMUM_LENGTH - 1).map(social => html `<wui-logo-select
              data-testid=${`social-selector-${social}`}
              @click=${() => {
                this.onSocialClick(social);
            }}
              logo=${social}
            ></wui-logo-select>`)}
        <wui-logo-select logo="more" @click=${this.onMoreSocialsClick.bind(this)}></wui-logo-select>
      </wui-flex>`;
        }
        return html `<wui-flex gap="xs">
      ${this.connector.socials.slice(1, this.connector.socials.length).map(social => html `<wui-logo-select
            data-testid=${`social-selector-${social}`}
            @click=${() => {
            this.onSocialClick(social);
        }}
            logo=${social}
          ></wui-logo-select>`)}
    </wui-flex>`;
    }
    separatorTemplate() {
        const walletConnectConnector = this.connectors.find(c => c.type === 'WALLET_CONNECT');
        if (walletConnectConnector) {
            return html `<wui-separator text="or"></wui-separator>`;
        }
        return null;
    }
    onMoreSocialsClick() {
        RouterController.push('ConnectSocials');
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
W3mSocialLoginWidget.styles = styles;
__decorate([
    state()
], W3mSocialLoginWidget.prototype, "connectors", void 0);
W3mSocialLoginWidget = __decorate([
    customElement('w3m-social-login-widget')
], W3mSocialLoginWidget);
export { W3mSocialLoginWidget };
//# sourceMappingURL=index.js.map