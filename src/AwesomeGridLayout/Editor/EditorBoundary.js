import React from "react";
import BreakPointManager from "../BreakPointManager";
import DragDropManager from "../DragDropManager";
import InputManager from "../InputManager";
import SelectManager from "../SelectManager";
import SnapManager from "../SnapManager";
import CopyManager from "../CopyManager";
import IdManager from "../IdManager";
import UndoRedo from "../UndoRedo";
import GridLineManager from "../GridLineManager";
import AnchorManager from "../AnchorManager";
import {initDynamicAnimations, initDynamicComponents} from "../Dynamic/DynamicComponents";
import AdjustmentGrid from "../Adjustment/AdjustmentGrid";
import AdjustmentSnap from "../Adjustment/AdjustmentSnap";
import AdjustmentGridLines from "../Adjustment/AdjustmentGridLines";
import AdjustmentGroupRect from "../Adjustment/AdjustmentGroupRect";
import MenuHolder from "../Menus/MenuHolder";
import PageBase from "../Components/Pages/PageBase";
import './EditorBoundary.css';
import IFrameCommunicator from "../Test/IFrameCommunicator";
import EditorController from "../Test/EditorController";
import Inspector from "../Test/Inspector/Inspector";
import AdjustmentResizeWrapper from "../Adjustment/AdjustmentResizeWrapper";
import AdjustmentHelpLinesWrapper from "../Adjustment/AdjustmentHelpLinesWrapper";
import AdjustmentHover from "../Adjustment/AdjustmentHover";
import {cloneObject, getScrollbarWidth} from "../AwesomeGridLayoutUtils";
import debounce from 'lodash.debounce';
import throttle from "lodash.throttle";
import Layout from "../Test/Layout/Layout";
import AddComponent from "../Test/AddComponent/AddComponent";
import PageManager from "../Test/PageManager/PageManager";
import {v4 as uuidv4} from "uuid";
import ThemeManager from "../Test/Theme/ThemeManager";
import defaultSiteData from "../../data/defaultSiteData.json";
import defaultAllComponentData from "../../data/allComponentData.json";

