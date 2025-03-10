import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ChainController, ConnectionController, ConstantsUtil, StorageUtil } from '../../index.js';
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common';
const walletConnectUri = 'wc://uri?=123';
const externalId = 'coinbaseWallet';
const type = 'AUTH';
const storageSpy = vi.spyOn(StorageUtil, 'setConnectedConnector');
const client = {
    connectWalletConnect: async (onUri) => {
        onUri(walletConnectUri);
        await Promise.resolve(walletConnectUri);
    },
    disconnect: async () => Promise.resolve(),
    signMessage: async (message) => Promise.resolve(message),
    estimateGas: async () => Promise.resolve(BigInt(0)),
    connectExternal: async (_id) => Promise.resolve(),
    checkInstalled: _id => true,
    parseUnits: value => BigInt(value),
    formatUnits: value => value.toString(),
    sendTransaction: () => Promise.resolve('0x'),
    writeContract: () => Promise.resolve('0x'),
    getEnsAddress: async (value) => Promise.resolve(value),
    getEnsAvatar: async (value) => Promise.resolve(value)
};
const clientConnectExternalSpy = vi.spyOn(client, 'connectExternal');
const clientCheckInstalledSpy = vi.spyOn(client, 'checkInstalled');
const partialClient = {
    connectWalletConnect: async () => Promise.resolve(),
    disconnect: async () => Promise.resolve(),
    estimateGas: async () => Promise.resolve(BigInt(0)),
    signMessage: async (message) => Promise.resolve(message),
    parseUnits: value => BigInt(value),
    formatUnits: value => value.toString(),
    sendTransaction: () => Promise.resolve('0x'),
    writeContract: () => Promise.resolve('0x'),
    getEnsAddress: async (value) => Promise.resolve(value),
    getEnsAvatar: async (value) => Promise.resolve(value)
};
beforeAll(() => {
    ChainController.initialize([{ chain: CommonConstantsUtil.CHAIN.EVM }]);
});
describe('ConnectionController', () => {
    it('should have valid default state', () => {
        ChainController.initialize([
            { chain: CommonConstantsUtil.CHAIN.EVM, connectionControllerClient: client }
        ]);
        expect(ConnectionController.state).toEqual({
            wcError: false,
            buffering: false
        });
    });
    it('should update state correctly on disconnect()', async () => {
        await ConnectionController.disconnect();
        expect(ConnectionController.state.wcUri).toEqual(undefined);
        expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    });
    it('should update state correctly and set wcPromise on connectWalletConnect()', async () => {
        const fakeDate = new Date(0);
        vi.useFakeTimers();
        vi.setSystemTime(fakeDate);
        await ConnectionController.connectWalletConnect();
        expect(ConnectionController.state.wcUri).toEqual(walletConnectUri);
        expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS);
        expect(storageSpy).toHaveBeenCalledWith('WALLET_CONNECT');
        vi.useRealTimers();
    });
    it('connectExternal() should trigger internal client call and set connector in storage', async () => {
        const options = { id: externalId, type };
        await ConnectionController.connectExternal(options);
        expect(storageSpy).toHaveBeenCalledWith(type);
        expect(clientConnectExternalSpy).toHaveBeenCalledWith(options);
    });
    it('checkInstalled() should trigger internal client call', () => {
        ConnectionController.checkInstalled([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId]);
    });
    it('should not throw on checkInstalled() without ids', () => {
        ConnectionController.checkInstalled();
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined);
    });
    it('should not throw when optional methods are undefined', async () => {
        ChainController.initialize([
            { chain: CommonConstantsUtil.CHAIN.EVM, connectionControllerClient: partialClient }
        ]);
        await ConnectionController.connectExternal({ id: externalId, type });
        ConnectionController.checkInstalled([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId]);
        expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined);
        expect(ConnectionController._getClient()).toEqual(partialClient);
    });
    it('should update state correctly on resetWcConnection()', () => {
        ConnectionController.resetWcConnection();
        expect(ConnectionController.state.wcUri).toEqual(undefined);
        expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    });
});
//# sourceMappingURL=ConnectionController.test.js.map