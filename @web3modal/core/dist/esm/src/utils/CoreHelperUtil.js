import { ConstantsUtil as CommonConstants } from '@web3modal/common';
import { ConstantsUtil } from './ConstantsUtil.js';
export const CoreHelperUtil = {
    isMobile() {
        if (typeof window !== 'undefined') {
            return Boolean(window.matchMedia('(pointer:coarse)').matches ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent));
        }
        return false;
    },
    checkCaipNetwork(network, networkName = '') {
        return network?.id.toLocaleLowerCase().includes(networkName.toLowerCase());
    },
    isAndroid() {
        const ua = window.navigator.userAgent.toLowerCase();
        return CoreHelperUtil.isMobile() && ua.includes('android');
    },
    isIos() {
        const ua = window.navigator.userAgent.toLowerCase();
        return CoreHelperUtil.isMobile() && (ua.includes('iphone') || ua.includes('ipad'));
    },
    isClient() {
        return typeof window !== 'undefined';
    },
    isPairingExpired(expiry) {
        return expiry ? expiry - Date.now() <= ConstantsUtil.TEN_SEC_MS : true;
    },
    isAllowedRetry(lastRetry) {
        return Date.now() - lastRetry >= ConstantsUtil.ONE_SEC_MS;
    },
    copyToClopboard(text) {
        navigator.clipboard.writeText(text);
    },
    getPairingExpiry() {
        return Date.now() + ConstantsUtil.FOUR_MINUTES_MS;
    },
    getNetworkId(caipAddress) {
        return caipAddress?.split(':')[1];
    },
    getPlainAddress(caipAddress) {
        return caipAddress?.split(':')[2];
    },
    async wait(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    },
    debounce(func, timeout = 500) {
        let timer = undefined;
        return (...args) => {
            function next() {
                func(...args);
            }
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(next, timeout);
        };
    },
    isHttpUrl(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    },
    formatNativeUrl(appUrl, wcUri) {
        if (CoreHelperUtil.isHttpUrl(appUrl)) {
            return this.formatUniversalUrl(appUrl, wcUri);
        }
        let safeAppUrl = appUrl;
        if (!safeAppUrl.includes('://')) {
            safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '');
            safeAppUrl = `${safeAppUrl}://`;
        }
        if (!safeAppUrl.endsWith('/')) {
            safeAppUrl = `${safeAppUrl}/`;
        }
        const encodedWcUrl = encodeURIComponent(wcUri);
        return {
            redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
            href: safeAppUrl
        };
    },
    formatUniversalUrl(appUrl, wcUri) {
        if (!CoreHelperUtil.isHttpUrl(appUrl)) {
            return this.formatNativeUrl(appUrl, wcUri);
        }
        let safeAppUrl = appUrl;
        if (!safeAppUrl.endsWith('/')) {
            safeAppUrl = `${safeAppUrl}/`;
        }
        const encodedWcUrl = encodeURIComponent(wcUri);
        return {
            redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
            href: safeAppUrl
        };
    },
    openHref(href, target, features) {
        window.open(href, target, features || 'noreferrer noopener');
    },
    returnOpenHref(href, target, features) {
        return window.open(href, target, features || 'noreferrer noopener');
    },
    async preloadImage(src) {
        const imagePromise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
            image.crossOrigin = 'anonymous';
            image.src = src;
        });
        return Promise.race([imagePromise, CoreHelperUtil.wait(2000)]);
    },
    formatBalance(balance, symbol) {
        let formattedBalance = undefined;
        if (balance === '0') {
            formattedBalance = '0.000';
        }
        else if (typeof balance === 'string') {
            const number = Number(balance);
            if (number) {
                formattedBalance = number.toString().match(/^-?\d+(?:\.\d{0,3})?/u)?.[0];
            }
        }
        return formattedBalance ? `${formattedBalance} ${symbol ?? ''}` : `0.000 ${symbol ?? ''}`;
    },
    formatBalance2(balance, symbol) {
        let formattedBalance = undefined;
        if (balance === '0') {
            formattedBalance = '0';
        }
        else if (typeof balance === 'string') {
            const number = Number(balance);
            if (number) {
                formattedBalance = number.toString().match(/^-?\d+(?:\.\d{0,3})?/u)?.[0];
            }
        }
        return {
            value: formattedBalance ?? '0',
            rest: formattedBalance === '0' ? '000' : '',
            symbol
        };
    },
    getApiUrl() {
        return CommonConstants.W3M_API_URL;
    },
    getBlockchainApiUrl() {
        return CommonConstants.BLOCKCHAIN_API_RPC_URL;
    },
    getAnalyticsUrl() {
        return CommonConstants.PULSE_API_URL;
    },
    getUUID() {
        if (crypto?.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },
    parseError(error) {
        if (typeof error === 'string') {
            return error;
        }
        else if (typeof error?.issues?.[0]?.message === 'string') {
            return error.issues[0].message;
        }
        else if (error instanceof Error) {
            return error.message;
        }
        return 'Unknown error';
    },
    sortRequestedNetworks(approvedIds, requestedNetworks = []) {
        const approvedIndexMap = {};
        if (requestedNetworks && approvedIds) {
            approvedIds.forEach((id, index) => {
                approvedIndexMap[id] = index;
            });
            requestedNetworks.sort((a, b) => {
                const indexA = approvedIndexMap[a.id];
                const indexB = approvedIndexMap[b.id];
                if (indexA !== undefined && indexB !== undefined) {
                    return indexA - indexB;
                }
                else if (indexA !== undefined) {
                    return -1;
                }
                else if (indexB !== undefined) {
                    return 1;
                }
                return 0;
            });
        }
        return requestedNetworks;
    },
    calculateBalance(array) {
        let sum = 0;
        for (const item of array) {
            sum += item.value ?? 0;
        }
        return sum;
    },
    formatTokenBalance(number) {
        const roundedNumber = number.toFixed(2);
        const [dollars, pennies] = roundedNumber.split('.');
        return { dollars, pennies };
    },
    isAddress(address) {
        if (!/^(?:0x)?[0-9a-f]{40}$/iu.test(address)) {
            return false;
        }
        else if (/^(?:0x)?[0-9a-f]{40}$/iu.test(address) || /^(?:0x)?[0-9A-F]{40}$/iu.test(address)) {
            return true;
        }
        return false;
    },
    uniqueBy(arr, key) {
        const set = new Set();
        return arr.filter(item => {
            const keyValue = item[key];
            if (set.has(keyValue)) {
                return false;
            }
            set.add(keyValue);
            return true;
        });
    }
};
//# sourceMappingURL=CoreHelperUtil.js.map