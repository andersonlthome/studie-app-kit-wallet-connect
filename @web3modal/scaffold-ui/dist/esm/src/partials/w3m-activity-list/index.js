var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { DateUtil } from '@web3modal/common';
import { AccountController, ChainController, EventsController, OptionsController, RouterController, TransactionsController } from '@web3modal/core';
import { TransactionUtil, customElement } from '@web3modal/ui';
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { W3mFrameRpcConstants } from '@web3modal/wallet';
import { ConstantsUtil } from '@web3modal/common';
import styles from './styles.js';
const PAGINATOR_ID = 'last-transaction';
const LOADING_ITEM_COUNT = 7;
let W3mActivityList = class W3mActivityList extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.paginationObserver = undefined;
        this.page = 'activity';
        this.isSolana = ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA;
        this.address = AccountController.state.address;
        this.transactionsByYear = TransactionsController.state.transactionsByYear;
        this.loading = TransactionsController.state.loading;
        this.empty = TransactionsController.state.empty;
        this.next = TransactionsController.state.next;
        TransactionsController.clearCursor();
        this.unsubscribe.push(...[
            ChainController.subscribeKey('activeChain', activeChain => {
                this.isSolana = activeChain === ConstantsUtil.CHAIN.SOLANA;
            }),
            AccountController.subscribe(val => {
                if (val.isConnected) {
                    if (this.address !== val.address) {
                        this.address = val.address;
                        TransactionsController.resetTransactions();
                        TransactionsController.fetchTransactions(val.address);
                    }
                }
            }),
            TransactionsController.subscribe(val => {
                this.transactionsByYear = val.transactionsByYear;
                this.loading = val.loading;
                this.empty = val.empty;
                this.next = val.next;
            })
        ]);
    }
    firstUpdated() {
        if (this.isSolana) {
            this.loading = false;
            this.empty = true;
            return;
        }
        TransactionsController.fetchTransactions(this.address);
        this.createPaginationObserver();
    }
    updated() {
        this.setPaginationObserver();
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html ` ${this.empty ? null : this.templateTransactionsByYear()}
    ${this.loading ? this.templateLoading() : null}
    ${!this.loading && this.empty ? this.templateEmpty() : null}`;
    }
    templateTransactionsByYear() {
        const sortedYearKeys = Object.keys(this.transactionsByYear).sort().reverse();
        return sortedYearKeys.map((year, index) => {
            const isLastGroup = index === sortedYearKeys.length - 1;
            const yearInt = parseInt(year, 10);
            const sortedMonthIndexes = new Array(12)
                .fill(null)
                .map((_, idx) => idx)
                .reverse();
            return sortedMonthIndexes.map(month => {
                const groupTitle = TransactionUtil.getTransactionGroupTitle(yearInt, month);
                const transactions = this.transactionsByYear[yearInt]?.[month];
                if (!transactions) {
                    return null;
                }
                return html `
          <wui-flex flexDirection="column">
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${['xs', 's', 's', 's']}
            >
              <wui-text variant="paragraph-500" color="fg-200">${groupTitle}</wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="xs">
              ${this.templateTransactions(transactions, isLastGroup)}
            </wui-flex>
          </wui-flex>
        `;
            });
        });
    }
    templateRenderTransaction(transaction, isLastTransaction) {
        const { date, descriptions, direction, isAllNFT, images, status, transfers, type } = this.getTransactionListItemProps(transaction);
        const haveMultipleTransfers = transfers?.length > 1;
        const haveTwoTransfers = transfers?.length === 2;
        if (haveTwoTransfers && !isAllNFT) {
            return html `
        <wui-transaction-list-item
          date=${date}
          .direction=${direction}
          id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .images=${images}
          .descriptions=${descriptions}
        ></wui-transaction-list-item>
      `;
        }
        if (haveMultipleTransfers) {
            return transfers.map((transfer, index) => {
                const description = TransactionUtil.getTransferDescription(transfer);
                const isLastTransfer = isLastTransaction && index === transfers.length - 1;
                return html ` <wui-transaction-list-item
          date=${date}
          direction=${transfer.direction}
          id=${isLastTransfer && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .onlyDirectionIcon=${true}
          .images=${[images[index]]}
          .descriptions=${[description]}
        ></wui-transaction-list-item>`;
            });
        }
        return html `
      <wui-transaction-list-item
        date=${date}
        .direction=${direction}
        id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
        status=${status}
        type=${type}
        .images=${images}
        .descriptions=${descriptions}
      ></wui-transaction-list-item>
    `;
    }
    templateTransactions(transactions, isLastGroup) {
        return transactions.map((transaction, index) => {
            const isLastTransaction = isLastGroup && index === transactions.length - 1;
            return html `${this.templateRenderTransaction(transaction, isLastTransaction)}`;
        });
    }
    emptyStateActivity() {
        const comingSoon = html `
      <wui-text align="center" variant="paragraph-500" color="fg-100"
        >Transaction history is coming soon!</wui-text
      >
    `;
        const empty = html ` <wui-text align="center" variant="paragraph-500" color="fg-100"
        >No Transactions yet</wui-text
      >
      <wui-text align="center" variant="small-500" color="fg-200"
        >Start trading on dApps <br />
        to grow your wallet!</wui-text
      >`;
        return html `<wui-flex
      class="emptyContainer"
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${['3xl', 'xl', '3xl', 'xl']}
      gap="xl"
    >
      <wui-icon-box
        backgroundColor="gray-glass-005"
        background="gray"
        iconColor="fg-200"
        icon="wallet"
        size="lg"
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>
      <wui-flex flexDirection="column" alignItems="center" gap="xs">
        ${this.isSolana ? comingSoon : empty}
      </wui-flex>
    </wui-flex>`;
    }
    emptyStateAccount() {
        const comingSoon = html `
      <wui-text variant="paragraph-500" align="center" color="fg-100"
        >Transaction history is coming soon!</wui-text
      >
    `;
        const empty = html ` <wui-text variant="paragraph-500" align="center" color="fg-100"
        >No activity yet</wui-text
      >
      <wui-text variant="small-400" align="center" color="fg-200"
        >Your next transactions will appear here</wui-text
      >`;
        return html `<wui-flex
      class="contentContainer"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="l"
    >
      <wui-icon-box
        icon="swapHorizontal"
        size="inherit"
        iconColor="fg-200"
        backgroundColor="fg-200"
        iconSize="lg"
      ></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="xs"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        ${this.isSolana ? comingSoon : empty}
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)}>Trade</wui-link>
    </wui-flex>`;
    }
    templateEmpty() {
        if (this.page === 'account') {
            return html `${this.emptyStateAccount()}`;
        }
        return html `${this.emptyStateActivity()}`;
    }
    templateLoading() {
        if (this.page === 'activity') {
            return Array(LOADING_ITEM_COUNT)
                .fill(html ` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
                .map(item => item);
        }
        return null;
    }
    onReceiveClick() {
        RouterController.push('WalletReceive');
    }
    createPaginationObserver() {
        const { projectId } = OptionsController.state;
        this.paginationObserver = new IntersectionObserver(([element]) => {
            if (element?.isIntersecting && !this.loading) {
                TransactionsController.fetchTransactions(this.address);
                EventsController.sendEvent({
                    type: 'track',
                    event: 'LOAD_MORE_TRANSACTIONS',
                    properties: {
                        address: this.address,
                        projectId,
                        cursor: this.next,
                        isSmartAccount: AccountController.state.preferredAccountType ===
                            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                    }
                });
            }
        }, {});
        this.setPaginationObserver();
    }
    setPaginationObserver() {
        this.paginationObserver?.disconnect();
        const lastItem = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`);
        if (lastItem) {
            this.paginationObserver?.observe(lastItem);
        }
    }
    getTransactionListItemProps(transaction) {
        const date = DateUtil.formatDate(transaction?.metadata?.minedAt);
        const descriptions = TransactionUtil.getTransactionDescriptions(transaction);
        const transfers = transaction?.transfers;
        const transfer = transaction?.transfers?.[0];
        const isAllNFT = Boolean(transfer) && transaction?.transfers?.every(item => Boolean(item.nft_info));
        const images = TransactionUtil.getTransactionImages(transfers);
        return {
            date,
            direction: transfer?.direction,
            descriptions,
            isAllNFT,
            images,
            status: transaction.metadata?.status,
            transfers,
            type: transaction.metadata?.operationType
        };
    }
};
W3mActivityList.styles = styles;
__decorate([
    property()
], W3mActivityList.prototype, "page", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "isSolana", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "address", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "transactionsByYear", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "loading", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "empty", void 0);
__decorate([
    state()
], W3mActivityList.prototype, "next", void 0);
W3mActivityList = __decorate([
    customElement('w3m-activity-list')
], W3mActivityList);
export { W3mActivityList };
//# sourceMappingURL=index.js.map