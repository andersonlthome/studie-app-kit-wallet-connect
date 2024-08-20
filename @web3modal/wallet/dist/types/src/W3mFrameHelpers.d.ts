import type { W3mFrameTypes } from './W3mFrameTypes.js';
export declare const W3mFrameHelpers: {
    checkIfAllowedToTriggerEmail(): void;
    getTimeToNextEmailLogin(): number;
    checkIfRequestExists(request: W3mFrameTypes.RPCRequest): boolean;
    getResponseType(response: W3mFrameTypes.FrameEvent): "RPC_RESPONSE_ERROR" | "RPC_RESPONSE_TRANSACTION_HASH" | "RPC_RESPONSE_OBJECT";
    checkIfRequestIsAllowed(request: W3mFrameTypes.RPCRequest): boolean;
    isClient: boolean;
};
