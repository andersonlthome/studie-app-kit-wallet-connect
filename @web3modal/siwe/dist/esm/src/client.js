import { ConnectionController, RouterUtil, RouterController, StorageUtil, NetworkController, AccountController } from '@web3modal/core';
import { NetworkUtil } from '@web3modal/common';
import { ConstantsUtil } from '../core/utils/ConstantsUtil.js';
export class Web3ModalSIWEClient {
    constructor(siweConfig) {
        const { enabled = true, nonceRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS, sessionRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS, signOutOnAccountChange = true, signOutOnDisconnect = true, signOutOnNetworkChange = true, ...siweConfigMethods } = siweConfig;
        this.options = {
            enabled,
            nonceRefetchIntervalMs,
            sessionRefetchIntervalMs,
            signOutOnDisconnect,
            signOutOnAccountChange,
            signOutOnNetworkChange
        };
        this.methods = siweConfigMethods;
    }
    async getNonce(address) {
        const nonce = await this.methods.getNonce(address);
        if (!nonce) {
            throw new Error('siweControllerClient:getNonce - nonce is undefined');
        }
        return nonce;
    }
    async getMessageParams() {
        return ((await this.methods.getMessageParams?.()) || {});
    }
    createMessage(args) {
        const message = this.methods.createMessage(args);
        if (!message) {
            throw new Error('siweControllerClient:createMessage - message is undefined');
        }
        return message;
    }
    async verifyMessage(args) {
        const isValid = await this.methods.verifyMessage(args);
        return isValid;
    }
    async getSession() {
        const session = await this.methods.getSession();
        if (!session) {
            throw new Error('siweControllerClient:getSession - session is undefined');
        }
        return session;
    }
    async signIn() {
        const address = AccountController.state.address;
        const nonce = await this.methods.getNonce(address);
        if (!address) {
            throw new Error('An address is required to create a SIWE message.');
        }
        const chainId = NetworkUtil.caipNetworkIdToNumber(NetworkController.state.caipNetwork?.id);
        if (!chainId) {
            throw new Error('A chainId is required to create a SIWE message.');
        }
        const messageParams = await this.getMessageParams?.();
        const message = this.methods.createMessage({
            address: `eip155:${chainId}:${address}`,
            chainId,
            nonce,
            version: '1',
            iat: messageParams?.iat || new Date().toISOString(),
            ...messageParams
        });
        const type = StorageUtil.getConnectedConnector();
        if (type === 'AUTH') {
            RouterController.pushTransactionStack({
                view: null,
                goBack: false,
                replace: true,
                onCancel() {
                    RouterController.replace('ConnectingSiwe');
                }
            });
        }
        const signature = await ConnectionController.signMessage(message);
        const isValid = await this.methods.verifyMessage({ message, signature });
        if (!isValid) {
            throw new Error('Error verifying SIWE signature');
        }
        const session = await this.methods.getSession();
        if (!session) {
            throw new Error('Error verifying SIWE signature');
        }
        if (this.methods.onSignIn) {
            this.methods.onSignIn(session);
        }
        RouterUtil.navigateAfterNetworkSwitch();
        return session;
    }
    async signOut() {
        this.methods.onSignOut?.();
        return this.methods.signOut();
    }
}
//# sourceMappingURL=client.js.map