import { LitElement } from 'lit';
export declare class W3mAccountDefaultWidget extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    address: string | undefined;
    private profileImage;
    private profileName;
    private network;
    private disconnecting;
    private balance;
    private balanceSymbol;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private onrampTemplate;
    private activityTemplate;
    private swapsTemplate;
    private authCardTemplate;
    private handleSwitchAccountsView;
    private handleClickPay;
    private handleClickSwap;
    private explorerBtnTemplate;
    private singleAccountTemplate;
    private multiAccountTemplate;
    private isAllowedNetworkSwitch;
    private onCopyAddress;
    private onNetworks;
    private onTransactions;
    private onDisconnect;
    private onExplorer;
    private onGoToUpgradeView;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-account-default-widget': W3mAccountDefaultWidget;
    }
}
