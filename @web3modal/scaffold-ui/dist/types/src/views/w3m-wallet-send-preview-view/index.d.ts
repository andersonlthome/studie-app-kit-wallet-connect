import { LitElement } from 'lit';
export declare class W3mWalletSendPreviewView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private token;
    private sendTokenAmount;
    private receiverAddress;
    private receiverProfileName;
    private receiverProfileImageUrl;
    private gasPriceInUSD;
    private caipNetwork;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private sendValueTemplate;
    onSendClick(): void;
    private onCancelClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-wallet-send-preview-view': W3mWalletSendPreviewView;
    }
}
