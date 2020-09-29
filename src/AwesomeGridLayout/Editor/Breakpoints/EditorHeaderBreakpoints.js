import React from "react";
import './EditorHeaderBreakpoints.css';
import {EditorContext} from "../EditorContext";
import Tabs from "@material-ui/core/Tabs/Tabs";
import Tab from "@material-ui/core/Tab/Tab";
import NumberInputEnterToChange from "../../Menus/CommonComponents/NumberInputEnterToChange";
import EditorHeaderBreakpointsSetting from "./EditorHeaderBreakpointsSetting";
import IconButton from "../../HelperComponents/IconButton";
import {getBreakpointIcon} from "./BreakpointHelper";

export default class EditorHeaderBreakpoints extends React.Component {
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

    onChangeTab = (editorContext) => (e, bpName) => {
        this.setState({tabValue: bpName});
        console.log("bpName", bpName, editorContext.editor.breakpointmanager.current())

        if (editorContext.editor.breakpointmanager.current() === bpName)
            return;

        let bpData = editorContext.editor.breakpointmanager.getBpData(bpName);

        if (!bpData)
            return;

        let width;
        if (bpData.prefer >= bpData.start && bpData.prefer <= bpData.end)
            width = bpData.prefer;
        else
            width = bpData.start;

        editorContext.editor.onPageResize(width);
    };

    getTabValue = (editorContext) => {
        let width = editorContext.editor.rootLayoutRef.current.getSize(false).width;
        return editorContext.editor.breakpointmanager.current(width);
    };

    render () {
        return (
            <EditorContext.Consumer>
                {editorContext => (
                    <div
                        {...this.props}
                    >
                        {
                            editorContext.editor && editorContext.editor.rootLayoutRef.current &&
                            <Tabs
                                className="EditorHeaderBreakpointsTabRoot"
                                value={
                                    this.getTabValue(editorContext)
                                }
                                indicatorColor="primary"
                                textColor="primary"
                                onChange={this.onChangeTab(editorContext)}
                                aria-label="disabled tabs example"
                            >
                                {
                                    editorContext.editor.breakpointmanager.breakpoints.map((bpData, index) => {
                                        return (
                                            <Tab
                                                key={bpData.name}
                                                className="EditorHeaderBreakpointsTab"
                                                label={getBreakpointIcon(bpData)}
                                                value={bpData.name}
                                            />
                                        )
                                    })
                                }

                            </Tabs>
                        }

                        {
                            editorContext.editor && editorContext.editor.rootLayoutRef.current &&
                            <IconButton
                                buttonBaseStyle={{marginLeft: 10}}
                                onClick={(e) => {
                                    this.setState({settingAnchor: e.currentTarget});
                                }}
                            >
                                <img
                                    draggable={false}
                                    width={18}
                                    height={18}
                                    src={'/static/icon/open-menu.svg'}
                                />
                            </IconButton>
                        }

                        <div style={{
                            backgroundColor: "#cfcfcf",
                            height: "auto",
                            width: 1,
                            marginLeft: 10
                        }}>

                        </div>

                        {
                            editorContext.editor && editorContext.editor.rootLayoutRef.current &&
                            <>
                                <span
                                    style={{
                                        marginLeft: 10,
                                        display:"flex",
                                        alignItems: "center",
                                        fontSize: 12
                                    }}
                                >
                                    Width
                                </span>
                                <NumberInputEnterToChange
                                    inputStyle={{
                                        marginLeft: 10
                                    }}
                                    min={editorContext.editor.breakpointmanager.getMinWidth()}
                                    max={9999}
                                    value={editorContext.editor.rootLayoutRef.current.getSize(false).width}
                                    onChange={(width) => {
                                        editorContext.setPageSizeWidth(width);
                                    }}
                                />
                            </>
                        }

                        {
                            this.state.settingAnchor &&
                            <EditorHeaderBreakpointsSetting
                                anchorEl={this.state.settingAnchor}
                                onClose={(e) => {
                                    this.setState({settingAnchor: undefined});
                                }}
                            />
                        }
                    </div>
                )}
            </EditorContext.Consumer>
        )
    }
}
