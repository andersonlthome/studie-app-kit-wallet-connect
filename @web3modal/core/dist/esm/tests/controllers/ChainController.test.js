import { beforeAll, describe, expect, it } from 'vitest';
import { ConstantsUtil } from '@web3modal/common';
import { ChainController } from '../../src/controllers/ChainController.js';
import {} from '../../src/controllers/ConnectionController.js';
import {} from '../../src/controllers/NetworkController.js';
const caipAddress = 'eip155:1:0x123';
const approvedCaipNetworkIds = ['eip155:1', 'eip155:4'];
const connectionControllerClient = {
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
const networkControllerClient = {
    switchCaipNetwork: async (_caipNetwork) => Promise.resolve(),
    getApprovedCaipNetworksData: async () => Promise.resolve({ approvedCaipNetworkIds: [], supportsAllNetworks: false })
};
const evmAdapter = {
    chain: 'evm',
    connectionControllerClient,
    networkControllerClient
};
beforeAll(() => {
    ChainController.initialize([evmAdapter]);
});
describe('ChainController', () => {
    it('should be initialized as expected', () => {
        expect(ChainController.state.activeChain).toEqual(ConstantsUtil.CHAIN.EVM);
        expect(ChainController.getConnectionControllerClient()).toEqual(connectionControllerClient);
        expect(ChainController.getNetworkControllerClient()).toEqual(networkControllerClient);
    });
    it('should update account state as expected', () => {
        ChainController.setAccountProp('caipAddress', caipAddress);
        expect(ChainController.getAccountProp('caipAddress')).toEqual(caipAddress);
    });
    it('should update network state as expected', () => {
        ChainController.setChainNetworkData(ChainController.state.activeChain, {
            approvedCaipNetworkIds
        });
        expect(ChainController.getNetworkProp('approvedCaipNetworkIds')).toEqual(approvedCaipNetworkIds);
    });
    it('should set multi-chain enabled flag as expected', () => {
        ChainController.setMultiChainEnabled(true);
        expect(ChainController.state.multiChainEnabled).toEqual(true);
    });
    it('should reset account as expected', () => {
        ChainController.resetAccount(ChainController.state.activeChain);
        expect(ChainController.getAccountProp('isConnected')).toEqual(false);
        expect(ChainController.getAccountProp('smartAccountDeployed')).toEqual(false);
        expect(ChainController.getAccountProp('currentTab')).toEqual(0);
        expect(ChainController.getAccountProp('caipAddress')).toEqual(undefined);
        expect(ChainController.getAccountProp('address')).toEqual(undefined);
        expect(ChainController.getAccountProp('balance')).toEqual(undefined);
        expect(ChainController.getAccountProp('balanceSymbol')).toEqual(undefined);
        expect(ChainController.getAccountProp('profileName')).toEqual(undefined);
        expect(ChainController.getAccountProp('profileImage')).toEqual(undefined);
        expect(ChainController.getAccountProp('addressExplorerUrl')).toEqual(undefined);
        expect(ChainController.getAccountProp('tokenBalance')).toEqual([]);
        expect(ChainController.getAccountProp('connectedWalletInfo')).toEqual(undefined);
        expect(ChainController.getAccountProp('preferredAccountType')).toEqual(undefined);
        expect(ChainController.getAccountProp('socialProvider')).toEqual(undefined);
        expect(ChainController.getAccountProp('socialWindow')).toEqual(undefined);
    });
});
//# sourceMappingURL=ChainController.test.js.map