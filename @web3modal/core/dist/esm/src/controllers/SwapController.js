import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import { AccountController } from './AccountController.js';
import { ConstantsUtil } from '../utils/ConstantsUtil.js';
import { ConnectionController } from './ConnectionController.js';
import { SwapApiUtil } from '../utils/SwapApiUtil.js';
import { SnackController } from './SnackController.js';
import { RouterController } from './RouterController.js';
import { NumberUtil } from '@web3modal/common';
import { NetworkController } from './NetworkController.js';
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js';
import { BlockchainApiController } from './BlockchainApiController.js';
import { OptionsController } from './OptionsController.js';
import { SwapCalculationUtil } from '../utils/SwapCalculationUtil.js';
import { EventsController } from './EventsController.js';
import { W3mFrameRpcConstants } from '@web3modal/wallet';
import { StorageUtil } from '../utils/StorageUtil.js';
import { ConnectorController } from './ConnectorController.js';
export const INITIAL_GAS_LIMIT = 150000;
export const TO_AMOUNT_DECIMALS = 6;
class TransactionError extends Error {
    constructor(message, shortMessage) {
        super(message);
        this.name = 'TransactionError';
        this.shortMessage = shortMessage;
    }
}
const initialState = {
    initializing: false,
    initialized: false,
    loadingPrices: false,
    loadingQuote: false,
    loadingApprovalTransaction: false,
    loadingBuildTransaction: false,
    loadingTransaction: false,
    fetchError: false,
    approvalTransaction: undefined,
    swapTransaction: undefined,
    transactionError: undefined,
    sourceToken: undefined,
    sourceTokenAmount: '',
    sourceTokenPriceInUSD: 0,
    toToken: undefined,
    toTokenAmount: '',
    toTokenPriceInUSD: 0,
    networkPrice: '0',
    networkBalanceInUSD: '0',
    networkTokenSymbol: '',
    inputError: undefined,
    slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,
    tokens: undefined,
    popularTokens: undefined,
    suggestedTokens: undefined,
    foundTokens: undefined,
    myTokensWithBalance: undefined,
    tokensPriceMap: {},
    gasFee: '0',
    gasPriceInUSD: 0,
    priceImpact: undefined,
    maxSlippage: undefined,
    providerFee: undefined
};
const state = proxy(initialState);
export const SwapController = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    getParams() {
        const caipNetwork = NetworkController.state.caipNetwork;
        const address = AccountController.state.address;
        const networkAddress = `${caipNetwork?.id}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS}`;
        const type = StorageUtil.getConnectedConnector();
        const authConnector = ConnectorController.getAuthConnector();
        if (!address) {
            throw new Error('No address found to swap the tokens from.');
        }
        const caipAddress = AccountController.state.caipAddress;
        const invalidToToken = !state.toToken?.address || !state.toToken?.decimals;
        const invalidSourceToken = !state.sourceToken?.address ||
            !state.sourceToken?.decimals ||
            !NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0);
        const invalidSourceTokenAmount = !state.sourceTokenAmount;
        return {
            networkAddress,
            fromAddress: address,
            fromCaipAddress: AccountController.state.caipAddress,
            sourceTokenAddress: state.sourceToken?.address,
            toTokenAddress: state.toToken?.address,
            toTokenAmount: state.toTokenAmount,
            toTokenDecimals: state.toToken?.decimals,
            sourceTokenAmount: state.sourceTokenAmount,
            sourceTokenDecimals: state.sourceToken?.decimals,
            invalidToToken,
            invalidSourceToken,
            invalidSourceTokenAmount,
            availableToSwap: caipAddress && !invalidToToken && !invalidSourceToken && !invalidSourceTokenAmount,
            isAuthConnector: authConnector?.walletFeatures && type === 'AUTH'
        };
    },
    setSourceToken(sourceToken) {
        if (!sourceToken) {
            state.sourceToken = sourceToken;
            state.sourceTokenAmount = '';
            state.sourceTokenPriceInUSD = 0;
            return;
        }
        state.sourceToken = sourceToken;
        this.setTokenPrice(sourceToken.address, 'sourceToken');
    },
    setSourceTokenAmount(amount) {
        state.sourceTokenAmount = amount;
    },
    setToToken(toToken) {
        if (!toToken) {
            state.toToken = toToken;
            state.toTokenAmount = '';
            state.toTokenPriceInUSD = 0;
            return;
        }
        state.toToken = toToken;
        this.setTokenPrice(toToken.address, 'toToken');
    },
    setToTokenAmount(amount) {
        state.toTokenAmount = amount
            ? NumberUtil.formatNumberToLocalString(amount, TO_AMOUNT_DECIMALS)
            : '';
    },
    async setTokenPrice(address, target) {
        const { availableToSwap } = this.getParams();
        let price = state.tokensPriceMap[address] || 0;
        if (!price) {
            state.loadingPrices = true;
            price = await this.getAddressPrice(address);
        }
        if (target === 'sourceToken') {
            state.sourceTokenPriceInUSD = price;
        }
        else if (target === 'toToken') {
            state.toTokenPriceInUSD = price;
        }
        if (state.loadingPrices) {
            state.loadingPrices = false;
            if (availableToSwap) {
                this.swapTokens();
            }
        }
    },
    switchTokens() {
        if (state.initializing || !state.initialized) {
            return;
        }
        const newSourceToken = state.toToken ? { ...state.toToken } : undefined;
        const newToToken = state.sourceToken ? { ...state.sourceToken } : undefined;
        const newSourceTokenAmount = newSourceToken && state.toTokenAmount === '' ? '1' : state.toTokenAmount;
        this.setSourceToken(newSourceToken);
        this.setToToken(newToToken);
        this.setSourceTokenAmount(newSourceTokenAmount);
        this.setToTokenAmount('');
        this.swapTokens();
    },
    resetState() {
        state.myTokensWithBalance = initialState.myTokensWithBalance;
        state.tokensPriceMap = initialState.tokensPriceMap;
        state.initialized = initialState.initialized;
        state.sourceToken = initialState.sourceToken;
        state.sourceTokenAmount = initialState.sourceTokenAmount;
        state.sourceTokenPriceInUSD = initialState.sourceTokenPriceInUSD;
        state.toToken = initialState.toToken;
        state.toTokenAmount = initialState.toTokenAmount;
        state.toTokenPriceInUSD = initialState.toTokenPriceInUSD;
        state.networkPrice = initialState.networkPrice;
        state.networkTokenSymbol = initialState.networkTokenSymbol;
        state.networkBalanceInUSD = initialState.networkBalanceInUSD;
        state.inputError = initialState.inputError;
    },
    resetValues() {
        const { networkAddress } = this.getParams();
        const networkToken = state.tokens?.find(token => token.address === networkAddress);
        this.setSourceToken(networkToken);
        this.setToToken(undefined);
    },
    getApprovalLoadingState() {
        return state.loadingApprovalTransaction;
    },
    clearError() {
        state.transactionError = undefined;
    },
    async initializeState() {
        if (state.initializing) {
            return;
        }
        state.initializing = true;
        if (!state.initialized) {
            try {
                await this.fetchTokens();
                state.initialized = true;
            }
            catch (error) {
                state.initialized = false;
                SnackController.showError('Failed to initialize swap');
                RouterController.goBack();
            }
        }
        state.initializing = false;
    },
    async fetchTokens() {
        const { networkAddress } = this.getParams();
        await this.getTokenList();
        await this.getNetworkTokenPrice();
        await this.getMyTokensWithBalance();
        const networkToken = state.tokens?.find(token => token.address === networkAddress);
        if (networkToken) {
            state.networkTokenSymbol = networkToken.symbol;
            this.setSourceToken(networkToken);
            this.setSourceTokenAmount('1');
        }
    },
    async getTokenList() {
        const tokens = await SwapApiUtil.getTokenList();
        state.tokens = tokens;
        state.popularTokens = tokens.sort((aTokenInfo, bTokenInfo) => {
            if (aTokenInfo.symbol < bTokenInfo.symbol) {
                return -1;
            }
            if (aTokenInfo.symbol > bTokenInfo.symbol) {
                return 1;
            }
            return 0;
        });
        state.suggestedTokens = tokens.filter(token => {
            if (ConstantsUtil.SWAP_SUGGESTED_TOKENS.includes(token.symbol)) {
                return true;
            }
            return false;
        }, {});
    },
    async getAddressPrice(address) {
        const existPrice = state.tokensPriceMap[address];
        if (existPrice) {
            return existPrice;
        }
        const response = await BlockchainApiController.fetchTokenPrice({
            projectId: OptionsController.state.projectId,
            addresses: [address]
        });
        const fungibles = response.fungibles || [];
        const allTokens = [...(state.tokens || []), ...(state.myTokensWithBalance || [])];
        const symbol = allTokens?.find(token => token.address === address)?.symbol;
        const price = fungibles.find(p => p.symbol.toLowerCase() === symbol?.toLowerCase())?.price || 0;
        const priceAsFloat = parseFloat(price.toString());
        state.tokensPriceMap[address] = priceAsFloat;
        return priceAsFloat;
    },
    async getNetworkTokenPrice() {
        const { networkAddress } = this.getParams();
        const response = await BlockchainApiController.fetchTokenPrice({
            projectId: OptionsController.state.projectId,
            addresses: [networkAddress]
        });
        const token = response.fungibles?.[0];
        const price = token?.price.toString() || '0';
        state.tokensPriceMap[networkAddress] = parseFloat(price);
        state.networkTokenSymbol = token?.symbol || '';
        state.networkPrice = price;
    },
    async getMyTokensWithBalance(forceUpdate) {
        const balances = await SwapApiUtil.getMyTokensWithBalance(forceUpdate);
        if (!balances) {
            return;
        }
        await this.getInitialGasPrice();
        this.setBalances(balances);
    },
    setBalances(balances) {
        const { networkAddress } = this.getParams();
        const caipNetwork = NetworkController.state.caipNetwork;
        if (!caipNetwork) {
            return;
        }
        const networkToken = balances.find(token => token.address === networkAddress);
        balances.forEach(token => {
            state.tokensPriceMap[token.address] = token.price || 0;
        });
        state.myTokensWithBalance = balances.filter(token => token.address.startsWith(caipNetwork.id));
        state.networkBalanceInUSD = networkToken
            ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
            : '0';
    },
    async getInitialGasPrice() {
        const res = await SwapApiUtil.fetchGasPrice();
        if (!res) {
            return { gasPrice: null, gasPriceInUsd: null };
        }
        const value = res.standard;
        const gasFee = BigInt(value);
        const gasLimit = BigInt(INITIAL_GAS_LIMIT);
        const gasPrice = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gasLimit, gasFee);
        state.gasFee = value;
        state.gasPriceInUSD = gasPrice;
        return { gasPrice: gasFee, gasPriceInUSD: state.gasPriceInUSD };
    },
    async swapTokens() {
        const address = AccountController.state.address;
        const sourceToken = state.sourceToken;
        const toToken = state.toToken;
        const haveSourceTokenAmount = NumberUtil.bigNumber(state.sourceTokenAmount).isGreaterThan(0);
        if (!toToken || !sourceToken || state.loadingPrices || !haveSourceTokenAmount) {
            return;
        }
        state.loadingQuote = true;
        const amountDecimal = NumberUtil.bigNumber(state.sourceTokenAmount).multipliedBy(10 ** sourceToken.decimals);
        const quoteResponse = await BlockchainApiController.fetchSwapQuote({
            userAddress: address,
            projectId: OptionsController.state.projectId,
            from: sourceToken.address,
            to: toToken.address,
            gasPrice: state.gasFee,
            amount: amountDecimal.toString()
        });
        state.loadingQuote = false;
        const quoteToAmount = quoteResponse?.quotes?.[0]?.toAmount;
        if (!quoteToAmount) {
            return;
        }
        const toTokenAmount = NumberUtil.bigNumber(quoteToAmount)
            .dividedBy(10 ** toToken.decimals)
            .toString();
        this.setToTokenAmount(toTokenAmount);
        const isInsufficientToken = this.hasInsufficientToken(state.sourceTokenAmount, sourceToken.address);
        if (isInsufficientToken) {
            state.inputError = 'Insufficient balance';
        }
        else {
            state.inputError = undefined;
            this.setTransactionDetails();
        }
    },
    async getTransaction() {
        const { fromCaipAddress, availableToSwap } = this.getParams();
        const sourceToken = state.sourceToken;
        const toToken = state.toToken;
        if (!fromCaipAddress || !availableToSwap || !sourceToken || !toToken || state.loadingQuote) {
            return undefined;
        }
        try {
            state.loadingBuildTransaction = true;
            const hasAllowance = await SwapApiUtil.fetchSwapAllowance({
                userAddress: fromCaipAddress,
                tokenAddress: sourceToken.address,
                sourceTokenAmount: state.sourceTokenAmount,
                sourceTokenDecimals: sourceToken.decimals
            });
            let transaction = undefined;
            if (hasAllowance) {
                transaction = await this.createSwapTransaction();
            }
            else {
                transaction = await this.createAllowanceTransaction();
            }
            state.loadingBuildTransaction = false;
            state.fetchError = false;
            return transaction;
        }
        catch (error) {
            RouterController.goBack();
            SnackController.showError('Failed to check allowance');
            state.loadingBuildTransaction = false;
            state.approvalTransaction = undefined;
            state.swapTransaction = undefined;
            state.fetchError = true;
            return undefined;
        }
    },
    async createAllowanceTransaction() {
        const { fromCaipAddress, fromAddress, sourceTokenAddress, toTokenAddress } = this.getParams();
        if (!fromCaipAddress || !toTokenAddress) {
            return undefined;
        }
        if (!sourceTokenAddress) {
            throw new Error('createAllowanceTransaction - No source token address found.');
        }
        try {
            const response = await BlockchainApiController.generateApproveCalldata({
                projectId: OptionsController.state.projectId,
                from: sourceTokenAddress,
                to: toTokenAddress,
                userAddress: fromCaipAddress
            });
            const gasLimit = await ConnectionController.estimateGas({
                address: fromAddress,
                to: CoreHelperUtil.getPlainAddress(response.tx.to),
                data: response.tx.data
            });
            const transaction = {
                data: response.tx.data,
                to: CoreHelperUtil.getPlainAddress(response.tx.from),
                gas: gasLimit,
                gasPrice: BigInt(response.tx.eip155.gasPrice),
                value: BigInt(response.tx.value),
                toAmount: state.toTokenAmount
            };
            state.swapTransaction = undefined;
            state.approvalTransaction = transaction;
            return transaction;
        }
        catch (error) {
            RouterController.goBack();
            SnackController.showError('Failed to create approval transaction');
            state.approvalTransaction = undefined;
            state.swapTransaction = undefined;
            state.fetchError = true;
            return undefined;
        }
    },
    async createSwapTransaction() {
        const { networkAddress, fromCaipAddress, sourceTokenAmount } = this.getParams();
        const sourceToken = state.sourceToken;
        const toToken = state.toToken;
        if (!fromCaipAddress || !sourceTokenAmount || !sourceToken || !toToken) {
            return undefined;
        }
        const amount = ConnectionController.parseUnits(sourceTokenAmount, sourceToken.decimals).toString();
        try {
            const response = await BlockchainApiController.generateSwapCalldata({
                projectId: OptionsController.state.projectId,
                userAddress: fromCaipAddress,
                from: sourceToken.address,
                to: toToken.address,
                amount
            });
            const isSourceTokenIsNetworkToken = sourceToken.address === networkAddress;
            const gas = BigInt(response.tx.eip155.gas);
            const gasPrice = BigInt(response.tx.eip155.gasPrice);
            const transaction = {
                data: response.tx.data,
                to: CoreHelperUtil.getPlainAddress(response.tx.to),
                gas,
                gasPrice,
                value: isSourceTokenIsNetworkToken ? BigInt(amount) : BigInt('0'),
                toAmount: state.toTokenAmount
            };
            state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, gas, gasPrice);
            state.approvalTransaction = undefined;
            state.swapTransaction = transaction;
            return transaction;
        }
        catch (error) {
            RouterController.goBack();
            SnackController.showError('Failed to create transaction');
            state.approvalTransaction = undefined;
            state.swapTransaction = undefined;
            state.fetchError = true;
            return undefined;
        }
    },
    async sendTransactionForApproval(data) {
        const { fromAddress, isAuthConnector } = this.getParams();
        state.loadingApprovalTransaction = true;
        const approveLimitMessage = `Approve limit increase in your wallet`;
        if (isAuthConnector) {
            RouterController.pushTransactionStack({
                view: null,
                goBack: true,
                onSuccess() {
                    SnackController.showLoading(approveLimitMessage);
                }
            });
        }
        else {
            SnackController.showLoading(approveLimitMessage);
        }
        try {
            await ConnectionController.sendTransaction({
                address: fromAddress,
                to: data.to,
                data: data.data,
                value: BigInt(data.value),
                gasPrice: BigInt(data.gasPrice)
            });
            await this.swapTokens();
            await this.getTransaction();
            state.approvalTransaction = undefined;
            state.loadingApprovalTransaction = false;
        }
        catch (err) {
            const error = err;
            state.transactionError = error?.shortMessage;
            state.loadingApprovalTransaction = false;
            SnackController.showError(error?.shortMessage || 'Transaction error');
        }
    },
    async sendTransactionForSwap(data) {
        if (!data) {
            return undefined;
        }
        const { fromAddress, toTokenAmount, isAuthConnector } = this.getParams();
        state.loadingTransaction = true;
        const snackbarPendingMessage = `Swapping ${state.sourceToken
            ?.symbol} to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken
            ?.symbol}`;
        const snackbarSuccessMessage = `Swapped ${state.sourceToken
            ?.symbol} to ${NumberUtil.formatNumberToLocalString(toTokenAmount, 3)} ${state.toToken
            ?.symbol}`;
        if (isAuthConnector) {
            RouterController.pushTransactionStack({
                view: 'Account',
                goBack: false,
                onSuccess() {
                    SnackController.showLoading(snackbarPendingMessage);
                    SwapController.resetState();
                }
            });
        }
        else {
            SnackController.showLoading('Confirm transaction in your wallet');
        }
        try {
            const forceUpdateAddresses = [state.sourceToken?.address, state.toToken?.address].join(',');
            const transactionHash = await ConnectionController.sendTransaction({
                address: fromAddress,
                to: data.to,
                data: data.data,
                gas: data.gas,
                gasPrice: BigInt(data.gasPrice),
                value: data.value
            });
            state.loadingTransaction = false;
            SnackController.showSuccess(snackbarSuccessMessage);
            EventsController.sendEvent({
                type: 'track',
                event: 'SWAP_SUCCESS',
                properties: {
                    network: NetworkController.state.caipNetwork?.id || '',
                    swapFromToken: this.state.sourceToken?.symbol || '',
                    swapToToken: this.state.toToken?.symbol || '',
                    swapFromAmount: this.state.sourceTokenAmount || '',
                    swapToAmount: this.state.toTokenAmount || '',
                    isSmartAccount: AccountController.state.preferredAccountType ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                }
            });
            SwapController.resetState();
            if (!isAuthConnector) {
                RouterController.replace('Account');
            }
            SwapController.getMyTokensWithBalance(forceUpdateAddresses);
            return transactionHash;
        }
        catch (err) {
            const error = err;
            state.transactionError = error?.shortMessage;
            state.loadingTransaction = false;
            SnackController.showError(error?.shortMessage || 'Transaction error');
            EventsController.sendEvent({
                type: 'track',
                event: 'SWAP_ERROR',
                properties: {
                    network: NetworkController.state.caipNetwork?.id || '',
                    swapFromToken: this.state.sourceToken?.symbol || '',
                    swapToToken: this.state.toToken?.symbol || '',
                    swapFromAmount: this.state.sourceTokenAmount || '',
                    swapToAmount: this.state.toTokenAmount || '',
                    isSmartAccount: AccountController.state.preferredAccountType ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                }
            });
            return undefined;
        }
    },
    hasInsufficientToken(sourceTokenAmount, sourceTokenAddress) {
        const isInsufficientSourceTokenForSwap = SwapCalculationUtil.isInsufficientSourceTokenForSwap(sourceTokenAmount, sourceTokenAddress, state.myTokensWithBalance);
        const insufficientNetworkTokenForGas = SwapCalculationUtil.isInsufficientNetworkTokenForGas(state.networkBalanceInUSD, state.gasPriceInUSD);
        return insufficientNetworkTokenForGas || isInsufficientSourceTokenForSwap;
    },
    setTransactionDetails() {
        const { toTokenAddress, toTokenDecimals } = this.getParams();
        if (!toTokenAddress || !toTokenDecimals) {
            return;
        }
        state.gasPriceInUSD = SwapCalculationUtil.getGasPriceInUSD(state.networkPrice, BigInt(state.gasFee), BigInt(INITIAL_GAS_LIMIT));
        state.priceImpact = SwapCalculationUtil.getPriceImpact({
            sourceTokenAmount: state.sourceTokenAmount,
            sourceTokenPriceInUSD: state.sourceTokenPriceInUSD,
            toTokenPriceInUSD: state.toTokenPriceInUSD,
            toTokenAmount: state.toTokenAmount
        });
        state.maxSlippage = SwapCalculationUtil.getMaxSlippage(state.slippage, state.toTokenAmount);
        state.providerFee = SwapCalculationUtil.getProviderFee(state.sourceTokenAmount);
    }
};
//# sourceMappingURL=SwapController.js.map