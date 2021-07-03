import React from "react";
import './EditorBoundary.css';
import IconButton from "../HelperComponents/IconButton";
import EditorHeaderZoom from "./Zoom/EditorHeaderZoom";
import {EditorContext} from "./EditorContext";
import EditorHeaderPageSelect from "./PageSelect/EditorHeaderPageSelect";
import EditorHeaderBreakpoints from "./Breakpoints/EditorHeaderBreakpoints";
import MenuManagerUI from "../MenuManager/MenuManagerUI";

export default class EditorHeader extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            onInspectorClickState: true,
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    setRightMenuOpen = (openMenu, state) => {
        let changedState = {};
        [
            "onAddComponentClick",
            "onThemeManagerClick",
            "onPageManagerClick"
        ].forEach(name => {
            if (this.state[`${name}State`] && `${name}State` !== openMenu) {
                this.props[name](true);
            }

            changedState[`${name}State`] = false;
        });
        this.setState({
            ...changedState,
            [openMenu]: state
        });
    };

    render () {
        return (
            <div className="EditorHeaderRoot" style={{
                width: `${this.context.zoomScale*100}%`,
            }}>
                <div className="EditorHeaderRightShortcuts">
                    <IconButton
                        buttonBaseStyle={{
                            marginLeft: 0,
                            backgroundColor: this.context.rightMenus.addComponent.state && "#d2fffc",
                        }}
                        onClick={(e) => {
                            this.context.toggleRightMenu("addComponent");
                            // let onAddComponentClickState = this.props.onAddComponentClick();
                            // this.setRightMenuOpen("onAddComponentClickState", onAddComponentClickState);
                        }}
                    >
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/add.svg'}
                        />
                    </IconButton>
                    <IconButton
                        buttonBaseStyle={{marginLeft: 0,
                            backgroundColor: this.context.rightMenus.pageManager.state && "#d2fffc",
                        }}
                        onClick={(e) => {
                            this.context.toggleRightMenu("pageManager");
                            // let onPageManagerClickState = this.props.onPageManagerClick();
                            // this.setRightMenuOpen("onPageManagerClickState", onPageManagerClickState);
                        }}
                    >
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/page.svg'}
                        />
                    </IconButton>
                    <IconButton
                        buttonBaseStyle={{marginLeft: 0,
                            backgroundColor: this.context.rightMenus.themeManager.state && "#d2fffc",
                        }}
                        onClick={(e) => {
                            this.context.toggleRightMenu("themeManager");
                            // let onThemeManagerClickState = this.props.onThemeManagerClick();
                            // this.setRightMenuOpen("onThemeManagerClickState", onThemeManagerClickState);
                        }}
                    >
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/water.svg'}
                        />
                    </IconButton>
                    <IconButton
                        buttonBaseStyle={{marginLeft: 0,
                            backgroundColor: this.context.rightMenus.menuManager.state && "#d2fffc",
                        }}
                        onClick={(e) => {
                            this.context.toggleRightMenu("menuManager", true);

                        }}
                    >
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/menu.svg'}
                        />
                    </IconButton>
                </div>
                <div className="EditorHeaderCenterShortcuts">
                    <EditorHeaderPageSelect
                        className="EditorHeaderCenterDiv"
                        style={{
                            width: 200
                        }}
                    />
                    <EditorHeaderBreakpoints
                        className="EditorHeaderCenterDiv EditorHeaderLastCenterDiv EditorHeaderBreakpoints"
                    />
                </div>
                <div className="EditorHeaderLeftShortcuts">
                    <IconButton
                        buttonBaseStyle={{
                            marginLeft: 0,
                            marginRight: 10,
                            backgroundColor: this.state.onInspectorClickState && "#d2fffc",
                        }}
                        onClick={(e) => {
                            let onInspectorClickState = this.props.onInspectorClick(e);
                            this.setState({onInspectorClickState})
                        }}
                    >
                        <img
                            draggable={false}
                            width={18}
                            height={18}
                            src={process.env.PUBLIC_URL + '/static/icon/inspector.svg'}
                        />
                    </IconButton>
                    <EditorHeaderZoom
                        onZoomChange={(zoomScale) => {
                            this.props.onPageZoomChange(zoomScale);
                        }}
                    />
                </div>
            </div>
        )
    }
}
