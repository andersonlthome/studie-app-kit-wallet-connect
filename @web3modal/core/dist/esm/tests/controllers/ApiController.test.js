import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ApiController, AssetController, ChainController, ConnectorController, NetworkController, OptionsController } from '../../index.js';
import { api } from '../../src/controllers/ApiController.js';
import { ConstantsUtil } from '@web3modal/common';
beforeAll(() => {
    ChainController.initialize([{ chain: ConstantsUtil.CHAIN.EVM }]);
});
describe('ApiController', () => {
    it('should have valid default state', () => {
        expect(ApiController.state).toEqual({
            page: 1,
            count: 0,
            featured: [],
            recommended: [],
            wallets: [],
            search: [],
            isAnalyticsEnabled: false,
            excludedRDNS: []
        });
    });
    it('should fetch wallet image and update AssetController state correctly', async () => {
        const imageId = '123';
        const image = 'image.jpg';
        const blob = new Blob([image]);
        const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob);
        await ApiController._fetchWalletImage(imageId);
        expect(fetchSpy).toHaveBeenCalledWith({
            path: `${api.baseUrl}/getWalletImage/${imageId}`,
            headers: ApiController._getApiHeaders()
        });
        expect(AssetController.state.walletImages[imageId]).toMatch(/^blob:/u);
    });
    it('should fetch network image and update AssetController state correctly', async () => {
        const imageId = '123';
        const image = 'image.jpg';
        const blob = new Blob([image]);
        const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob);
        await ApiController._fetchNetworkImage(imageId);
        expect(fetchSpy).toHaveBeenCalledWith({
            path: `${api.baseUrl}/public/getAssetImage/${imageId}`,
            headers: ApiController._getApiHeaders()
        });
        expect(AssetController.state.networkImages[imageId]).toMatch(/^blob:/u);
    });
    it('should fetch connector image and update AssetController state correctly', async () => {
        const imageId = '123';
        const image = 'image.jpg';
        const blob = new Blob([image]);
        const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob);
        await ApiController._fetchConnectorImage(imageId);
        expect(fetchSpy).toHaveBeenCalledWith({
            path: `${api.baseUrl}/public/getAssetImage/${imageId}`,
            headers: ApiController._getApiHeaders()
        });
        expect(AssetController.state.connectorImages[imageId]).toMatch(/^blob:/u);
    });
    it('should fetch currency image and update AssetController state correctly', async () => {
        const countryCode = 'AR';
        const image = 'image.jpg';
        const blob = new Blob([image]);
        const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob);
        await ApiController._fetchCurrencyImage(countryCode);
        expect(fetchSpy).toHaveBeenCalledWith({
            path: `${api.baseUrl}/public/getCurrencyImage/${countryCode}`,
            headers: ApiController._getApiHeaders()
        });
        expect(AssetController.state.currencyImages[countryCode]).toMatch(/^blob:/u);
    });
    it('should fetch token image and update AssetController state correctly', async () => {
        const symbol = 'AR';
        const image = 'image.jpg';
        const blob = new Blob([image]);
        const fetchSpy = vi.spyOn(api, 'getBlob').mockResolvedValueOnce(blob);
        await ApiController._fetchTokenImage(symbol);
        expect(fetchSpy).toHaveBeenCalledWith({
            path: `${api.baseUrl}/public/getTokenImage/${symbol}`,
            headers: ApiController._getApiHeaders()
        });
        expect(AssetController.state.tokenImages[symbol]).toMatch(/^blob:/u);
    });
    it('should fetch network images ', async () => {
        NetworkController.setRequestedCaipNetworks([
            {
                id: '155:1',
                name: 'Ethereum Mainnet',
                imageId: '12341',
                chain: ConstantsUtil.CHAIN.EVM
            },
            {
                id: '155:4',
                name: 'Ethereum Rinkeby',
                imageId: '12342',
                chain: ConstantsUtil.CHAIN.EVM
            },
            {
                id: '155:42',
                name: 'Ethereum Kovan',
                chain: ConstantsUtil.CHAIN.EVM
            }
        ]);
        const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue();
        await ApiController.fetchNetworkImages();
        expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    it('should only fetch network images for networks with imageIds', async () => {
        NetworkController.setRequestedCaipNetworks([
            {
                id: '155:1',
                name: 'Ethereum Mainnet',
                imageId: '12341',
                chain: ConstantsUtil.CHAIN.EVM
            },
            {
                id: '155:4',
                name: 'Ethereum Rinkeby',
                imageId: '12342',
                chain: ConstantsUtil.CHAIN.EVM
            },
            {
                id: '155:42',
                name: 'Ethereum Kovan',
                chain: ConstantsUtil.CHAIN.EVM
            }
        ]);
        const fetchSpy = vi.spyOn(ApiController, '_fetchNetworkImage').mockResolvedValue();
        await ApiController.fetchNetworkImages();
        expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    it('should fetch connector images', async () => {
        ConnectorController.setConnectors([
            {
                id: '12341',
                name: 'MetaMask',
                imageId: '12341',
                type: 'INJECTED',
                chain: ConstantsUtil.CHAIN.EVM
            },
            {
                id: '12341',
                name: 'RandomConnector',
                type: 'INJECTED',
                chain: ConstantsUtil.CHAIN.EVM
            }
        ]);
        const fetchSpy = vi.spyOn(ApiController, '_fetchConnectorImage').mockResolvedValue();
        await ApiController.fetchConnectorImages();
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    it('should fetch currency images', async () => {
        const currencies = ['USD', 'EUR'];
        const fetchSpy = vi.spyOn(ApiController, '_fetchCurrencyImage').mockResolvedValue();
        await ApiController.fetchCurrencyImages(currencies);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    it('should fetch token images', async () => {
        const currencies = ['USDC', 'ETH'];
        const fetchSpy = vi.spyOn(ApiController, '_fetchCurrencyImage').mockResolvedValue();
        await ApiController.fetchCurrencyImages(currencies);
        expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    it('should fetch featured wallets with configured featured wallets', async () => {
        const featuredWalletIds = ['12341', '12342'];
        const data = [
            {
                id: '12341',
                name: 'MetaMask',
                image_id: '12341'
            },
            {
                id: '12342',
                name: 'RandomWallet',
                image_id: '12342'
            },
            {
                id: '12343',
                name: 'RandomWallet'
            }
        ];
        OptionsController.setFeaturedWalletIds(featuredWalletIds);
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.fetchFeaturedWallets();
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '2',
                include: '12341,12342'
            }
        });
        expect(fetchImageSpy).toHaveBeenCalledTimes(2);
        expect(ApiController.state.featured).toEqual(data);
    });
    it('should not fetch featured wallets without configured featured wallets', async () => {
        OptionsController.setFeaturedWalletIds([]);
        const fetchSpy = vi.spyOn(api, 'get');
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.fetchFeaturedWallets();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(fetchImageSpy).not.toHaveBeenCalled();
    });
    it('should fetch recommended wallets with configured recommended wallets', async () => {
        const includeWalletIds = ['12341', '12342'];
        const excludeWalletIds = ['12343'];
        const featuredWalletIds = ['12344'];
        const data = [
            {
                id: '12341',
                name: 'MetaMask',
                image_id: '12341'
            },
            {
                id: '12342',
                name: 'RandomWallet',
                image_id: '12342'
            },
            {
                id: '12343',
                name: 'RandomWallet'
            }
        ];
        OptionsController.setIncludeWalletIds(includeWalletIds);
        OptionsController.setExcludeWalletIds(excludeWalletIds);
        OptionsController.setFeaturedWalletIds(featuredWalletIds);
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.fetchRecommendedWallets();
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '4',
                include: '12341,12342',
                exclude: '12343,12344'
            }
        });
        expect(fetchImageSpy).toHaveBeenCalledTimes(2);
        expect(ApiController.state.recommended).toEqual(data);
        expect(ApiController.state.count).toBe(data.length);
    });
    it('should fetch recommended wallet images without configured recommended wallets', async () => {
        OptionsController.setIncludeWalletIds([]);
        OptionsController.setExcludeWalletIds([]);
        OptionsController.setFeaturedWalletIds([]);
        ApiController.state.recommended = [];
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [], count: 0 });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.fetchRecommendedWallets();
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '4',
                include: '',
                exclude: ''
            }
        });
        expect(fetchImageSpy).not.toHaveBeenCalled();
    });
    it('should fetch wallets with configured recommended wallets', async () => {
        const includeWalletIds = ['12341', '12342'];
        const excludeWalletIds = ['12343'];
        const featuredWalletIds = ['12344'];
        const data = [
            {
                id: '12341',
                name: 'MetaMask',
                image_id: '12341'
            },
            {
                id: '12342',
                name: 'RandomWallet',
                image_id: '12342'
            }
        ];
        OptionsController.setIncludeWalletIds(includeWalletIds);
        OptionsController.setExcludeWalletIds(excludeWalletIds);
        OptionsController.setFeaturedWalletIds(featuredWalletIds);
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.fetchWallets({ page: 1 });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '40',
                include: '12341,12342',
                exclude: '12343,12344'
            }
        });
        expect(fetchImageSpy).toHaveBeenCalledTimes(2);
        expect(ApiController.state.wallets).toEqual(data);
    });
    it('should fetch excludedWalletIds and check if RDNS of EIP6963 matches', async () => {
        const excludeWalletIds = ['12345', '12346'];
        const EIP6963Wallets = [
            { name: 'MetaMask', rdns: 'io.metamask' },
            { name: 'Rainbow', rdns: 'me.rainbow' }
        ];
        const filteredWallet = [{ name: 'Rainbow', rdns: 'me.rainbow' }];
        const data = [
            {
                id: '12345',
                name: 'MetaMask',
                rdns: 'io.metamask'
            },
            {
                id: '12346',
                name: 'Phantom',
                rdns: 'app.phantom'
            }
        ];
        OptionsController.setExcludeWalletIds(excludeWalletIds);
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data, count: data.length });
        const fetchWalletsSpy = vi.spyOn(ApiController, 'searchWalletByIds');
        await ApiController.searchWalletByIds({ ids: excludeWalletIds });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: String(excludeWalletIds.length),
                include: excludeWalletIds.join(',')
            }
        });
        expect(fetchWalletsSpy).toHaveBeenCalledOnce();
        expect(ApiController.state.excludedRDNS).toEqual(['io.metamask', 'app.phantom']);
        const result = EIP6963Wallets.filter(wallet => !ApiController.state.excludedRDNS.includes(wallet.rdns));
        expect(result).toEqual(filteredWallet);
    });
    it('should search wallet with search term', async () => {
        const includeWalletIds = ['12341', '12342'];
        const excludeWalletIds = ['12343'];
        const data = [
            {
                id: '12341',
                name: 'MetaMask',
                image_id: '12341'
            }
        ];
        OptionsController.setIncludeWalletIds(includeWalletIds);
        OptionsController.setExcludeWalletIds(excludeWalletIds);
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.searchWallet({ search: 'MetaMask' });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: 'MetaMask',
                include: '12341,12342',
                exclude: '12343'
            }
        });
        expect(fetchImageSpy).toHaveBeenCalledOnce();
        expect(ApiController.state.search).toEqual(data);
    });
    it('should search wallet with search term', async () => {
        const includeWalletIds = ['12341', '12342'];
        const excludeWalletIds = ['12343'];
        let data = [
            {
                id: '12341',
                name: 'MetaMask',
                image_id: '12341'
            }
        ];
        OptionsController.setIncludeWalletIds(includeWalletIds);
        OptionsController.setExcludeWalletIds(excludeWalletIds);
        let fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data });
        const fetchImageSpy = vi.spyOn(ApiController, '_fetchWalletImage').mockResolvedValue();
        await ApiController.searchWallet({ search: 'MetaMask    ' });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: 'MetaMask',
                include: '12341,12342',
                exclude: '12343'
            }
        });
        expect(fetchImageSpy).toHaveBeenCalledOnce();
        expect(ApiController.state.search).toEqual(data);
        await ApiController.searchWallet({ search: ' Metamask' });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: 'MetaMask',
                include: '12341,12342',
                exclude: '12343'
            }
        });
        expect(ApiController.state.search).toEqual(data);
        await ApiController.searchWallet({ search: ' Metamask  ' });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: 'MetaMask',
                include: '12341,12342',
                exclude: '12343'
            }
        });
        expect(ApiController.state.search).toEqual(data);
        data = [
            {
                id: '12341',
                name: 'Safe Wallet',
                image_id: '12341'
            }
        ];
        fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data });
        await ApiController.searchWallet({ search: 'Safe Wallet' });
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getWallets',
            headers: ApiController._getApiHeaders(),
            params: {
                page: '1',
                entries: '100',
                search: 'Safe Wallet',
                include: '12341,12342',
                exclude: '12343'
            }
        });
        expect(ApiController.state.search).toEqual(data);
    });
    it('should prefetch without analytics', () => {
        OptionsController.state.enableAnalytics = false;
        const fetchFeaturedSpy = vi.spyOn(ApiController, 'fetchFeaturedWallets').mockResolvedValue();
        const fetchNetworkImagesSpy = vi.spyOn(ApiController, 'fetchNetworkImages').mockResolvedValue();
        const recommendedWalletsSpy = vi
            .spyOn(ApiController, 'fetchRecommendedWallets')
            .mockResolvedValue();
        const fetchConnectorImagesSpy = vi
            .spyOn(ApiController, 'fetchConnectorImages')
            .mockResolvedValue();
        const fetchAnalyticsSpy = vi.spyOn(ApiController, 'fetchAnalyticsConfig');
        ApiController.prefetch();
        expect(fetchAnalyticsSpy).not.toHaveBeenCalled();
        expect(fetchFeaturedSpy).toHaveBeenCalledOnce();
        expect(fetchNetworkImagesSpy).toHaveBeenCalledOnce();
        expect(recommendedWalletsSpy).toHaveBeenCalledOnce();
        expect(fetchConnectorImagesSpy).toHaveBeenCalledOnce();
    });
    it('should prefetch with analytics', () => {
        OptionsController.state.enableAnalytics = undefined;
        const fetchSpy = vi.spyOn(ApiController, 'fetchFeaturedWallets').mockResolvedValue();
        const fetchNetworkImagesSpy = vi.spyOn(ApiController, 'fetchNetworkImages').mockResolvedValue();
        const recommendedWalletsSpy = vi
            .spyOn(ApiController, 'fetchRecommendedWallets')
            .mockResolvedValue();
        const fetchConnectorImagesSpy = vi
            .spyOn(ApiController, 'fetchConnectorImages')
            .mockResolvedValue();
        const fetchAnalyticsSpy = vi.spyOn(ApiController, 'fetchAnalyticsConfig').mockResolvedValue();
        ApiController.prefetch();
        expect(fetchAnalyticsSpy).toHaveBeenCalledOnce();
        expect(fetchSpy).toHaveBeenCalledOnce();
        expect(fetchNetworkImagesSpy).toHaveBeenCalledOnce();
        expect(recommendedWalletsSpy).toHaveBeenCalledOnce();
        expect(fetchConnectorImagesSpy).toHaveBeenCalledOnce();
    });
    it.skip('should fetch analytics config', async () => {
        const data = { isAnalyticsEnabled: true };
        const fetchSpy = vi.spyOn(api, 'get').mockResolvedValue({ data });
        await ApiController.fetchAnalyticsConfig();
        expect(fetchSpy).toHaveBeenCalledWith({
            path: '/getAnalyticsConfig',
            headers: ApiController._getApiHeaders()
        });
        expect(ApiController.state.isAnalyticsEnabled).toBe(true);
    });
});
//# sourceMappingURL=ApiController.test.js.map