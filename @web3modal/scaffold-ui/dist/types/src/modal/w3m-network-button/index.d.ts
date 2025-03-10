import type { WuiNetworkButton } from '@web3modal/ui';
import { LitElement } from 'lit';
export declare class W3mNetworkButton extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    disabled?: WuiNetworkButton['disabled'];
    label?: string;
    private network;
    private connected;
    private loading;
    private isUnsupportedChain;
    firstUpdated(): void;
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private getLabel;
    private onClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-network-button': W3mNetworkButton;
    }
}
