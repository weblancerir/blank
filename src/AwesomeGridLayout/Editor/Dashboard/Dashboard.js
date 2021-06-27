import React from "react";
import {EditorContext} from "../EditorContext";
import './Dashboard.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import SiteDashboard from "./Content/SiteDashboard";
import FileManager from "../../Components/FileManager/FileManager";
import FileManagerModal from "../../Components/FileManager/FileManagerModal";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import SiteSetting from "./Content/SiteSetting";
import SitePlans from "./Content/SitePlans";

export default class Dashboard extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            selectedMenu: props.defaultMenu || "Dashboard"
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    setSelectedMenu = (selectedMenu, menuOptions) => {
        this.setState({selectedMenu, menuOptions});
    }

    onEditWebsiteClicked = () => {
        this.context.postMessageToHolder(
            {
                type: "Holder",
                func: "setDashboard",
                inputs: [false]
            }
        );
    }

    render() {
        let {siteData} = this.context;
        let {selectedMenu, menuOptions} = this.state;
        return (
            <div className="DashboardRoot">
                <div className="DashboardMenuRoot">
                    <div className="DashboardListContainer">
                        <ButtonBase
                            className={"DashboardListItem" +
                            (selectedMenu === "Dashboard" ? " DashboardListItemSelected" : "")
                            }
                            onClick={() => {this.setSelectedMenu("Dashboard")}}
                        >
                            Dashboard
                        </ButtonBase>
                        <ButtonBase
                            className={"DashboardListItem" +
                            (selectedMenu === "Files" ? " DashboardListItemSelected" : "")
                            }
                            onClick={() => {this.setSelectedMenu("Files")}}
                        >
                            Files
                        </ButtonBase>
                        <ButtonBase
                            className={"DashboardListItem" +
                            (selectedMenu === "Domains" ? " DashboardListItemSelected" : "")
                            }
                            onClick={() => {this.setSelectedMenu("Domains")}}
                        >
                            Domains
                        </ButtonBase>
                        <ButtonBase
                            className={"DashboardListItem" +
                            (selectedMenu === "Plans" ? " DashboardListItemSelected" : "")
                            }
                            onClick={() => {this.setSelectedMenu("Plans")}}
                        >
                            Plans Usage
                        </ButtonBase>
                        <ButtonBase
                            className={"DashboardListItem" +
                            (selectedMenu === "Settings" ? " DashboardListItemSelected" : "")
                            }
                            onClick={() => {this.setSelectedMenu("Settings")}}
                        >
                            Settings
                        </ButtonBase>
                    </div>
                    <ButtonBase
                        className="DashboardEditButton"
                        onClick={this.onEditWebsiteClicked}
                    >
                        <span>Edit Website</span>
                    </ButtonBase>
                </div>
                <div className="DashboardContentRoot">
                    {
                        selectedMenu === "Dashboard" &&
                        <SiteDashboard
                            menuOptions={menuOptions}
                            setSelectedMenu={this.setSelectedMenu}
                        />
                    }
                    {
                        selectedMenu === "Files" &&
                        <div className="DashboardContentFilesRoot">
                            <FileManager
                                menuOptions={menuOptions}
                                options={{
                                    noHeader: true
                                }}
                                rootStyle={{
                                    width:"100%",
                                    height:"100%"
                                }}
                            />
                        </div>
                    }
                    {
                        selectedMenu === "Settings" &&
                        <SiteSetting
                            menuOptions={menuOptions}
                        />
                    }
                    {
                        selectedMenu === "Plans" &&
                        <SitePlans
                            menuOptions={menuOptions}
                        />
                    }
                </div>
            </div>
        )
    }
}
