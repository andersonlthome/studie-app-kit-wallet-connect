const SECURE_SITE = 'https://secure.walletconnect.org';
export const ONRAMP_PROVIDERS = [
    {
        label: 'Coinbase',
        name: 'coinbase',
        feeRange: '1-2%',
        url: ''
    }
];
export const ConstantsUtil = {
    FOUR_MINUTES_MS: 240000,
    TEN_SEC_MS: 10000,
    ONE_SEC_MS: 1000,
    SECURE_SITE,
    SECURE_SITE_DASHBOARD: `${SECURE_SITE}/dashboard`,
    SECURE_SITE_FAVICON: `${SECURE_SITE}/images/favicon.png`,
    RESTRICTED_TIMEZONES: [
        'ASIA/SHANGHAI',
        'ASIA/URUMQI',
        'ASIA/CHONGQING',
        'ASIA/HARBIN',
        'ASIA/KASHGAR',
        'ASIA/MACAU',
        'ASIA/HONG_KONG',
        'ASIA/MACAO',
        'ASIA/BEIJING',
        'ASIA/HARBIN'
    ],
    WC_COINBASE_PAY_SDK_CHAINS: [
        'ethereum',
        'arbitrum',
        'polygon',
        'avalanche-c-chain',
        'optimism',
        'celo',
        'base'
    ],
    WC_COINBASE_PAY_SDK_FALLBACK_CHAIN: 'ethereum',
    WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP: {
        Ethereum: 'ethereum',
        'Arbitrum One': 'arbitrum',
        Polygon: 'polygon',
        Avalanche: 'avalanche-c-chain',
        'OP Mainnet': 'optimism',
        Celo: 'celo',
        Base: 'base'
    },
    WC_COINBASE_ONRAMP_APP_ID: 'bf18c88d-495a-463b-b249-0b9d3656cf5e',
    SWAP_SUGGESTED_TOKENS: [
        'ETH',
        'UNI',
        '1INCH',
        'AAVE',
        'SOL',
        'ADA',
        'AVAX',
        'DOT',
        'LINK',
        'NITRO',
        'GAIA',
        'MILK',
        'TRX',
        'NEAR',
        'GNO',
        'WBTC',
        'DAI',
        'WETH',
        'USDC',
        'USDT',
        'ARB',
        'BAL',
        'BICO',
        'CRV',
        'ENS',
        'MATIC',
        'OP'
    ],
    SWAP_POPULAR_TOKENS: [
        'ETH',
        'UNI',
        '1INCH',
        'AAVE',
        'SOL',
        'ADA',
        'AVAX',
        'DOT',
        'LINK',
        'NITRO',
        'GAIA',
        'MILK',
        'TRX',
        'NEAR',
        'GNO',
        'WBTC',
        'DAI',
        'WETH',
        'USDC',
        'USDT',
        'ARB',
        'BAL',
        'BICO',
        'CRV',
        'ENS',
        'MATIC',
        'OP',
        'METAL',
        'DAI',
        'CHAMP',
        'WOLF',
        'SALE',
        'BAL',
        'BUSD',
        'MUST',
        'BTCpx',
        'ROUTE',
        'HEX',
        'WELT',
        'amDAI',
        'VSQ',
        'VISION',
        'AURUM',
        'pSP',
        'SNX',
        'VC',
        'LINK',
        'CHP',
        'amUSDT',
        'SPHERE',
        'FOX',
        'GIDDY',
        'GFC',
        'OMEN',
        'OX_OLD',
        'DE',
        'WNT'
    ],
    SWAP_SUPPORTED_NETWORKS: [
        'eip155:1',
        'eip155:42161',
        'eip155:10',
        'eip155:324',
        'eip155:8453',
        'eip155:56',
        'eip155:137',
        'eip155:100',
        'eip155:43114',
        'eip155:250',
        'eip155:8217',
        'eip155:1313161554'
    ],
    NATIVE_TOKEN_ADDRESS: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    CONVERT_SLIPPAGE_TOLERANCE: 1
};
//# sourceMappingURL=ConstantsUtil.js.map