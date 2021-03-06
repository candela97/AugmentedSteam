import {Feature} from "../../../Modules/Feature/Feature";
import {HTML, Localization, SyncedStorage} from "../../../../modulesCore";

export default class FPackageInfoButton extends Feature {

    checkPrerequisites() {
        return SyncedStorage.get("show_package_info");
    }

    apply() {
        for (const node of document.querySelectorAll(
            ".game_area_purchase_game_wrapper:not(.bundle_hidden_by_preferences):not(.game_purchase_sub_dropdown)"
        )) {
            if (node.querySelector(".btn_packageinfo")) { return; } // TODO is it right to return here or in the if clause below?

            const subid = node.querySelector("input[name=subid]");
            if (!subid) { return; }

            HTML.afterBegin(node.querySelector(".game_purchase_action"),
                `<div class="game_purchase_action_bg">
                    <div class="btn_addtocart btn_packageinfo">
                        <a class="btnv6_blue_blue_innerfade btn_medium" href="//store.steampowered.com/sub/${subid.value}/">
                            <span>${Localization.str.package_info}</span>
                        </a>
                    </div>
                </div>`);
        }
    }
}