export default class EditorBoundary extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            editorScale: 1,
            inspectorPinned: true,
            pageData: undefined,
        };

        this.init(props);
    }

    // Declare all managers & refs
    init = (props) => {
        this.rootLayoutRef = React.createRef();
        this.snapSvgRef = React.createRef();
        this.gridContainerRef = React.createRef();
        this.gridEditorRef = React.createRef();
        this.groupSelectRef = React.createRef();
        this.miniMenuHolderRef = React.createRef();
        this.resizeRef = React.createRef();
        this.helpLinesRef = React.createRef();
        this.inspectorRef = React.createRef();
        this.hoverRef = React.createRef();
        this.layoutRef = React.createRef();
        this.addComponentRef = React.createRef();
        this.pageManagerRef = React.createRef();
        this.themeManagerRef = React.createRef();

        this.editorData = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            inspectorWidth: 270,
            inspectorPinned: false
        };
        this.breakpointmanager =
            new BreakPointManager(undefined, this.editorData, undefined, this.onZoomLevelChange,
                this.onHeightChange, this.onResize);
        this.dragdrop = new DragDropManager();
        this.inputManager = new InputManager();
        this.select = new SelectManager(this.inputManager, this.groupSelectRef,
            this.rootLayoutRef, this.miniMenuHolderRef, this.inspectorRef, this.resizeRef,
            this.helpLinesRef, this.hoverRef);
        this.snap = new SnapManager(5, this.snapSvgRef);
        this.copyMan = new CopyManager(this.select, this.rootLayoutRef);
        this.idMan = new IdManager('comp');
        this.undoredo = new UndoRedo(100, document, this.idMan);
        this.gridLine = new GridLineManager(this.gridContainerRef);
        this.anchorMan = new AnchorManager();

        initDynamicComponents();
        initDynamicAnimations();

        this.iFrameCommunicator = new IFrameCommunicator(undefined, "WeblancerIFrameCommunicator",
            window.parent, this.onMessage);

        // TODO test, clean them after test finished
        window.addEventListener("keydown",(e) =>{
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            let ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection

            if ( key === 80 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + P");
                this.pinInspector();
            }
            if ( key === 76 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + L");
                this.toggleThemeManager(true);
            }
            if ( key === 79 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + O");
                this.toggleThemeManager(false);
            }
            if ( key === 69 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + E");
                this.exportSiteData();
            }
        });
    };

    componentDidMount(){
        this.postMessage({event: "Editor Mounted"});
        // this.testWebsite();
    }

    onMessage = (data, res) => {
        EditorController.onMessage(data, res, this);
    };

    postMessage = (data, callback) => {
        this.iFrameCommunicator.post(data, callback);
    };

    testWebsite = () => {
        let siteData = cloneObject(defaultSiteData);
        let allComponentData = cloneObject(defaultAllComponentData);

        this.onComponentDataUpdated(allComponentData);
        this.onSiteDataUpdated(siteData);
    };

    onSiteDataUpdated = (siteData) => {
        this.setState({siteData}, () => {
            let pageData = siteData.allPages[Object.keys(siteData.allPages)[0]];
            this.setState({pageData}, this.onHeightChange);
        });
    };

    onComponentDataUpdated = (allComponentData) => {
        this.setState({allComponentData});
    };

    onPageChange = (pageId, force) => {
        if (!force && this.state.pageData.props.pageId === pageId) {
            return;
        }

        this.rootLayoutRef.current.onSelect(true, () => {
            this.idMan.clear();

            this.setState({pageData: undefined} , () => {
                let pageData = this.state.siteData.allPages[pageId];
                this.setState({pageData});
            });
        });
    };

    togglePreview = (preview) => {
        this.setState({preview});
    };

    setZoomLevel = (zoomLevel) => {
        this.setState({zoomLevel: zoomLevel || 100});
    };

    componentWillUnmount(){
        this.breakpointmanager.dispose();
    }

    // Just in editor
    onBreakpointChange = (width, newBreakpointName, devicePixelRatio) => {
        if (this.rootLayoutRef.current)
            width = this.rootLayoutRef.current.getSize(false).width;

        this.onPageResize(width, this.rootLayoutRef.current);
    };

    notifyBreakpointChange = (width, newBreakpointName, devicePixelRatio) => {
        this.rootLayoutRef.current.props.aglComponent.updateTemplates();
        this.rootLayoutRef.current.onBreakpointChange(width, newBreakpointName, devicePixelRatio);
    };

    onZoomLevelChange = (newDevicePixelRatio) => {
        if (!this.rootLayoutRef.current)
            return;
        this.rootLayoutRef.current.invalidateSize(true, true, true);
        this.select.onScrollItem();
        this.rootLayoutRef.current.onWindowSizeChange();
    };

    onHeightChange = () => {
        if (!this.rootLayoutRef.current)
            return;
        this.rootLayoutRef.current.invalidateSize(true, true, true);
        this.select.onScrollItem();
        this.rootLayoutRef.current.onWindowSizeChange();
        this.rootLayoutRef.current.updateLayout();
    };

    openInspector = () => {
        this.inspectorRef.current.open();
    };

    pinInspector = () => {
        let selected = this.select.getSelected();
        this.rootLayoutRef.current.props.aglRef.current.onSelect(true);
        this.editorData.inspectorPinned = !this.state.inspectorPinned;
        this.editorData.innerWidth = window.innerWidth -
            this.editorData.inspectorPinned ? this.editorData.inspectorWidth : 0;
        this.setState({inspectorPinned: this.editorData.inspectorPinned}, () => {
            this.select.onScrollItem();
            setTimeout(() => {
                if (selected)
                    selected.onSelect(true);
            }, 0);
        });

        this.onScrollBoundary();
        this.rootLayoutRef.current.updateLayout();
    };

    closeInspector = () => {
        this.inspectorRef.current.close();
    };

    onPageResize = (width, pageAgl, force) => {
        let result = this.breakpointmanager.checkBreakPointChange(width);
        this.breakpointmanager.setWindowWidth(width);

        this.onResize(undefined, width);

        if (result.changed || force) {
            this.notifyBreakpointChange(width, result.currentBreakpointName,
                this.breakpointmanager.getDevicePixelRatio());
        }
    };

    onResize = (e, width) => {
        this.onResizeD(e, width);
        this.onResizeT(e, width);
    };

    onResizeD = debounce((e, width) => {
        if (!width)
            width = this.rootLayoutRef.current.getSize(false, true).width;
        document.documentElement.style.setProperty('--vw-ratio', width / window.innerWidth);
    }, 100);

    onResizeT = throttle((e, width) => {
        if (!width)
            width = this.rootLayoutRef.current.getSize(false, true).width;
        document.documentElement.style.setProperty('--vw-ratio', width / window.innerWidth);
    }, 100);

    onPageResizeStart = () => {
        this.resizeRef.current.activate(false);
        this.helpLinesRef.current.activate(false);
        this.miniMenuHolderRef.current.activate(false);
    };

    onPageResizeStop = () => {
        this.resizeRef.current.activate(true);
        this.helpLinesRef.current.activate(true);
        this.miniMenuHolderRef.current.activate(true);
    };

    onScrollBoundary = (e) => {
        this.rootLayoutRef.current.invalidateSize(true, true, true);
        this.select.onScrollItem();
        this.rootLayoutRef.current.onWindowSizeChange();
    };

    updateLayout = () => {
        if (!this.rootLayoutRef.current)
            return;

        let layout = [];

        let getLayoutItem = (item, childData) => {
            if (!item || !item.mounted)
                return;

            return {
                id: childData.props.id,
                childData: childData,
                childrenData: Object.keys(item.getFromTempData("savedChildren")).map(childId => {
                    let childData = item.getFromTempData("savedChildren")[childId];
                    return getLayoutItem(
                        item.allChildRefs[childId].current,
                        childData
                    );
                }).filter(il => {
                    return il;
                })
            };
        };

        let pageChildData = {
            tagName: this.rootLayoutRef.current.props.tagName,
            props: this.rootLayoutRef.current.getClearProps({...this.rootLayoutRef.current.props}),
            zIndex: 0
        };

        layout.push(getLayoutItem(this.rootLayoutRef.current, pageChildData));

        this.layoutRef.current.setLayout(layout);
    };

    openLayout = () => {
        this.layoutRef.current.open();
    };

    closeLayout = () => {
        this.layoutRef.current.close();
    };

    openAddComponent = () => {
        this.addComponentRef.current.open();
    };

    closeAddComponent = () => {
        this.addComponentRef.current.close();
    };

    openPageManager = () => {
        this.pageManagerRef.current.open();
    };

    closePageManager = () => {
        this.pageManagerRef.current.close();
    };

    toggleThemeManager = (open) => {
        if (open)
            this.themeManagerRef.current.open();
        else
            this.themeManagerRef.current.close();
    };

    // pageData is a childData that is for PageBase component
    getLivePageData = () => {
        return {
            tagName: "PageBase",
            props: this.rootLayoutRef.current.getClearProps({...this.rootLayoutRef.current.props})
        };
    };

    getLiveSiteData = () => {
        let siteData = this.state.siteData || {allPages: {}};

        siteData.allPages[uuidv4()] = this.getLivePageData();

        return siteData;
    };

    exportSiteData = () => {
        let siteData = this.getLiveSiteData();

        const fileName = "siteData";
        const json = JSON.stringify(siteData);
        const blob = new Blob([json],{type:'application/json'});
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    render() {
        // TODO if this.state.siteData not loaded, show loading component
        return (
            <div className="EditorBoundaryRoot" onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}>
                <AdjustmentGrid
                    ref={this.gridEditorRef}
                />
                <AdjustmentSnap
                    ref={this.snapSvgRef}
                />
                <AdjustmentGridLines
                    ref={this.gridContainerRef}
                />
                <AdjustmentGroupRect
                    ref={this.groupSelectRef}
                />

                <PageManager
                    ref={this.pageManagerRef}
                    siteData={this.state.siteData}
                    editor={this}
                    onPageChange={this.onPageChange}
                />

                {
                    this.state.pageData &&
                    <div
                        className="EditorBoundaryPageHolder"
                        style={{
                            // TODO add scale support
                            padding: "0 50px"
                        }}
                        onScroll={this.onScrollBoundary}
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
                                this.rootLayoutRef.current.onSelect(true);
                            }}
                        />
                        <div className="PageBaseWhiteBackground">
                            <PageBase
                                key={this.state.pageData.props.pageId}
                                id="page"
                                aglRef={this.rootLayoutRef}
                                viewRef={this.rootLayoutRef}
                                breakpointmanager={this.breakpointmanager}
                                undoredo={this.undoredo}
                                dragdrop={this.dragdrop}
                                select={this.select}
                                snap={this.snap}
                                input={this.inputManager}
                                idMan={this.idMan}
                                gridLine={this.gridLine}
                                gridEditorRef={this.gridEditorRef}
                                anchorMan={this.anchorMan}
                                copyMan={this.copyMan}
                                editorData={this.editorData}
                                onPageResize={this.onPageResize}
                                onPageResizeStart={this.onPageResizeStart}
                                onPageResizeStop={this.onPageResizeStop}
                                editor={this}
                                devicePixelRatio={this.state.devicePixelRatio}
                                inspectorPinned={this.state.inspectorPinned}
                                {...this.state.pageData.props}
                                // griddata={{}}
                            />
                        </div>
                    </div>
                }

                {
                    !this.state.pageData &&
                    <div>
                        Loading...
                    </div>
                }

                <AdjustmentHover
                    ref={this.hoverRef}
                />

                <AdjustmentHelpLinesWrapper
                    ref={this.helpLinesRef}
                />

                <AdjustmentResizeWrapper
                    ref={this.resizeRef}
                />

                {
                    this.state.pageData &&
                    <Layout
                        ref={this.layoutRef}
                        idMan={this.idMan}
                    />
                }

                {
                    this.state.siteData &&
                    this.state.pageData &&
                    <ThemeManager
                        ref={this.themeManagerRef}
                        siteData={this.state.siteData}
                        pageData={this.state.pageData}
                        editor={this}
                    />
                }

                <AddComponent
                    ref={this.addComponentRef}
                    allComponentData={this.state.allComponentData}
                    pageRef={this.rootLayoutRef}
                    editor={this}
                />

                <Inspector
                    ref={this.inspectorRef}
                    inspectorPinned={this.state.inspectorPinned}
                />
                <MenuHolder
                    ref={this.miniMenuHolderRef}
                />
            </div>
        )
    }
}
