import { Web3ModalScaffold } from '@web3modal/scaffold';
import { ConstantsUtil, PresetsUtil, HelpersUtil } from '@web3modal/scaffold-utils';
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common';
import EthereumProvider, { OPTIONAL_METHODS } from '@walletconnect/ethereum-provider';
import { getChainsFromAccounts } from '@walletconnect/utils';
import { ConstantsUtil as CommonConstants } from '@web3modal/common';
import { formatEther, JsonRpcProvider, InfuraProvider, getAddress as getOriginalAddress, parseUnits, formatUnits, JsonRpcSigner, BrowserProvider, Contract, hexlify, toUtf8Bytes, isHexString } from 'ethers';
import { EthersConstantsUtil, EthersHelpersUtil, EthersStoreUtil } from '@web3modal/scaffold-utils/ethers';
import { W3mFrameProvider, W3mFrameHelpers, W3mFrameRpcConstants, W3mFrameConstants } from '@web3modal/wallet';
import { NetworkUtil } from '@web3modal/common';
export class Web3Modal extends Web3ModalScaffold {
    constructor(options) {
        const { ethersConfig, siweConfig, chains, defaultChain, tokens, chainImages, _sdkVersion, ...w3mOptions } = options;
        if (!ethersConfig) {
            throw new Error('web3modal:constructor - ethersConfig is undefined');
        }
        if (!w3mOptions.projectId) {
            throw new Error('web3modal:constructor - projectId is undefined');
        }
        const networkControllerClient = {
            switchCaipNetwork: async (caipNetwork) => {
                const chainId = NetworkUtil.caipNetworkIdToNumber(caipNetwork?.id);
                if (chainId) {
                    try {
                        EthersStoreUtil.setError(undefined);
                        await this.switchNetwork(chainId);
                    }
                    catch (error) {
                        EthersStoreUtil.setError(error);
                        throw new Error('networkControllerClient:switchCaipNetwork - unable to switch chain');
                    }
                }
            },
            getApprovedCaipNetworksData: async () => new Promise(async (resolve) => {
                const walletChoice = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
                if (walletChoice?.includes(ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID)) {
                    const provider = await this.getWalletConnectProvider();
                    if (!provider) {
                        throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined');
                    }
                    const ns = provider.signer?.session?.namespaces;
                    const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
                    const nsChains = getChainsFromAccounts(ns?.[ConstantsUtil.EIP155]?.accounts || []);
                    const result = {
                        supportsAllNetworks: nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD) ?? false,
                        approvedCaipNetworkIds: nsChains
                    };
                    resolve(result);
                }
                else {
                    const result = {
                        approvedCaipNetworkIds: undefined,
                        supportsAllNetworks: true
                    };
                    resolve(result);
                }
            })
        };
        const connectionControllerClient = {
            connectWalletConnect: async (onUri) => {
                const WalletConnectProvider = await this.getWalletConnectProvider();
                if (!WalletConnectProvider) {
                    throw new Error('connectionControllerClient:getWalletConnectUri - provider is undefined');
                }
                WalletConnectProvider.on('display_uri', (uri) => {
                    onUri(uri);
                });
                const clientId = await WalletConnectProvider.signer?.client?.core?.crypto?.getClientId();
                if (clientId) {
                    this.setClientId(clientId);
                }
                const params = await siweConfig?.getMessageParams?.();
                if (siweConfig?.options?.enabled && params && Object.keys(params || {}).length > 0) {
                    const { SIWEController, getDidChainId, getDidAddress } = await import('@web3modal/siwe');
                    const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
                    let reorderedChains = params.chains;
                    if (chainId) {
                        reorderedChains = [chainId, ...params.chains.filter(c => c !== chainId)];
                    }
                    const result = await WalletConnectProvider.authenticate({
                        nonce: await siweConfig.getNonce(),
                        methods: [...OPTIONAL_METHODS],
                        ...params,
                        chains: reorderedChains
                    });
                    const signedCacao = result?.auths?.[0];
                    if (signedCacao) {
                        const { p, s } = signedCacao;
                        const cacaoChainId = getDidChainId(p.iss);
                        const address = getDidAddress(p.iss);
                        if (address && cacaoChainId) {
                            SIWEController.setSession({
                                address,
                                chainId: parseInt(cacaoChainId, 10)
                            });
                        }
                        try {
                            const message = WalletConnectProvider.signer.client.formatAuthMessage({
                                request: p,
                                iss: p.iss
                            });
                            await SIWEController.verifyMessage({
                                message,
                                signature: s.s,
                                cacao: signedCacao
                            });
                        }
                        catch (error) {
                            console.error('Error verifying message', error);
                            await WalletConnectProvider.disconnect().catch(console.error);
                            await SIWEController.signOut().catch(console.error);
                            throw error;
                        }
                    }
                }
                else {
                    await WalletConnectProvider.connect({ optionalChains: this.chains.map(c => c.chainId) });
                }
                await this.setWalletConnectProvider();
            },
            connectExternal: async ({ id, info, provider }) => {
                this.setClientId(null);
                if (id === ConstantsUtil.INJECTED_CONNECTOR_ID) {
                    const InjectedProvider = ethersConfig.injected;
                    if (!InjectedProvider) {
                        throw new Error('connectionControllerClient:connectInjected - provider is undefined');
                    }
                    try {
                        EthersStoreUtil.setError(undefined);
                        await InjectedProvider.request({ method: 'eth_requestAccounts' });
                        this.setInjectedProvider(ethersConfig);
                    }
                    catch (error) {
                        EthersStoreUtil.setError(error);
                    }
                }
                else if (id === ConstantsUtil.EIP6963_CONNECTOR_ID && info && provider) {
                    try {
                        EthersStoreUtil.setError(undefined);
                        await provider.request({ method: 'eth_requestAccounts' });
                        this.setEIP6963Provider(provider, info.name);
                    }
                    catch (error) {
                        EthersStoreUtil.setError(error);
                    }
                }
                else if (id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
                    const CoinbaseProvider = ethersConfig.coinbase;
                    if (!CoinbaseProvider) {
                        throw new Error('connectionControllerClient:connectCoinbase - connector is undefined');
                    }
                    try {
                        EthersStoreUtil.setError(undefined);
                        await CoinbaseProvider.request({ method: 'eth_requestAccounts' });
                        this.setCoinbaseProvider(ethersConfig);
                    }
                    catch (error) {
                        EthersStoreUtil.setError(error);
                        throw new Error(error.message);
                    }
                }
                else if (id === ConstantsUtil.AUTH_CONNECTOR_ID) {
                    await this.setAuthProvider();
                }
            },
            checkInstalled: (ids) => {
                if (!ids) {
                    return Boolean(window.ethereum);
                }
                if (ethersConfig.injected) {
                    if (!window?.ethereum) {
                        return false;
                    }
                }
                return ids.some(id => Boolean(window.ethereum?.[String(id)]));
            },
            disconnect: async () => {
                const provider = EthersStoreUtil.state.provider;
                const providerType = EthersStoreUtil.state.providerType;
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
                this.setClientId(null);
                if (siweConfig?.options?.signOutOnDisconnect) {
                    const { SIWEController } = await import('@web3modal/siwe');
                    await SIWEController.signOut();
                }
                if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID ||
                    providerType === 'coinbaseWalletSDK') {
                    const ethProvider = provider;
                    await ethProvider.disconnect();
                }
                else if (providerType === ConstantsUtil.AUTH_CONNECTOR_ID) {
                    await this.authProvider?.disconnect();
                }
                else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && provider) {
                    await this.disconnectProvider(provider);
                    provider.emit('disconnect');
                }
                else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID) {
                    const InjectedProvider = ethersConfig.injected;
                    if (InjectedProvider) {
                        await this.disconnectProvider(InjectedProvider);
                        InjectedProvider.emit('disconnect');
                    }
                }
                else {
                    provider?.emit('disconnect');
                }
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            },
            signMessage: async (message) => {
                const provider = EthersStoreUtil.state.provider;
                if (!provider) {
                    throw new Error('connectionControllerClient:signMessage - provider is undefined');
                }
                const hexMessage = isHexString(message) ? message : hexlify(toUtf8Bytes(message));
                const signature = await provider.request({
                    method: 'personal_sign',
                    params: [hexMessage, this.getAddress()]
                });
                return signature;
            },
            parseUnits: (value, decimals) => parseUnits(value, decimals),
            formatUnits: (value, decimals) => formatUnits(value, decimals),
            async estimateGas(data) {
                const { chainId, provider, address } = EthersStoreUtil.state;
                if (!provider) {
                    throw new Error('connectionControllerClient:sendTransaction - provider is undefined');
                }
                if (!address) {
                    throw new Error('connectionControllerClient:sendTransaction - address is undefined');
                }
                const txParams = {
                    from: data.address,
                    to: data.to,
                    data: data.data,
                    type: 0
                };
                const browserProvider = new BrowserProvider(provider, chainId);
                const signer = new JsonRpcSigner(browserProvider, address);
                const gas = await signer.estimateGas(txParams);
                return gas;
            },
            sendTransaction: async (data) => {
                const { chainId, provider, address } = EthersStoreUtil.state;
                if (!provider) {
                    throw new Error('ethersClient:sendTransaction - provider is undefined');
                }
                if (!address) {
                    throw new Error('ethersClient:sendTransaction - address is undefined');
                }
                const txParams = {
                    to: data.to,
                    value: data.value,
                    gasLimit: data.gas,
                    gasPrice: data.gasPrice,
                    data: data.data,
                    type: 0
                };
                const browserProvider = new BrowserProvider(provider, chainId);
                const signer = new JsonRpcSigner(browserProvider, address);
                const txResponse = await signer.sendTransaction(txParams);
                const txReceipt = await txResponse.wait();
                return txReceipt?.hash || null;
            },
            writeContract: async (data) => {
                const { chainId, provider, address } = EthersStoreUtil.state;
                if (!provider) {
                    throw new Error('ethersClient:writeContract - provider is undefined');
                }
                if (!address) {
                    throw new Error('ethersClient:writeContract - address is undefined');
                }
                const browserProvider = new BrowserProvider(provider, chainId);
                const signer = new JsonRpcSigner(browserProvider, address);
                const contract = new Contract(data.tokenAddress, data.abi, signer);
                if (!contract || !data.method) {
                    throw new Error('Contract method is undefined');
                }
                const method = contract[data.method];
                if (method) {
                    const tx = await method(data.receiverAddress, data.tokenAmount);
                    return tx;
                }
                throw new Error('Contract method is undefined');
            },
            getEnsAddress: async (value) => {
                try {
                    const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
                    let ensName = null;
                    let wcName = false;
                    if (value?.endsWith(CommonConstants.WC_NAME_SUFFIX)) {
                        wcName = await this.resolveWalletConnectName(value);
                    }
                    if (chainId === 1) {
                        const ensProvider = new InfuraProvider('mainnet');
                        ensName = await ensProvider.resolveName(value);
                    }
                    return ensName || wcName || false;
                }
                catch {
                    return false;
                }
            },
            getEnsAvatar: async (value) => {
                const { chainId } = EthersStoreUtil.state;
                if (chainId && chainId === 1) {
                    const ensProvider = new InfuraProvider('mainnet');
                    const avatar = await ensProvider.getAvatar(value);
                    if (avatar) {
                        return avatar;
                    }
                    return false;
                }
                return false;
            }
        };
        super({
            chain: CommonConstantsUtil.CHAIN.EVM,
            networkControllerClient,
            connectionControllerClient,
            siweControllerClient: siweConfig,
            defaultChain: EthersHelpersUtil.getCaipDefaultChain(defaultChain),
            tokens: HelpersUtil.getCaipTokens(tokens),
            _sdkVersion: _sdkVersion ?? `html-ethers-${ConstantsUtil.VERSION}`,
            ...w3mOptions
        });
        this.hasSyncedConnectedAccount = false;
        this.EIP6963Providers = [];
        this.chain = CommonConstantsUtil.CHAIN.EVM;
        this.options = undefined;
        this.options = options;
        this.metadata = ethersConfig.metadata;
        this.projectId = w3mOptions.projectId;
        this.chains = chains;
        this.createProvider();
        EthersStoreUtil.subscribeKey('address', () => {
            this.syncAccount();
        });
        EthersStoreUtil.subscribeKey('chainId', () => {
            this.syncNetwork(chainImages);
        });
        this.subscribeCaipNetworkChange(network => {
            if (!this.getChainId() && network) {
                EthersStoreUtil.setChainId(NetworkUtil.caipNetworkIdToNumber(network.id));
            }
        });
        this.subscribeShouldUpdateToAddress((address) => {
            if (!address) {
                return;
            }
            EthersStoreUtil.setAddress(getOriginalAddress(address));
        });
        this.syncRequestedNetworks(chains, chainImages);
        this.syncConnectors(ethersConfig);
        if (typeof window !== 'undefined') {
            this.listenConnectors(true);
            this.checkActive6963Provider();
        }
        this.setEIP6963Enabled(ethersConfig.EIP6963);
        if (ethersConfig.injected) {
            this.checkActiveInjectedProvider(ethersConfig);
        }
        if (ethersConfig.auth) {
            this.syncAuthConnector(w3mOptions.projectId, ethersConfig.auth);
        }
        if (ethersConfig.coinbase) {
            this.checkActiveCoinbaseProvider(ethersConfig);
        }
    }
    getState() {
        const state = super.getState();
        return {
            ...state,
            selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
        };
    }
    subscribeState(callback) {
        return super.subscribeState(state => callback({
            ...state,
            selectedNetworkId: NetworkUtil.caipNetworkIdToNumber(state.selectedNetworkId)
        }));
    }
    setAddress(address) {
        const originalAddress = address ? getOriginalAddress(address) : undefined;
        EthersStoreUtil.setAddress(originalAddress);
    }
    getAddress() {
        const { address } = EthersStoreUtil.state;
        return address ? getOriginalAddress(address) : undefined;
    }
    getError() {
        return EthersStoreUtil.state.error;
    }
    getChainId() {
        const storeChainId = EthersStoreUtil.state.chainId;
        const networkControllerChainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
        return storeChainId ?? networkControllerChainId;
    }
    getStatus() {
        return EthersStoreUtil.state.status;
    }
    getIsConnected() {
        return EthersStoreUtil.state.isConnected;
    }
    getWalletProvider() {
        return EthersStoreUtil.state.provider;
    }
    getWalletProviderType() {
        return EthersStoreUtil.state.providerType;
    }
    subscribeProvider(callback) {
        return EthersStoreUtil.subscribe(callback);
    }
    async disconnect() {
        const { provider, providerType } = EthersStoreUtil.state;
        localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
        EthersStoreUtil.reset();
        this.setClientId(null);
        if (providerType === ConstantsUtil.AUTH_CONNECTOR_ID) {
            await this.authProvider?.disconnect();
        }
        else if (provider && (providerType === 'injected' || providerType === 'eip6963')) {
            await this.disconnectProvider(provider);
            provider?.emit('disconnect');
        }
        else if (providerType === 'walletConnect' || providerType === 'coinbaseWalletSDK') {
            const ethereumProvider = provider;
            if (ethereumProvider) {
                try {
                    EthersStoreUtil.setError(undefined);
                    await ethereumProvider.disconnect();
                }
                catch (error) {
                    EthersStoreUtil.setError(error);
                }
            }
        }
    }
    createProvider() {
        if (!this.walletConnectProviderInitPromise && typeof window !== 'undefined') {
            this.walletConnectProviderInitPromise = this.initWalletConnectProvider();
        }
        return this.walletConnectProviderInitPromise;
    }
    async initWalletConnectProvider() {
        const rpcMap = this.chains
            ? this.chains.reduce((map, chain) => {
                map[chain.chainId] = chain.rpcUrl;
                return map;
            }, {})
            : {};
        const walletConnectProviderOptions = {
            projectId: this.projectId,
            showQrModal: false,
            rpcMap,
            optionalChains: [...this.chains.map(chain => chain.chainId)],
            metadata: {
                name: this.metadata ? this.metadata.name : '',
                description: this.metadata ? this.metadata.description : '',
                url: this.metadata ? this.metadata.url : '',
                icons: this.metadata ? this.metadata.icons : ['']
            }
        };
        this.walletConnectProvider = await EthereumProvider.init(walletConnectProviderOptions);
        await this.checkActiveWalletConnectProvider();
    }
    async disconnectProvider(provider) {
        try {
            const permissions = await provider.request({
                method: 'wallet_getPermissions'
            });
            const ethAccountsPermission = permissions.find(permission => permission.parentCapability === 'eth_accounts');
            if (ethAccountsPermission) {
                await provider.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }]
                });
            }
        }
        catch (error) {
            throw new Error('Error revoking permissions:');
        }
    }
    async getWalletConnectProvider() {
        if (!this.walletConnectProvider) {
            try {
                EthersStoreUtil.setError(undefined);
                await this.createProvider();
            }
            catch (error) {
                EthersStoreUtil.setError(error);
            }
        }
        return this.walletConnectProvider;
    }
    syncRequestedNetworks(chains, chainImages) {
        const requestedCaipNetworks = chains?.map(chain => ({
            id: `${ConstantsUtil.EIP155}:${chain.chainId}`,
            name: chain.name,
            imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
            imageUrl: chainImages?.[chain.chainId]
        }));
        this.setRequestedCaipNetworks(requestedCaipNetworks ?? []);
    }
    async checkActiveWalletConnectProvider() {
        const WalletConnectProvider = await this.getWalletConnectProvider();
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (WalletConnectProvider) {
            if (walletId === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
                await this.setWalletConnectProvider();
            }
        }
        const isConnected = EthersStoreUtil.state.isConnected;
        EthersStoreUtil.setStatus(isConnected ? 'connected' : 'disconnected');
    }
    checkActiveInjectedProvider(config) {
        const InjectedProvider = config.injected;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (InjectedProvider) {
            if (walletId === ConstantsUtil.INJECTED_CONNECTOR_ID) {
                this.setInjectedProvider(config);
                this.watchInjected(config);
            }
        }
    }
    checkActiveCoinbaseProvider(config) {
        const CoinbaseProvider = config.coinbase;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (CoinbaseProvider) {
            if (walletId === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
                if (CoinbaseProvider.accounts && CoinbaseProvider.accounts?.length > 0) {
                    this.setCoinbaseProvider(config);
                    this.watchCoinbase(config);
                }
                else {
                    localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                    EthersStoreUtil.reset();
                }
            }
        }
    }
    checkActive6963Provider() {
        const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        if (currentActiveWallet) {
            const currentProvider = this.EIP6963Providers.find(provider => provider.info.name === currentActiveWallet);
            if (currentProvider) {
                this.setEIP6963Provider(currentProvider.provider, currentProvider.info.name);
            }
        }
    }
    async setWalletConnectProvider() {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID);
        const WalletConnectProvider = await this.getWalletConnectProvider();
        if (WalletConnectProvider) {
            EthersStoreUtil.setChainId(WalletConnectProvider.chainId);
            EthersStoreUtil.setProviderType('walletConnect');
            EthersStoreUtil.setProvider(WalletConnectProvider);
            EthersStoreUtil.setStatus('connected');
            EthersStoreUtil.setIsConnected(true);
            this.setAllAccounts(WalletConnectProvider.accounts.map(address => ({ address, type: 'eoa' })));
            const session = WalletConnectProvider.signer?.session;
            for (const address of WalletConnectProvider.accounts) {
                const label = session?.sessionProperties?.[address];
                if (label) {
                    this.addAddressLabel(address, label);
                }
            }
            this.setAddress(WalletConnectProvider.accounts?.[0]);
            this.watchWalletConnect();
        }
    }
    async setInjectedProvider(config) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.INJECTED_CONNECTOR_ID);
        const InjectedProvider = config.injected;
        if (InjectedProvider) {
            const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(InjectedProvider);
            if (addresses?.[0] && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('injected');
                EthersStoreUtil.setProvider(config.injected);
                EthersStoreUtil.setStatus('connected');
                EthersStoreUtil.setIsConnected(true);
                this.setAllAccounts(addresses.map(address => ({ address, type: 'eoa' })));
                this.setAddress(addresses[0]);
                this.watchCoinbase(config);
            }
        }
    }
    async setEIP6963Provider(provider, name) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, name);
        if (provider) {
            const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(provider);
            if (addresses?.[0] && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('eip6963');
                EthersStoreUtil.setProvider(provider);
                EthersStoreUtil.setStatus('connected');
                EthersStoreUtil.setIsConnected(true);
                this.setAllAccounts(addresses.map(address => ({ address, type: 'eoa' })));
                this.setAddress(addresses[0]);
                this.watchEIP6963(provider);
            }
        }
    }
    async setCoinbaseProvider(config) {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.COINBASE_SDK_CONNECTOR_ID);
        const CoinbaseProvider = config.coinbase;
        if (CoinbaseProvider) {
            const { addresses, chainId } = await EthersHelpersUtil.getUserInfo(CoinbaseProvider);
            if (addresses?.[0] && chainId) {
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType('coinbaseWalletSDK');
                EthersStoreUtil.setProvider(config.coinbase);
                EthersStoreUtil.setStatus('connected');
                EthersStoreUtil.setIsConnected(true);
                this.setAllAccounts(addresses.map(address => ({ address, type: 'eoa' })));
                this.setAddress(addresses[0]);
                this.watchCoinbase(config);
            }
        }
    }
    async setAuthProvider() {
        window?.localStorage.setItem(EthersConstantsUtil.WALLET_ID, ConstantsUtil.AUTH_CONNECTOR_ID);
        if (this.authProvider) {
            super.setLoading(true);
            const { address, chainId, smartAccountDeployed, preferredAccountType, accounts = [] } = await this.authProvider.connect({ chainId: this.getChainId() });
            const { smartAccountEnabledNetworks } = await this.authProvider.getSmartAccountEnabledNetworks();
            this.setSmartAccountEnabledNetworks(smartAccountEnabledNetworks);
            if (address && chainId) {
                this.setAllAccounts(accounts.length > 0
                    ? accounts
                    : [{ address, type: preferredAccountType }]);
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setProviderType(ConstantsUtil.AUTH_CONNECTOR_ID);
                EthersStoreUtil.setProvider(this.authProvider);
                EthersStoreUtil.setStatus('connected');
                EthersStoreUtil.setIsConnected(true);
                EthersStoreUtil.setAddress(address);
                EthersStoreUtil.setPreferredAccountType(preferredAccountType);
                this.setSmartAccountDeployed(Boolean(smartAccountDeployed), this.chain);
                this.watchAuth();
                this.watchModal();
            }
            super.setLoading(false);
        }
    }
    async watchWalletConnect() {
        const provider = await this.getWalletConnectProvider();
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = EthersHelpersUtil.hexStringToNumber(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        const accountsChangedHandler = async (accounts) => {
            if (accounts.length > 0) {
                await this.setWalletConnectProvider();
            }
        };
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchInjected(config) {
        const provider = config.injected;
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function accountsChangedHandler(accounts) {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getOriginalAddress(currentAccount));
            }
            else {
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        }
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = typeof chainId === 'string'
                    ? EthersHelpersUtil.hexStringToNumber(chainId)
                    : Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchEIP6963(provider) {
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider.removeListener('disconnect', disconnectHandler);
            provider.removeListener('accountsChanged', accountsChangedHandler);
            provider.removeListener('chainChanged', chainChangedHandler);
        }
        const accountsChangedHandler = (accounts) => {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getOriginalAddress(currentAccount));
                this.setAllAccounts(accounts.map(address => ({ address, type: 'eoa' })));
            }
            else {
                this.setAllAccounts([]);
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        };
        function chainChangedHandler(chainId) {
            if (chainId) {
                const chain = typeof chainId === 'string'
                    ? EthersHelpersUtil.hexStringToNumber(chainId)
                    : Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchCoinbase(config) {
        const provider = config.coinbase;
        const walletId = localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        function disconnectHandler() {
            localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
            EthersStoreUtil.reset();
            provider?.removeListener('disconnect', disconnectHandler);
            provider?.removeListener('accountsChanged', accountsChangedHandler);
            provider?.removeListener('chainChanged', chainChangedHandler);
        }
        function accountsChangedHandler(accounts) {
            const currentAccount = accounts?.[0];
            if (currentAccount) {
                EthersStoreUtil.setAddress(getOriginalAddress(currentAccount));
            }
            else {
                localStorage.removeItem(EthersConstantsUtil.WALLET_ID);
                EthersStoreUtil.reset();
            }
        }
        function chainChangedHandler(chainId) {
            if (chainId && walletId === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID) {
                const chain = Number(chainId);
                EthersStoreUtil.setChainId(chain);
            }
        }
        if (provider) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
        }
    }
    watchAuth() {
        if (this.authProvider) {
            this.authProvider.onRpcRequest(request => {
                if (W3mFrameHelpers.checkIfRequestExists(request)) {
                    if (!W3mFrameHelpers.checkIfRequestIsAllowed(request)) {
                        if (super.isOpen()) {
                            if (super.isTransactionStackEmpty()) {
                                return;
                            }
                            if (super.isTransactionShouldReplaceView()) {
                                super.replace('ApproveTransaction');
                            }
                            else {
                                super.redirect('ApproveTransaction');
                            }
                        }
                        else {
                            super.open({ view: 'ApproveTransaction' });
                        }
                    }
                }
                else {
                    super.open();
                    console.error(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_MESSAGE, {
                        method: request.method
                    });
                    setTimeout(() => {
                        this.showErrorMessage(W3mFrameRpcConstants.RPC_METHOD_NOT_ALLOWED_UI_MESSAGE);
                    }, 300);
                }
            });
            this.authProvider.onRpcResponse(response => {
                const responseType = W3mFrameHelpers.getResponseType(response);
                switch (responseType) {
                    case W3mFrameConstants.RPC_RESPONSE_TYPE_ERROR: {
                        const isModalOpen = super.isOpen();
                        if (isModalOpen) {
                            if (super.isTransactionStackEmpty()) {
                                super.close();
                            }
                            else {
                                super.popTransactionStack(true);
                            }
                        }
                        break;
                    }
                    case W3mFrameConstants.RPC_RESPONSE_TYPE_TX: {
                        if (super.isTransactionStackEmpty()) {
                            super.close();
                        }
                        else {
                            super.popTransactionStack();
                        }
                        break;
                    }
                    default:
                        break;
                }
            });
            this.authProvider.onNotConnected(() => {
                this.setIsConnected(false);
                super.setLoading(false);
            });
            this.authProvider.onIsConnected(({ preferredAccountType }) => {
                this.setIsConnected(true);
                super.setLoading(false);
                EthersStoreUtil.setPreferredAccountType(preferredAccountType);
            });
            this.authProvider.onSetPreferredAccount(({ address, type }) => {
                if (!address) {
                    return;
                }
                super.setLoading(true);
                const chainId = NetworkUtil.caipNetworkIdToNumber(this.getCaipNetwork()?.id);
                EthersStoreUtil.setAddress(address);
                EthersStoreUtil.setChainId(chainId);
                EthersStoreUtil.setStatus('connected');
                EthersStoreUtil.setIsConnected(true);
                EthersStoreUtil.setPreferredAccountType(type);
                this.syncAccount().then(() => super.setLoading(false));
            });
        }
    }
    watchModal() {
        if (this.authProvider) {
            this.subscribeState(val => {
                if (!val.open) {
                    this.authProvider?.rejectRpcRequest();
                }
            });
        }
    }
    async syncAccount() {
        const address = EthersStoreUtil.state.address;
        const chainId = EthersStoreUtil.state.chainId;
        const isConnected = EthersStoreUtil.state.isConnected;
        const preferredAccountType = EthersStoreUtil.state.preferredAccountType;
        this.resetAccount();
        if (isConnected && address && chainId) {
            const caipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
            this.setIsConnected(isConnected);
            this.setPreferredAccountType(preferredAccountType, this.chain);
            this.setCaipAddress(caipAddress);
            this.syncConnectedWalletInfo();
            const chain = this.chains.find(c => c.chainId === chainId);
            if (chain?.explorerUrl) {
                this.setAddressExplorerUrl(`${chain.explorerUrl}/address/${address}`);
            }
            await Promise.all([
                this.syncProfile(address),
                this.syncBalance(address),
                this.setApprovedCaipNetworksData()
            ]);
            this.hasSyncedConnectedAccount = true;
        }
        else if (!isConnected && this.hasSyncedConnectedAccount) {
            this.resetWcConnection();
            this.resetNetwork();
            this.setAllAccounts([]);
        }
    }
    async syncNetwork(chainImages) {
        const address = EthersStoreUtil.state.address;
        const chainId = EthersStoreUtil.state.chainId;
        const isConnected = EthersStoreUtil.state.isConnected;
        if (this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (chain) {
                const caipChainId = `${ConstantsUtil.EIP155}:${chain.chainId}`;
                this.setCaipNetwork({
                    id: caipChainId,
                    name: chain.name,
                    imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId],
                    imageUrl: chainImages?.[chain.chainId],
                    chain: this.chain
                });
                if (isConnected && address) {
                    const caipAddress = `${ConstantsUtil.EIP155}:${chainId}:${address}`;
                    this.setCaipAddress(caipAddress);
                    if (chain.explorerUrl) {
                        const url = `${chain.explorerUrl}/address/${address}`;
                        this.setAddressExplorerUrl(url);
                    }
                    else {
                        this.setAddressExplorerUrl(undefined);
                    }
                    if (this.hasSyncedConnectedAccount) {
                        await this.syncProfile(address);
                        await this.syncBalance(address);
                    }
                }
            }
            else if (isConnected) {
                this.setCaipNetwork({
                    id: `${ConstantsUtil.EIP155}:${chainId}`,
                    chain: this.chain
                });
            }
        }
    }
    async syncWalletConnectName(address) {
        try {
            const registeredWcNames = await this.getWalletConnectName(address);
            if (registeredWcNames[0]) {
                const wcName = registeredWcNames[0];
                this.setProfileName(wcName.name);
            }
            else {
                this.setProfileName(null);
            }
        }
        catch {
            this.setProfileName(null);
        }
    }
    async syncProfile(address) {
        const chainId = EthersStoreUtil.state.chainId;
        try {
            const { name, avatar } = await this.fetchIdentity({
                address
            });
            this.setProfileName(name);
            this.setProfileImage(avatar);
            if (!name) {
                await this.syncWalletConnectName(address);
            }
        }
        catch {
            if (chainId === 1) {
                const ensProvider = new InfuraProvider('mainnet');
                const name = await ensProvider.lookupAddress(address);
                const avatar = await ensProvider.getAvatar(address);
                if (name) {
                    this.setProfileName(name);
                }
                else {
                    await this.syncWalletConnectName(address);
                }
                if (avatar) {
                    this.setProfileImage(avatar);
                }
            }
            else {
                await this.syncWalletConnectName(address);
                this.setProfileImage(null);
            }
        }
    }
    async syncBalance(address) {
        const chainId = EthersStoreUtil.state.chainId;
        if (chainId && this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (chain) {
                const jsonRpcProvider = new JsonRpcProvider(chain.rpcUrl, {
                    chainId,
                    name: chain.name
                });
                if (jsonRpcProvider) {
                    const balance = await jsonRpcProvider.getBalance(address);
                    const formattedBalance = formatEther(balance);
                    this.setBalance(formattedBalance, chain.currency);
                }
            }
        }
    }
    syncConnectedWalletInfo() {
        const currentActiveWallet = window?.localStorage.getItem(EthersConstantsUtil.WALLET_ID);
        const providerType = EthersStoreUtil.state.providerType;
        if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID) {
            if (currentActiveWallet) {
                const currentProvider = this.EIP6963Providers.find(provider => provider.info.name === currentActiveWallet);
                if (currentProvider) {
                    this.setConnectedWalletInfo({ ...currentProvider.info }, this.chain);
                }
            }
        }
        else if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID) {
            const provider = EthersStoreUtil.state.provider;
            if (provider.session) {
                this.setConnectedWalletInfo({
                    ...provider.session.peer.metadata,
                    name: provider.session.peer.metadata.name,
                    icon: provider.session.peer.metadata.icons?.[0]
                }, this.chain);
            }
        }
        else if (currentActiveWallet) {
            this.setConnectedWalletInfo({ name: currentActiveWallet }, this.chain);
        }
    }
    async switchNetwork(chainId) {
        const provider = EthersStoreUtil.state.provider;
        const providerType = EthersStoreUtil.state.providerType;
        if (this.chains) {
            const chain = this.chains.find(c => c.chainId === chainId);
            if (providerType === ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID && chain) {
                const WalletConnectProvider = provider;
                if (WalletConnectProvider) {
                    try {
                        await WalletConnectProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chainId);
                    }
                    catch (switchError) {
                        const message = switchError?.message;
                        if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
                            throw new Error('Chain is not supported');
                        }
                        await EthersHelpersUtil.addEthereumChain(WalletConnectProvider, chain);
                    }
                }
            }
            else if (providerType === ConstantsUtil.INJECTED_CONNECTOR_ID && chain) {
                const InjectedProvider = provider;
                if (InjectedProvider) {
                    try {
                        await InjectedProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(InjectedProvider, chain);
                        }
                        else {
                            throw new Error('Chain is not supported');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.EIP6963_CONNECTOR_ID && chain) {
                const EIP6963Provider = provider;
                if (EIP6963Provider) {
                    try {
                        await EIP6963Provider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(EIP6963Provider, chain);
                        }
                        else {
                            throw new Error('Chain is not supported');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID && chain) {
                const CoinbaseProvider = provider;
                if (CoinbaseProvider) {
                    try {
                        await CoinbaseProvider.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: EthersHelpersUtil.numberToHexString(chain.chainId) }]
                        });
                        EthersStoreUtil.setChainId(chain.chainId);
                    }
                    catch (switchError) {
                        if (switchError.code === EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID ||
                            switchError.code === EthersConstantsUtil.ERROR_CODE_DEFAULT ||
                            switchError?.data?.originalError?.code ===
                                EthersConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID) {
                            await EthersHelpersUtil.addEthereumChain(CoinbaseProvider, chain);
                        }
                        else {
                            throw new Error('Error switching network');
                        }
                    }
                }
            }
            else if (providerType === ConstantsUtil.AUTH_CONNECTOR_ID) {
                if (this.authProvider && chain?.chainId) {
                    try {
                        super.setLoading(true);
                        await this.authProvider.switchNetwork(chain?.chainId);
                        EthersStoreUtil.setChainId(chain.chainId);
                        const { address, preferredAccountType } = await this.authProvider.connect({
                            chainId: chain?.chainId
                        });
                        EthersStoreUtil.setAddress(address);
                        EthersStoreUtil.setPreferredAccountType(preferredAccountType);
                        await this.syncAccount();
                    }
                    catch {
                        throw new Error('Switching chain failed');
                    }
                    finally {
                        super.setLoading(false);
                    }
                }
            }
        }
    }
    syncConnectors(config) {
        const w3mConnectors = [];
        const connectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID];
        if (connectorType) {
            w3mConnectors.push({
                id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
                explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                imageUrl: this.options?.connectorImages?.[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
                type: connectorType,
                chain: this.chain
            });
        }
        if (config.injected) {
            const injectedConnectorType = PresetsUtil.ConnectorTypesMap[ConstantsUtil.INJECTED_CONNECTOR_ID];
            if (injectedConnectorType) {
                w3mConnectors.push({
                    id: ConstantsUtil.INJECTED_CONNECTOR_ID,
                    explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    imageUrl: this.options?.connectorImages?.[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.INJECTED_CONNECTOR_ID],
                    type: injectedConnectorType,
                    chain: this.chain
                });
            }
        }
        if (config.coinbase) {
            w3mConnectors.push({
                id: ConstantsUtil.COINBASE_SDK_CONNECTOR_ID,
                explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
                imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
                imageUrl: this.options?.connectorImages?.[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
                name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID],
                type: 'EXTERNAL',
                chain: this.chain
            });
        }
        this.setConnectors(w3mConnectors);
    }
    async syncAuthConnector(projectId, auth) {
        if (typeof window !== 'undefined') {
            this.authProvider = new W3mFrameProvider(projectId);
            this.addConnector({
                id: ConstantsUtil.AUTH_CONNECTOR_ID,
                type: 'AUTH',
                name: 'Auth',
                provider: this.authProvider,
                email: auth?.email,
                socials: auth?.socials,
                showWallets: auth?.showWallets === undefined ? true : auth.showWallets,
                chain: this.chain,
                walletFeatures: auth?.walletFeatures
            });
            super.setLoading(true);
            const isLoginEmailUsed = this.authProvider.getLoginEmailUsed();
            super.setLoading(isLoginEmailUsed);
            const { isConnected } = await this.authProvider.isConnected();
            if (isConnected) {
                await this.setAuthProvider();
            }
            else {
                super.setLoading(false);
            }
        }
    }
    eip6963EventHandler(event) {
        if (event.detail) {
            const { info, provider } = event.detail;
            const connectors = this.getConnectors();
            const existingConnector = connectors.find(c => c.name === info.name);
            const coinbaseConnector = connectors.find(c => c.id === ConstantsUtil.COINBASE_SDK_CONNECTOR_ID);
            const isCoinbaseDuplicated = coinbaseConnector &&
                event.detail.info.rdns ===
                    ConstantsUtil.CONNECTOR_RDNS_MAP[ConstantsUtil.COINBASE_SDK_CONNECTOR_ID];
            if (!existingConnector && !isCoinbaseDuplicated) {
                const type = PresetsUtil.ConnectorTypesMap[ConstantsUtil.EIP6963_CONNECTOR_ID];
                if (type) {
                    this.addConnector({
                        id: ConstantsUtil.EIP6963_CONNECTOR_ID,
                        type,
                        imageUrl: info.icon ?? this.options?.connectorImages?.[ConstantsUtil.EIP6963_CONNECTOR_ID],
                        name: info.name,
                        provider,
                        info,
                        chain: this.chain
                    });
                    const eip6963ProviderObj = {
                        provider,
                        info
                    };
                    this.EIP6963Providers.push(eip6963ProviderObj);
                }
            }
        }
    }
    listenConnectors(enableEIP6963) {
        if (typeof window !== 'undefined' && enableEIP6963) {
            const handler = this.eip6963EventHandler.bind(this);
            window.addEventListener(ConstantsUtil.EIP6963_ANNOUNCE_EVENT, handler);
            window.dispatchEvent(new Event(ConstantsUtil.EIP6963_REQUEST_EVENT));
        }
    }
}
//# sourceMappingURL=client.js.map