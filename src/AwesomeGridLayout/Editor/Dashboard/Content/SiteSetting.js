import React from "react";
import {EditorContext} from "../../EditorContext";
import './SiteSetting.css';

export default class SiteSetting extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        let {siteData, website} = this.context;
        return (
            <div className="SitSettingRoot">

            </div>
        )
    }
}
