import { ConstantsUtil } from '../utils/ConstantsUtil.js';
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js';
import { FetchUtil } from '../utils/FetchUtil.js';
import { ConstantsUtil as CommonConstantsUtil } from '@web3modal/common';
import { OptionsController } from './OptionsController.js';
import { proxy } from 'valtio/vanilla';
const DEFAULT_OPTIONS = {
    purchaseCurrencies: [
        {
            id: '2b92315d-eab7-5bef-84fa-089a131333f5',
            name: 'USD Coin',
            symbol: 'USDC',
            networks: [
                {
                    name: 'ethereum-mainnet',
                    display_name: 'Ethereum',
                    chain_id: '1',
                    contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
                },
                {
                    name: 'polygon-mainnet',
                    display_name: 'Polygon',
                    chain_id: '137',
                    contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
                }
            ]
        },
        {
            id: '2b92315d-eab7-5bef-84fa-089a131333f5',
            name: 'Ether',
            symbol: 'ETH',
            networks: [
                {
                    name: 'ethereum-mainnet',
                    display_name: 'Ethereum',
                    chain_id: '1',
                    contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
                },
                {
                    name: 'polygon-mainnet',
                    display_name: 'Polygon',
                    chain_id: '137',
                    contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
                }
            ]
        }
    ],
    paymentCurrencies: [
        {
            id: 'USD',
            payment_method_limits: [
                {
                    id: 'card',
                    min: '10.00',
                    max: '7500.00'
                },
                {
                    id: 'ach_bank_account',
                    min: '10.00',
                    max: '25000.00'
                }
            ]
        },
        {
            id: 'EUR',
            payment_method_limits: [
                {
                    id: 'card',
                    min: '10.00',
                    max: '7500.00'
                },
                {
                    id: 'ach_bank_account',
                    min: '10.00',
                    max: '25000.00'
                }
            ]
        }
    ]
};
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();
const state = proxy({
    clientId: null,
    api: new FetchUtil({ baseUrl, clientId: null })
});
export const BlockchainApiController = {
    state,
    fetchIdentity({ address }) {
        return state.api.get({
            path: `/v1/identity/${address}`,
            params: {
                projectId: OptionsController.state.projectId
            }
        });
    },
    fetchTransactions({ account, projectId, cursor, onramp, signal, cache }) {
        const queryParams = cursor ? { cursor } : {};
        return state.api.get({
            path: `/v1/account/${account}/history?projectId=${projectId}${onramp ? `&onramp=${onramp}` : ''}`,
            params: queryParams,
            signal,
            cache
        });
    },
    fetchSwapQuote({ projectId, amount, userAddress, from, to, gasPrice }) {
        return state.api.get({
            path: `/v1/convert/quotes`,
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                projectId,
                amount,
                userAddress,
                from,
                to,
                gasPrice
            }
        });
    },
    fetchSwapTokens({ projectId, chainId }) {
        return state.api.get({
            path: `/v1/convert/tokens?projectId=${projectId}&chainId=${chainId}`
        });
    },
    fetchTokenPrice({ projectId, addresses }) {
        return state.api.post({
            path: '/v1/fungible/price',
            body: {
                projectId,
                currency: 'usd',
                addresses
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    fetchSwapAllowance({ projectId, tokenAddress, userAddress }) {
        const { sdkType, sdkVersion } = OptionsController.state;
        return state.api.get({
            path: `/v1/convert/allowance?projectId=${projectId}&tokenAddress=${tokenAddress}&userAddress=${userAddress}`,
            headers: {
                'Content-Type': 'application/json',
                'x-sdk-type': sdkType,
                'x-sdk-version': sdkVersion
            }
        });
    },
    fetchGasPrice({ projectId, chainId }) {
        const { sdkType, sdkVersion } = OptionsController.state;
        return state.api.get({
            path: `/v1/convert/gas-price`,
            headers: {
                'Content-Type': 'application/json',
                'x-sdk-type': sdkType,
                'x-sdk-version': sdkVersion
            },
            params: {
                projectId,
                chainId
            }
        });
    },
    generateSwapCalldata({ amount, from, projectId, to, userAddress }) {
        return state.api.post({
            path: '/v1/convert/build-transaction',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                amount,
                eip155: {
                    slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE
                },
                from,
                projectId,
                to,
                userAddress
            }
        });
    },
    generateApproveCalldata({ from, projectId, to, userAddress }) {
        const { sdkType, sdkVersion } = OptionsController.state;
        return state.api.get({
            path: `/v1/convert/build-approve`,
            headers: {
                'Content-Type': 'application/json',
                'x-sdk-type': sdkType,
                'x-sdk-version': sdkVersion
            },
            params: {
                projectId,
                userAddress,
                from,
                to
            }
        });
    },
    async getBalance(address, chainId, forceUpdate) {
        const { sdkType, sdkVersion } = OptionsController.state;
        return state.api.get({
            path: `/v1/account/${address}/balance`,
            headers: {
                'x-sdk-type': sdkType,
                'x-sdk-version': sdkVersion
            },
            params: {
                currency: 'usd',
                projectId: OptionsController.state.projectId,
                chainId,
                forceUpdate
            }
        });
    },
    async lookupEnsName(name) {
        return state.api.get({
            path: `/v1/profile/account/${name}${CommonConstantsUtil.WC_NAME_SUFFIX}?projectId=${OptionsController.state.projectId}`
        });
    },
    async reverseLookupEnsName({ address }) {
        return state.api.get({
            path: `/v1/profile/reverse/${address}?projectId=${OptionsController.state.projectId}`
        });
    },
    async getEnsNameSuggestions(name) {
        return state.api.get({
            path: `/v1/profile/suggestions/${name}?projectId=${OptionsController.state.projectId}`
        });
    },
    async registerEnsName({ coinType, address, message, signature }) {
        return state.api.post({
            path: `/v1/profile/account`,
            body: { coin_type: coinType, address, message, signature },
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    async generateOnRampURL({ destinationWallets, partnerUserId, defaultNetwork, purchaseAmount, paymentAmount }) {
        const response = await state.api.post({
            path: `/v1/generators/onrampurl?projectId=${OptionsController.state.projectId}`,
            body: {
                destinationWallets,
                defaultNetwork,
                partnerUserId,
                defaultExperience: 'buy',
                presetCryptoAmount: purchaseAmount,
                presetFiatAmount: paymentAmount
            }
        });
        return response.url;
    },
    async getOnrampOptions() {
        try {
            const response = await state.api.get({
                path: `/v1/onramp/options?projectId=${OptionsController.state.projectId}`
            });
            return response;
        }
        catch (e) {
            return DEFAULT_OPTIONS;
        }
    },
    async getOnrampQuote({ purchaseCurrency, paymentCurrency, amount, network }) {
        try {
            const response = await state.api.post({
                path: `/v1/onramp/quote?projectId=${OptionsController.state.projectId}`,
                body: {
                    purchaseCurrency,
                    paymentCurrency,
                    amount,
                    network
                }
            });
            return response;
        }
        catch (e) {
            return {
                coinbaseFee: { amount, currency: paymentCurrency.id },
                networkFee: { amount, currency: paymentCurrency.id },
                paymentSubtotal: { amount, currency: paymentCurrency.id },
                paymentTotal: { amount, currency: paymentCurrency.id },
                purchaseAmount: { amount, currency: paymentCurrency.id },
                quoteId: 'mocked-quote-id'
            };
        }
    },
    setClientId(clientId) {
        state.clientId = clientId;
        state.api = new FetchUtil({ baseUrl, clientId });
    }
};
//# sourceMappingURL=BlockchainApiController.js.map