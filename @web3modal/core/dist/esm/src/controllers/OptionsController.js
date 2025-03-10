import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { proxy } from 'valtio/vanilla';
import { ApiController } from './ApiController.js';
const state = proxy({
    projectId: '',
    sdkType: 'w3m',
    sdkVersion: 'html-wagmi-undefined'
});
export const OptionsController = {
    state,
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    setProjectId(projectId) {
        state.projectId = projectId;
    },
    setAllWallets(allWallets) {
        state.allWallets = allWallets;
    },
    setIncludeWalletIds(includeWalletIds) {
        state.includeWalletIds = includeWalletIds;
    },
    setExcludeWalletIds(excludeWalletIds) {
        state.excludeWalletIds = excludeWalletIds;
        if (excludeWalletIds) {
            ApiController.searchWalletByIds({ ids: excludeWalletIds });
        }
    },
    setFeaturedWalletIds(featuredWalletIds) {
        state.featuredWalletIds = featuredWalletIds;
    },
    setTokens(tokens) {
        state.tokens = tokens;
    },
    setTermsConditionsUrl(termsConditionsUrl) {
        state.termsConditionsUrl = termsConditionsUrl;
    },
    setPrivacyPolicyUrl(privacyPolicyUrl) {
        state.privacyPolicyUrl = privacyPolicyUrl;
    },
    setCustomWallets(customWallets) {
        state.customWallets = customWallets;
    },
    setIsSiweEnabled(isSiweEnabled) {
        state.isSiweEnabled = isSiweEnabled;
    },
    setIsUniversalProvider(isUniversalProvider) {
        state.isUniversalProvider = isUniversalProvider;
    },
    setEnableAnalytics(enableAnalytics) {
        state.enableAnalytics = enableAnalytics;
    },
    setSdkVersion(sdkVersion) {
        state.sdkVersion = sdkVersion;
    },
    setMetadata(metadata) {
        state.metadata = metadata;
    },
    setOnrampEnabled(enableOnramp) {
        state.enableOnramp = enableOnramp;
    },
    setDisableAppend(disableAppend) {
        state.disableAppend = disableAppend;
    },
    setEIP6963Enabled(enableEIP6963) {
        state.enableEIP6963 = enableEIP6963;
    },
    setHasMultipleAddresses(hasMultipleAddresses) {
        state.hasMultipleAddresses = hasMultipleAddresses;
    },
    setEnableSwaps(enableSwaps) {
        state.enableSwaps = enableSwaps;
    }
};
//# sourceMappingURL=OptionsController.js.map