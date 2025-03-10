import { LitElement } from 'lit';
export declare class W3mConnectingSiweView extends LitElement {
    private readonly dappName;
    private isSigning;
    render(): import("lit").TemplateResult<1>;
    private onRender;
    private onSign;
    private onCancel;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-connecting-siwe-view': W3mConnectingSiweView;
    }
}
