import {Feature} from "../../../Modules/Feature/Feature";
import {HTML, Localization, SyncedStorage} from "../../../../modulesCore";
// import Config from "../../../../config";

export default class FAppStats extends Feature {

    async checkPrerequisites() {
        if (this.context.isDlc() || !document.querySelector(".sys_req")) { return false; }

        this._data = await this.context.data;
        return Boolean(this._data);
    }

    apply() {
        const {charts, steamspy, survey} = this._data;

        let html = "";

        if (SyncedStorage.get("show_steamchart_info") && charts && charts.chart && charts.chart.peakall) {
            html += this._getSteamChartHtml(charts.chart);
        }
        if (SyncedStorage.get("show_steamspy_info") && steamspy && steamspy.owners) {
            html += this._getSteamSpyHtml(steamspy);
        }
        if (survey && !this.context.isVideo()) {
            html += this._getPerformanceSurveyHtml(survey);
        }

        if (html) {
            HTML.beforeBegin(document.querySelector(".sys_req").parentNode, html);
        }
    }

    _getSteamChartHtml(data) {
        return `<div id="steam-charts" class="game_area_description">
            <h2>${Localization.str.charts.current}</h2>
            <div class="chart-content">
                <div class="chart-stat"><span class="num">${HTML.escape(data.current)}</span><br>${Localization.str.charts.playing_now}</div>
                <div class="chart-stat"><span class="num">${HTML.escape(data.peaktoday)}</span><br>${Localization.str.charts.peaktoday}</div>
                <div class="chart-stat"><span class="num">${HTML.escape(data.peakall)}</span><br>${Localization.str.charts.peakall}</div>
            </div>
            <span class="chart-footer">${Localization.str.powered_by.replace("__link__", `<a href="https://steamcharts.com/app/${this.context.appid}" target="_blank">SteamCharts.com</a>`)}</span>
        </div>`;
    }

    _getSteamSpyHtml(data) {

        function getTimeString(value) {
            let _value = value;

            const days = Math.trunc(_value / 1440);
            _value -= days * 1440;

            const hours = Math.trunc(_value / 60);
            _value -= hours * 60;

            const minutes = _value;

            return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
        }

        const owners = data.owners.split("..");
        const ownersFrom = HTML.escape(owners[0].trim());
        const ownersTo = HTML.escape(owners[1].trim());
        const averageTotal = getTimeString(data.average_forever);
        const average2weeks = getTimeString(data.average_2weeks);

        return `<div id="steam-spy" class="game_area_description">
            <h2>${Localization.str.spy.player_data}</h2>
            <div class="chart-content">
                <div class="chart-stat"><span class="num">${ownersFrom}<br>-<br>${ownersTo}</span><br>${Localization.str.spy.owners}</div>
                <div class="chart-stat"><span class="num">${averageTotal}</span><br>${Localization.str.spy.average_playtime}</div>
                <div class="chart-stat"><span class="num">${average2weeks}</span><br>${Localization.str.spy.average_playtime_2weeks}</div>
            </div>
            <span class="chart-footer">${Localization.str.powered_by.replace("__link__", `<a href="https://steamspy.com/app/${this.context.appid}" target="_blank">steamspy.com</a>`)}</span>
        </div>`;
    }

    _getPerformanceSurveyHtml(data) {

        function getBarHtml(name, value) {
            if (value > 90 || value < 10) {

                return `<div class="row">
                    <div class="left-bar ${name.toLowerCase()}" style="width: ${value}%;">
                        <span>${name}&nbsp;${value}%</span>
                    </div>
                    <div class="right-bar" style="width: ${100 - value}%;"></div>
                </div>`;
            }

            return `<div class="row">
                <div class="left-bar ${name.toLowerCase()}" style="width: ${value}%;">
                    <span>${name}</span>
                </div>
                <div class="right-bar" style="width: ${100 - value}%;">
                    <span>${value}%</span>
                </div>
            </div>`;
        }

        let html = `<div id="performance_survey" class="game_area_description"><h2>${Localization.str.survey.performance_survey}</h2>`;

        if (data.success) {
            html += `<p>${Localization.str.survey.users.replace("__users__", data.responses)}</p>`;

            html += `<p><b>${Localization.str.survey.framerate}</b>: ${Math.round(data.frp)}% ${Localization.str.survey.framerate_response}`;
            switch (data.fr) {
                case "30": html += ` <span style="color: #8f0e10;">${Localization.str.survey.framerate_30}</span>`; break;
                case "fi": html += ` <span style="color: #e1c48a;">${Localization.str.survey.framerate_fi}</span>`; break;
                case "va": html += ` <span style="color: #8BC53F;">${Localization.str.survey.framerate_va}</span>`; break;
            }

            html += `<br><b>${Localization.str.survey.resolution}</b>: ${Localization.str.survey.resolution_support}`;
            switch (data.mr) {
                case "less": html += ` <span style="color: #8f0e10;">${Localization.str.survey.resolution_less.replace("__pixels__", "1920x1080")}</span>`; break;
                case "hd": html += ` <span style="color: #8BC53F;">${Localization.str.survey.resolution_up.replace("__pixels__", "1920x1080 (HD)")}</span>`; break;
                case "wqhd": html += ` <span style="color: #8BC53F;">${Localization.str.survey.resolution_up.replace("__pixels__", "2560x1440 (WQHD)")}</span>`; break;
                case "4k": html += ` <span style="color: #8BC53F;">${Localization.str.survey.resolution_up.replace("__pixels__", "3840x2160 (4K)")}</span>`; break;
            }

            html += `<br><b>${Localization.str.survey.graphics_settings}</b>:`;
            if (data.gs) {
                html += ` <span style="color: #8BC53F;">${Localization.str.survey.gs_y}</span></p>`;
            } else {
                html += ` <span style="color: #8f0e10;">${Localization.str.survey.gs_n}</span></p>`;
            }

            if (["nvidia", "amd", "intel", "other"].some(key => key in data)) {
                html += `<p><b>${Localization.str.survey.satisfaction}</b>:</p><div class="performance-graph">`;

                if ("nvidia" in data) { html += getBarHtml("Nvidia", data.nvidia); }
                if ("amd" in data) { html += getBarHtml("AMD", data.amd); }
                if ("intel" in data) { html += getBarHtml("Intel", data.intel); }
                if ("other" in data) { html += getBarHtml("Other", data.other); }

                html += "</div>";
            }
        } else {
            html += `<p>${Localization.str.survey.nobody}</p>`;
        }

        /*
         * FIXME
         * if (this.context.isOwned() && document.getElementById("my_activity")) {
         *     html += `<a class="btnv6_blue_blue_innerfade btn_medium es_btn_systemreqs" href="${Config.PublicHost}/survey/?appid=${this.context.appid}">
         *                 <span>${Localization.str.survey.take}</span>
         *             </a>`;
         * }
         */

        html += "</div>";

        return html;
    }
}
