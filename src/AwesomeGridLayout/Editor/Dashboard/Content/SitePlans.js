import React from "react";
import {EditorContext} from "../../EditorContext";
import './SitePlans.css';
import moment from 'moment';
import FileManagerHelper from "../../../Components/FileManager/FileManagerHelper";
import MultiColorProgressBar from "../../../Components/FileManager/Components/MultiColorProgressBar";
import Button from "@material-ui/core/Button/Button";

export default class SitePlans extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    componentDidMount() {
        this.mounted = true;
        this.loadUserUsage();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getLastWebsitePlan = () => {
        let {siteData, website} = this.context;

        let sortedList = website.website_plans.sort((a, b) => {
            let aStartDate = moment(a.startDate);
            let bStartDate = moment(b.startDate);
            return aStartDate.isAfter(bStartDate);
        });

        return sortedList[0];
    }

    getResourcePlan = () => {
        return this.getLastWebsitePlan().plan.productsDetail[0];
    }

    loadUserUsage = () => {
        FileManagerHelper.usage(this.context, (usageData) => {
            console.log("loadUserUsage", usageData);
            this.setState({usageData})
        }, (errorMessage) => {
            this.setState({errorMessage});
        });
    }

    getUsageColor = () => {
        let {usageData} = this.state;

        let usagePercent = this.getUsagePercent();
        if (usagePercent < 50)
            return "#53ff30";
        if (usagePercent < 80)
            return "#f8ff30";
        if (usagePercent < 90)
            return "#ff8a30";
        // if (usagePercent < 100)
        return "#ff3030";
    }

    getUsagePercent = () => {
        let {usageData} = this.state;
        let resourcePlan = this.getResourcePlan();
        return usageData.usage / resourcePlan.metadata.storage / 1024 / 1024 * 100;
    }

    render() {
        let {siteData, website} = this.context;
        let {usageData} = this.state;
        let isPublished = website.metadata.isPublished;
        let lastWebsitePlan = this.getLastWebsitePlan();
        let resourcePlan = this.getResourcePlan();
        return (
            <div className="SitePlansRoot">
                <div className="SitePlansCurrentRoot">
                    <div className="SitePlansMainRoot">
                        <span className="SitePlansTitle">
                            Website Plan
                        </span>
                        <span className="SitePlansPlanName">
                            {lastWebsitePlan.plan.name} {lastWebsitePlan.planTime === "trial" ? "(Trial)": ""}
                        </span>
                        <div className="SitePlansDataRow">
                            <span className="SitePlansDataRowTitle">
                                Expire Date
                            </span>
                            <span className="SitePlansDataRowData">
                                {moment(lastWebsitePlan.expireDate).format("MM-DD-YYYY")}
                            </span>
                        </div>

                        {
                            (lastWebsitePlan.plan.metadata.features || []).map(feature => {
                                return (
                                    <div className="SitePlansDataRow">
                                        <span className="SitePlansFeatureRowTitle">
                                            {feature.name}
                                        </span>
                                        <span className="SitePlansFeatureRowData">
                                            {feature.value}
                                        </span>
                                    </div>
                                )
                            })
                        }

                        <div className="SitePlansUpgradeRoot">
                            <span className="SitePlansRemaining">
                                {`${moment(lastWebsitePlan.expireDate).diff(moment(), "d")} days remaining`}
                            </span>
                            <Button className="SitePlansUpgradeButton" color="primary" variant="contained">
                                Upgrade Website Plan
                            </Button>
                        </div>
                    </div>
                    <div className="SitePlansMainRoot">
                        <span className="SitePlansTitle">
                            Resource Plan
                        </span>
                        <span className="SitePlansPlanName">
                            {resourcePlan.name}
                        </span>

                        <div className="SitePlansDataRow">
                            <span className="SitePlansFeatureRowTitle">
                                Storage Limit
                            </span>
                            <span className="SitePlansFeatureRowData">
                                {resourcePlan.metadata.storage} Mb
                            </span>
                        </div>

                        {
                            usageData &&
                            <div className="SitePlansResourceUsageRoot">
                                <MultiColorProgressBar
                                    rootStyle={{flex: 1, height: 8}}
                                    barsStyle={{height: 8}}
                                    barStyle={{height: 8}}
                                    readings={[
                                        {
                                            name: 'Used Space',
                                            value: this.getUsagePercent(),
                                            color: this.getUsageColor()
                                        },
                                        {
                                            name: 'Free Space',
                                            value: 100 - this.getUsagePercent(),
                                            color: '#f8f8f8'
                                        }
                                    ]}
                                />
                                <span className="SitePlansResourceUsageText">
                                    {
                                        `${(usageData.usage / 1024 / 1024).toFixed(2)} Mb used`
                                    }
                                </span>
                            </div>
                        }

                        <div className="SitePlansDataRow">
                            <span className="SitePlansFeatureRowTitle">
                                Traffic Limit
                            </span>
                            <span className="SitePlansFeatureRowData">
                                {resourcePlan.metadata.traffic} Mb
                            </span>
                        </div>

                        {
                            usageData &&
                            <div className="SitePlansResourceUsageRoot">
                                <MultiColorProgressBar
                                    rootStyle={{flex: 1, height: 8, borderRadius: 4}}
                                    barsStyle={{height: 8, borderRadius: 4}}
                                    barStyle={{height: 8}}
                                    readings={[
                                        {
                                            name: 'Used Space',
                                            value: this.getUsagePercent(),
                                            color: this.getUsageColor()
                                        },
                                        {
                                            name: 'Free Space',
                                            value: 100 - this.getUsagePercent(),
                                            color: '#f8f8f8'
                                        }
                                    ]}
                                />
                                <span className="SitePlansResourceUsageText">
                                    {
                                        `${(usageData.usage / 1024 / 1024).toFixed(2)} Mb used`
                                    }
                                </span>
                            </div>
                        }

                        <div className="SitePlansUpgradeRoot">
                            {
                                lastWebsitePlan.planTime === "trial" &&
                                <span className="SitePlansUpgradeTip">
                                    Upgrade website plan first
                                </span>
                            }
                            <Button
                                className={!lastWebsitePlan.planTime === "trial"? "SitePlansUpgradeButton" :"SitePlansUpgradeButtonDisabled"}
                                color="primary"
                                variant="contained"
                                disabled={lastWebsitePlan.planTime === "trial"}
                            >
                                Upgrade Resource Plan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
