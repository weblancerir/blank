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
        console.log("PageView constructor");
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    render () {
        let {siteData, pageData, setPageData} = this.context;
        let {routerRef} = this.props;
        let pageName = pageData? pageData.props.pageName: "";
        if (this.context.production) {
            return (
                <PageRouter
                    siteData={siteData}
                    pageData={pageData}
                    setPageData={setPageData}
                    pageName={pageName}
                    routerRef={routerRef}
                    isProduction
                >
                    {this.props.children}
                </PageRouter>
            )
        } else {
            console.log("PageView",  this.context.editor ? this.context.editor.idMan.allId : "No Editor")
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

                    <PageRouter
                        siteData={siteData}
                        pageData={pageData}
                        setPageData={setPageData}
                        pageName={pageName}
                        routerRef={routerRef}
                    >
                        {this.props.children}
                    </PageRouter>
                </div>
            )
        }
    }
}
