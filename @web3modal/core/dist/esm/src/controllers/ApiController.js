import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy } from 'valtio/vanilla';
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js';
import { FetchUtil } from '../utils/FetchUtil.js';
import { StorageUtil } from '../utils/StorageUtil.js';
import { AssetController } from './AssetController.js';
import { ConnectorController } from './ConnectorController.js';
import { NetworkController } from './NetworkController.js';
import { OptionsController } from './OptionsController.js';
const baseUrl = CoreHelperUtil.getApiUrl();
export const api = new FetchUtil({ baseUrl, clientId: null });
const entries = '40';
const recommendedEntries = '4';
const state = proxy({
    page: 1,
    count: 0,
    featured: [],
    recommended: [],
    wallets: [],
    search: [],
    isAnalyticsEnabled: false,
    excludedRDNS: []
});
export const ApiController = {
    state,
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    _getApiHeaders() {
        const { projectId, sdkType, sdkVersion } = OptionsController.state;
        return {
            'x-project-id': projectId,
            'x-sdk-type': sdkType,
            'x-sdk-version': sdkVersion
        };
    },
    _filterOutExtensions(wallets) {
        if (OptionsController.state.isUniversalProvider) {
            return wallets.filter(w => Boolean(w.mobile_link || w.desktop_link || w.webapp_link));
        }
        return wallets;
    },
    async _fetchWalletImage(imageId) {
        const imageUrl = `${api.baseUrl}/getWalletImage/${imageId}`;
        const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() });
        AssetController.setWalletImage(imageId, URL.createObjectURL(blob));
    },
    async _fetchNetworkImage(imageId) {
        const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`;
        const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() });
        AssetController.setNetworkImage(imageId, URL.createObjectURL(blob));
    },
    async _fetchConnectorImage(imageId) {
        const imageUrl = `${api.baseUrl}/public/getAssetImage/${imageId}`;
        const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() });
        AssetController.setConnectorImage(imageId, URL.createObjectURL(blob));
    },
    async _fetchCurrencyImage(countryCode) {
        const imageUrl = `${api.baseUrl}/public/getCurrencyImage/${countryCode}`;
        const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() });
        AssetController.setCurrencyImage(countryCode, URL.createObjectURL(blob));
    },
    async _fetchTokenImage(symbol) {
        const imageUrl = `${api.baseUrl}/public/getTokenImage/${symbol}`;
        const blob = await api.getBlob({ path: imageUrl, headers: ApiController._getApiHeaders() });
        AssetController.setTokenImage(symbol, URL.createObjectURL(blob));
    },
    async fetchNetworkImages() {
        const requestedCaipNetworks = NetworkController.getRequestedCaipNetworks();
        const ids = requestedCaipNetworks?.map(({ imageId }) => imageId).filter(Boolean);
        if (ids) {
            await Promise.allSettled(ids.map(id => ApiController._fetchNetworkImage(id)));
        }
    },
    async fetchConnectorImages() {
        const { connectors } = ConnectorController.state;
        const ids = connectors.map(({ imageId }) => imageId).filter(Boolean);
        await Promise.allSettled(ids.map(id => ApiController._fetchConnectorImage(id)));
    },
    async fetchCurrencyImages(currencies = []) {
        await Promise.allSettled(currencies.map(currency => ApiController._fetchCurrencyImage(currency)));
    },
    async fetchTokenImages(tokens = []) {
        await Promise.allSettled(tokens.map(token => ApiController._fetchTokenImage(token)));
    },
    async fetchFeaturedWallets() {
        const { featuredWalletIds } = OptionsController.state;
        if (featuredWalletIds?.length) {
            const { data } = await api.get({
                path: '/getWallets',
                headers: ApiController._getApiHeaders(),
                params: {
                    page: '1',
                    entries: featuredWalletIds?.length
                        ? String(featuredWalletIds.length)
                        : recommendedEntries,
                    include: featuredWalletIds?.join(',')
                }
            });
            data.sort((a, b) => featuredWalletIds.indexOf(a.id) - featuredWalletIds.indexOf(b.id));
            const images = data.map(d => d.image_id).filter(Boolean);
            await Promise.allSettled(images.map(id => ApiController._fetchWalletImage(id)));
            state.featured = data;
        }
    },
    async fetchRecommendedWallets() {
        const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state;
        const exclude = [...(excludeWalletIds ?? []), ...(featuredWalletIds ?? [])].filter(Boolean);
        const { data, count } = await api.get({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                chains: NetworkController.state.caipNetwork?.id,
                entries: recommendedEntries,
                include: includeWalletIds?.join(','),
                exclude: exclude?.join(',')
            }
        });
        const recent = StorageUtil.getRecentWallets();
        const recommendedImages = data.map(d => d.image_id).filter(Boolean);
        const recentImages = recent.map(r => r.image_id).filter(Boolean);
        await Promise.allSettled([...recommendedImages, ...recentImages].map(id => ApiController._fetchWalletImage(id)));
        state.recommended = data;
        state.count = count ?? 0;
    },
    async fetchWallets({ page }) {
        const { includeWalletIds, excludeWalletIds, featuredWalletIds } = OptionsController.state;
        const exclude = [
            ...state.recommended.map(({ id }) => id),
            ...(excludeWalletIds ?? []),
            ...(featuredWalletIds ?? [])
        ].filter(Boolean);
        const { data, count } = await api.get({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: String(page),
                entries,
                chains: NetworkController.state.caipNetwork?.id,
                include: includeWalletIds?.join(','),
                exclude: exclude.join(',')
            }
        });
        const images = data.map(w => w.image_id).filter(Boolean);
        await Promise.allSettled([
            ...images.map(id => ApiController._fetchWalletImage(id)),
            CoreHelperUtil.wait(300)
        ]);
        state.wallets = CoreHelperUtil.uniqueBy([...state.wallets, ...ApiController._filterOutExtensions(data)], 'id');
        state.count = count > state.count ? count : state.count;
        state.page = page;
    },
    async searchWalletByIds({ ids }) {
        const { data } = await api.get({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: String(ids.length),
                chains: NetworkController.state.caipNetwork?.id,
                include: ids?.join(',')
            }
        });
        if (data) {
            data.forEach(wallet => {
                if (wallet?.rdns) {
                    state.excludedRDNS.push(wallet.rdns);
                }
            });
        }
    },
    async searchWallet({ search }) {
        const { includeWalletIds, excludeWalletIds } = OptionsController.state;
        state.search = [];
        const { data } = await api.get({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: search?.trim(),
                chains: NetworkController.state.caipNetwork?.id,
                include: includeWalletIds?.join(','),
                exclude: excludeWalletIds?.join(',')
            }
        });
        const images = data.map(w => w.image_id).filter(Boolean);
        await Promise.allSettled([
            ...images.map(id => ApiController._fetchWalletImage(id)),
            CoreHelperUtil.wait(300)
        ]);
        state.search = ApiController._filterOutExtensions(data);
    },
    async reFetchWallets() {
        state.page = 1;
        state.wallets = [];
        await ApiController.fetchFeaturedWallets();
        await ApiController.fetchRecommendedWallets();
    },
    prefetch() {
        const promises = [
            ApiController.fetchFeaturedWallets(),
            ApiController.fetchRecommendedWallets(),
            ApiController.fetchNetworkImages(),
            ApiController.fetchConnectorImages()
        ];
        if (OptionsController.state.enableAnalytics === undefined) {
            promises.push(ApiController.fetchAnalyticsConfig());
        }
        state.prefetchPromise = Promise.race([Promise.allSettled(promises), CoreHelperUtil.wait(3000)]);
    },
    async fetchAnalyticsConfig() {
        const { isAnalyticsEnabled } = await api.get({
            path: '/getAnalyticsConfig',
            headers: ApiController._getApiHeaders()
        });
        OptionsController.setEnableAnalytics(isAnalyticsEnabled);
    }
};
//# sourceMappingURL=ApiController.js.map