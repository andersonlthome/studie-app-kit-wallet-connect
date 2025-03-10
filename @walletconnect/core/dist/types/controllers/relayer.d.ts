/// <reference types="node" />
import { EventEmitter } from "events";
import { IJsonRpcProvider, JsonRpcPayload, RequestArguments } from "@walletconnect/jsonrpc-utils";
import { Logger } from "@walletconnect/logger";
import { RelayJsonRpc } from "@walletconnect/relay-api";
import { ICore, IMessageTracker, IPublisher, IRelayer, ISubscriber, RelayerOptions, RelayerTypes } from "@walletconnect/types";
export declare class Relayer extends IRelayer {
    protocol: string;
    version: number;
    core: ICore;
    logger: Logger;
    events: EventEmitter;
    provider: IJsonRpcProvider;
    messages: IMessageTracker;
    subscriber: ISubscriber;
    publisher: IPublisher;
    name: string;
    transportExplicitlyClosed: boolean;
    private initialized;
    private connectionAttemptInProgress;
    private relayUrl;
    private projectId;
    private bundleId;
    private connectionStatusPollingInterval;
    private staleConnectionErrors;
    private hasExperiencedNetworkDisruption;
    private requestsInFlight;
    private pingTimeout;
    private heartBeatTimeout;
    constructor(opts: RelayerOptions);
    init(): Promise<void>;
    get context(): string;
    get connected(): boolean;
    get connecting(): boolean;
    publish(topic: string, message: string, opts?: RelayerTypes.PublishOptions): Promise<void>;
    subscribe(topic: string, opts?: RelayerTypes.SubscribeOptions): Promise<string>;
    request: (request: RequestArguments<RelayJsonRpc.SubscribeParams>) => Promise<JsonRpcPayload<any, any>>;
    unsubscribe(topic: string, opts?: RelayerTypes.UnsubscribeOptions): Promise<void>;
    on(event: string, listener: any): void;
    once(event: string, listener: any): void;
    off(event: string, listener: any): void;
    removeListener(event: string, listener: any): void;
    transportDisconnect(): Promise<void>;
    transportClose(): Promise<void>;
    transportOpen(relayUrl?: string): Promise<void>;
    restartTransport(relayUrl?: string): Promise<void>;
    confirmOnlineStateOrThrow(): Promise<void>;
    handleBatchMessageEvents(messages: RelayerTypes.MessageEvent[]): Promise<void>;
    private startPingTimeout;
    private resetPingTimeout;
    private isConnectionStalled;
    private createProvider;
    private recordMessageEvent;
    private shouldIgnoreMessageEvent;
    private onProviderPayload;
    private onMessageEvent;
    private acknowledgePayload;
    private onPayloadHandler;
    private onConnectHandler;
    private onDisconnectHandler;
    private onProviderErrorHandler;
    private registerProviderListeners;
    private unregisterProviderListeners;
    private registerEventListeners;
    private onProviderDisconnect;
    private isInitialized;
    private toEstablishConnection;
}
//# sourceMappingURL=relayer.d.ts.map