import ContextType from "../../../Modules/Context/ContextType";
import {CCommunityBase} from "../CCommunityBase";
import FSoldAmountLastDay from "./FSoldAmountLastDay";
import FBackgroundPreviewLink from "./FBackgroundPreviewLink";
import FBadgePageLink from "./FBadgePageLink";
import FPriceHistoryZoomControl from "./FPriceHistoryZoomControl";

export class CMarketListing extends CCommunityBase {

    constructor() {
        super(ContextType.MARKET_LISTING, [
            FSoldAmountLastDay,
            FBackgroundPreviewLink,
            FBadgePageLink,
            FPriceHistoryZoomControl,
        ]);

        const m = window.location.href.match(/\/(\d+)\/(.+)$/);
        this.appid = Number(m[1]);
        this.marketHashName = m[2];
    }
}
