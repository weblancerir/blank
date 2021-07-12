import React from "react";
import Button from "@material-ui/core/Button/Button";
import {EditorContext} from "../EditorContext";
import DropDown from "../../Menus/CommonComponents/DropDown";
import './EditorHeaderPageSelect.css';

export default class EditorHeaderPageSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    getOptions = (editorContext) => {
        let options = Object.values(editorContext.siteData.allPages).map(pageData => {
            return pageData.props.pageName;
        });

        !editorContext.preview && options.push(
            <div
                className="EditorHeaderPageSelectPageManagerButton"
                onClick={() => {
                    editorContext.toggleRightMenu("pageManager", true);
                }}
            >
                Page Manager
            </div>
        );

        return options;
    };

    render () {
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <div
                        {...this.props}
                    >
                        <DropDown
                            options={editorContext.siteData ? this.getOptions(editorContext) : ["..."]}
                            onChange={(v) => {
                                let pageData = Object.values(editorContext.siteData.allPages).find(pd => {
                                    return pd.props.pageName === v;
                                });

                                if (pageData)
                                    editorContext.editor.onPageChange(pageData.props.pageId);
                                // editorContext.setPageData(pageData.props.pageId);
                            }}
                            value={editorContext.pageData ? editorContext.pageData.props.pageName : "..."}
                            spanStyle={{
                                width: 200,
                                fontSize: 14,
                                border: "0px solid #cfcfcf",
                            }}
                        />
                    </div>
                )}
            </EditorContext.Consumer>
        )
    }
}
