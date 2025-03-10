export declare const ONRAMP_PROVIDERS: {
    label: string;
    name: string;
    feeRange: string;
    url: string;
}[];
export declare const ConstantsUtil: {
    FOUR_MINUTES_MS: number;
    TEN_SEC_MS: number;
    ONE_SEC_MS: number;
    SECURE_SITE: string;
    SECURE_SITE_DASHBOARD: string;
    SECURE_SITE_FAVICON: string;
    RESTRICTED_TIMEZONES: string[];
    WC_COINBASE_PAY_SDK_CHAINS: string[];
    WC_COINBASE_PAY_SDK_FALLBACK_CHAIN: string;
    WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP: {
        Ethereum: string;
        'Arbitrum One': string;
        Polygon: string;
        Avalanche: string;
        'OP Mainnet': string;
        Celo: string;
        Base: string;
    };
    WC_COINBASE_ONRAMP_APP_ID: string;
    SWAP_SUGGESTED_TOKENS: string[];
    SWAP_POPULAR_TOKENS: string[];
    SWAP_SUPPORTED_NETWORKS: string[];
    NATIVE_TOKEN_ADDRESS: string;
    CONVERT_SLIPPAGE_TOLERANCE: number;
};
export type CoinbasePaySDKChainNameValues = keyof typeof ConstantsUtil.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP;
