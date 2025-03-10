/// <reference types="node" />
import { EventEmitter } from "events";
import { IJsonRpcConnection, JsonRpcPayload } from "@walletconnect/jsonrpc-utils";
export declare class WsConnection implements IJsonRpcConnection {
    url: string;
    events: EventEmitter;
    private socket;
    private registering;
    constructor(url: string);
    get connected(): boolean;
    get connecting(): boolean;
    on(event: string, listener: any): void;
    once(event: string, listener: any): void;
    off(event: string, listener: any): void;
    removeListener(event: string, listener: any): void;
    open(url?: string): Promise<void>;
    close(): Promise<void>;
    send(payload: JsonRpcPayload): Promise<void>;
    private register;
    private onOpen;
    private onClose;
    private onPayload;
    private onError;
    private parseError;
    private resetMaxListeners;
    private emitError;
}
export default WsConnection;
//# sourceMappingURL=ws.d.ts.map