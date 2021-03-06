import React from "react";
import BaseResults from "../BaseResults";

class Distances extends BaseResults {
    distanceSort = (a, b) => {
        if (a.average < b.average) return 1;
        if (a.average > b.average) return -1;
        if (a.total < b.total) return 1;
        if (a.total > b.total) return -1;

        if (a.subject < b.subject) return -1;
        if (a.subject > b.subject) return 1;

        return 0;
    };

    getDistances = () => {
        let subjects = {};
        for (let id in this.state.allTypes.Class) {
            const obj = this.state.allTypes.Class[id];

            if (this.state.category) {
                if (this.state.category !== obj.category) {
                    continue;
                }
            }

            const pull = this.state.allObjects[obj.pull];
            if (!pull) continue;

            if (this.state.pull) {
                if (obj.pull !== this.state.pull) {
                    continue;
                }
            }

            if (this.state.season) {
                if (pull.season !== this.state.season) {
                    continue;
                }
            }

            for (let h in obj.hooks) {
                const hook = this.state.allObjects[obj.hooks[h]];
                if (!hook) continue;

                let val = hook[this.state.subject];
                if (this.state.subject === "combo") {
                    if (!hook.puller) continue;
                    if (!hook.tractor) continue;
                    val = hook.puller + " " + hook.tractor;
                } else if (this.state.subject === "brand") {
                    const tractor = this.state.allObjects[hook.tractor];
                    if (!tractor) continue;
                    val = tractor.brand;
                }
                if (!val) continue;

                if (!subjects[val]) {
                    subjects[val] = { hooks: 0, sum: 0 };
                }
                subjects[val].hooks++;
                subjects[val].sum = subjects[val].sum + hook.distance;
            }
        }

        let distances = [];
        for (let p in subjects) {
            let subject = this.state.allObjects[p];
            if (!subject) subject = p;
            distances.push({
                id: p,
                subject: this.getSubjectDisplay(subject),
                average: parseInt(subjects[p].sum / subjects[p].hooks),
                total: parseInt(subjects[p].sum),
                hooks: subjects[p].hooks
            });
        }
        distances.sort(this.distanceSort);
        return distances;
    };

    getCellClass = (cell, row) => {
        if (!cell.id.endsWith("average")) return "";
        if (cell.value >= 300) return "greenText";
        if (cell.value >= 200) return "yellowText";
        if (cell.value >= 100) return "orangeText";
        return "redText";
    };

    titleRender() {
        return "Distances";
    }

    contentRender() {
        return (
            <div className="contentContainer">
                {this.genFilters(this.getFiltered(), [
                    "season",
                    "pull",
                    "subject",
                    "category",
                    "excel",
                    "youtube"
                ])}
                <div className="contentRow">
                    {this.genDataTable(this.getDistances(), [
                        { key: "subject", header: this.getSubjectHeader() },
                        { key: "average", header: "Average (ft)" },
                        { key: "total", header: "Total (ft)" },
                        { key: "hooks", header: "Total Hooks" }
                    ])}
                </div>
            </div>
        );
    }
}

export default Distances;
