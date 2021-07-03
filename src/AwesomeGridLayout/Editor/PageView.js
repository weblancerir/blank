import React from "react";
import './EditorBoundary.css';
import IconButton from "../HelperComponents/IconButton";
import DropDown from "../Menus/CommonComponents/DropDown";
import EditorHeaderZoom from "./Zoom/EditorHeaderZoom";
import {EditorContext} from "./EditorContext";
import EditorHeaderPageSelect from "./PageSelect/EditorHeaderPageSelect";
import EditorHeaderBreakpoints from "./Breakpoints/EditorHeaderBreakpoints";
import {getScrollbarWidth} from "../AwesomeGridLayoutUtils";
import PageBase from "../Components/Pages/PageBase";
import PageRouter from "./PageRouter";

export default class PageView extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    render () {
        if (this.context.production) {
            return (
                <PageRouter>
                    {this.props.children}
                </PageRouter>
            )
        } else {
            return (
                <div
                    className="EditorBoundaryPageHolder"
                    style={{
                        // TODO add scale support
                        padding: "0 50px"
                    }}
                    onScroll={this.props.onScrollBoundary}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div
                        className="EditorBoundaryPageHolderHover"
                        style={{
                            bottom: getScrollbarWidth()
                        }}
                        onClick={() => {
                            this.props.rootLayoutRef.current.onSelect(true);
                        }}
                    />
                    {/*{this.props.children}*/}
                    <PageRouter>
                        {this.props.children}
                    </PageRouter>
                </div>
            )
        }
    }
}
