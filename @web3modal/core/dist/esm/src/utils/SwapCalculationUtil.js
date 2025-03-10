import { NumberUtil } from '@web3modal/common';
export const SwapCalculationUtil = {
    getGasPriceInEther(gas, gasPrice) {
        const totalGasCostInWei = gasPrice * gas;
        const totalGasCostInEther = Number(totalGasCostInWei) / 1e18;
        return totalGasCostInEther;
    },
    getGasPriceInUSD(networkPrice, gas, gasPrice) {
        const totalGasCostInEther = SwapCalculationUtil.getGasPriceInEther(gas, gasPrice);
        const networkPriceInUSD = NumberUtil.bigNumber(networkPrice);
        const gasCostInUSD = networkPriceInUSD.multipliedBy(totalGasCostInEther);
        return gasCostInUSD.toNumber();
    },
    getPriceImpact({ sourceTokenAmount, sourceTokenPriceInUSD, toTokenPriceInUSD, toTokenAmount }) {
        const inputValue = NumberUtil.bigNumber(sourceTokenAmount).multipliedBy(sourceTokenPriceInUSD);
        const outputValue = NumberUtil.bigNumber(toTokenAmount).multipliedBy(toTokenPriceInUSD);
        const priceImpact = inputValue.minus(outputValue).dividedBy(inputValue).multipliedBy(100);
        return priceImpact.toNumber();
    },
    getMaxSlippage(slippage, toTokenAmount) {
        const slippageToleranceDecimal = NumberUtil.bigNumber(slippage).dividedBy(100);
        const maxSlippageAmount = NumberUtil.multiply(toTokenAmount, slippageToleranceDecimal);
        return maxSlippageAmount.toNumber();
    },
    getProviderFee(sourceTokenAmount, feePercentage = 0.0085) {
        const providerFee = NumberUtil.bigNumber(sourceTokenAmount).multipliedBy(feePercentage);
        return providerFee.toString();
    },
    isInsufficientNetworkTokenForGas(networkBalanceInUSD, gasPriceInUSD) {
        const gasPrice = gasPriceInUSD || '0';
        if (NumberUtil.bigNumber(networkBalanceInUSD).isZero()) {
            return true;
        }
        return NumberUtil.bigNumber(NumberUtil.bigNumber(gasPrice)).isGreaterThan(networkBalanceInUSD);
    },
    isInsufficientSourceTokenForSwap(sourceTokenAmount, sourceTokenAddress, balance) {
        const sourceTokenBalance = balance?.find(token => token.address === sourceTokenAddress)
            ?.quantity?.numeric;
        const isInSufficientBalance = NumberUtil.bigNumber(sourceTokenBalance || '0').isLessThan(sourceTokenAmount);
        return isInSufficientBalance;
    },
    getToTokenAmount({ sourceToken, toToken, sourceTokenPrice, toTokenPrice, sourceTokenAmount }) {
        if (sourceTokenAmount === '0') {
            return '0';
        }
        if (!sourceToken || !toToken) {
            return '0';
        }
        const sourceTokenDecimals = sourceToken.decimals;
        const sourceTokenPriceInUSD = sourceTokenPrice;
        const toTokenDecimals = toToken.decimals;
        const toTokenPriceInUSD = toTokenPrice;
        if (toTokenPriceInUSD <= 0) {
            return '0';
        }
        const providerFee = NumberUtil.bigNumber(sourceTokenAmount).multipliedBy(0.0085);
        const adjustedSourceTokenAmount = NumberUtil.bigNumber(sourceTokenAmount).minus(providerFee);
        const sourceAmountInSmallestUnit = adjustedSourceTokenAmount.multipliedBy(NumberUtil.bigNumber(10).pow(sourceTokenDecimals));
        const priceRatio = NumberUtil.bigNumber(sourceTokenPriceInUSD).dividedBy(toTokenPriceInUSD);
        const decimalDifference = sourceTokenDecimals - toTokenDecimals;
        const toTokenAmountInSmallestUnit = sourceAmountInSmallestUnit
            .multipliedBy(priceRatio)
            .dividedBy(NumberUtil.bigNumber(10).pow(decimalDifference));
        const toTokenAmount = toTokenAmountInSmallestUnit.dividedBy(NumberUtil.bigNumber(10).pow(toTokenDecimals));
        const amount = toTokenAmount.toFixed(toTokenDecimals).toString();
        return amount;
    }
};
//# sourceMappingURL=SwapCalculationUtil.js.map