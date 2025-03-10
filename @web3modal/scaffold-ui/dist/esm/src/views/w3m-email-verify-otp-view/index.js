var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { customElement } from '@web3modal/ui';
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js';
import { EventsController, ConnectionController, ModalController, NetworkController, RouterController, AccountController } from '@web3modal/core';
import { state } from 'lit/decorators.js';
let W3mEmailVerifyOtpView = class W3mEmailVerifyOtpView extends W3mEmailOtpWidget {
    constructor() {
        super();
        this.unsubscribe = [];
        this.smartAccountDeployed = AccountController.state.smartAccountDeployed;
        this.onOtpSubmit = async (otp) => {
            try {
                if (this.authConnector) {
                    const smartAccountEnabled = NetworkController.checkIfSmartAccountEnabled();
                    await this.authConnector.provider.connectOtp({ otp });
                    EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
                    await ConnectionController.connectExternal(this.authConnector);
                    EventsController.sendEvent({
                        type: 'track',
                        event: 'CONNECT_SUCCESS',
                        properties: { method: 'email', name: this.authConnector.name || 'Unknown' }
                    });
                    if (AccountController.state.allAccounts.length > 1) {
                        RouterController.push('SelectAddresses');
                    }
                    else if (smartAccountEnabled && !this.smartAccountDeployed) {
                        RouterController.push('UpgradeToSmartAccount');
                    }
                    else {
                        ModalController.close();
                    }
                }
            }
            catch (error) {
                EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' });
                throw error;
            }
        };
        this.onOtpResend = async (email) => {
            if (this.authConnector) {
                await this.authConnector.provider.connectEmail({ email });
                EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' });
            }
        };
        this.unsubscribe.push(AccountController.subscribeKey('smartAccountDeployed', val => {
            this.smartAccountDeployed = val;
        }));
    }
};
__decorate([
    state()
], W3mEmailVerifyOtpView.prototype, "smartAccountDeployed", void 0);
W3mEmailVerifyOtpView = __decorate([
    customElement('w3m-email-verify-otp-view')
], W3mEmailVerifyOtpView);
export { W3mEmailVerifyOtpView };
//# sourceMappingURL=index.js.map