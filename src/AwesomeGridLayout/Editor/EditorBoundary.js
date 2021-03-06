import React from "react";
import {EditorContext} from "./EditorContext";
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
import {cloneObject} from "../AwesomeGridLayoutUtils";
import debounce from 'lodash.debounce';
import throttle from "lodash.throttle";
import Layout from "../Test/Layout/Layout";
import AddComponent from "../Test/AddComponent/AddComponent";
import PageManager from "../Test/PageManager/PageManager";
import {v4 as uuidv4} from "uuid";
import ThemeManager from "../Test/Theme/ThemeManager";
import defaultSiteData from "../../data/defaultSiteData.json";
import defaultAllComponentData from "../../data/allComponentData.json";
import EditorHeader from "./EditorHeader";
import PreviewHeader from "./PreviewHeader";
import PageView from "./PageView";
import classNames from "classnames";
import LinkGenerator from "../Components/Text/Menus/components/LinkGenerator";
import MenuManagerUI from "../MenuManager/MenuManagerUI";
import {getHomePage} from "../MenuManager/MenuManager";
import Dashboard from "./Dashboard/Dashboard";
import FileManagerModal from "../Components/FileManager/FileManagerModal";
import qs from 'qs';

export default class EditorBoundary extends React.Component{
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        let querryString = qs.parse(window.location.search, { ignoreQueryPrefix: true });

        this.state = {
            preview: true,
            noScroll: querryString.noScroll
        };

        this.init(props);
    }

    // Declare all managers & refs
    init = (props) => {
        this.rootLayoutRef = React.createRef();
        this.routerRef = React.createRef();
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
        this.dragdrop = new DragDropManager();
        this.inputManager = new InputManager();
        this.select = new SelectManager(this.inputManager, this.groupSelectRef,
            this.rootLayoutRef, this.miniMenuHolderRef, this.inspectorRef, this.resizeRef,
            this.helpLinesRef, this.hoverRef);
        this.snap = new SnapManager(5, this.snapSvgRef);
        this.copyMan = new CopyManager(this.select, this.rootLayoutRef, undefined, this.getContext);
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
            if ( key === 66 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + B");
            }
        });


    };

    getContext = () => {
        return this.context;
    }

    initContext = () => {
        this.context.initContext({
            editor: this,
            menuHolderRef: this.miniMenuHolderRef,
            rightMenus: {
                addComponent: {
                    state: false,
                    toggle: this.toggleAddComponent
                },
                pageManager: {
                    state: false,
                    toggle: this.togglePageManager
                },
                themeManager: {
                    state: false,
                    toggle: this.toggleThemeManager
                },
                menuManager: {
                    state: false,
                    toggle: (force, open) => {
                        if (open){
                            this.context.showModal(
                                <MenuManagerUI
                                    open={true}
                                    onClose={() => {
                                        this.context.toggleRightMenu("menuManager", false);
                                    }}
                                />
                            );
                            return true;
                        }

                        this.hideModal();
                        return false;
                    }
                }
            }
        });

        this.select.setContext(this.context);
    };

    componentDidMount(){
        this.initContext();
        this.loadSiteData();
    }

    componentWillUnmount(){
        this.breakpointmanager.dispose();
    }

    loadSiteData = () => {
        fetch(process.env.PUBLIC_URL + '/static/json/env.json').then((res) => res.json())
        .then((data) => {
            if (data.value === 'editor') {
                this.postMessage({
                    type: "Holder",
                    func: "onEditorMounted",
                    inputs: []
                }, (data) => {
                    this.initFromHolder(data.result);
                });
            } else {
                fetch(process.env.PUBLIC_URL + '/static/json/siteData.json').then((res) => res.json())
                    .then((siteData) => {
                        this.context.setProduction(() => {
                            this.onSiteDataUpdated(siteData);
                        });
                    }).catch(err => {
                    console.log("loadSiteData error", err);
                })
            }
        }).catch(err => {
            console.log("loadSiteData error", err);
        })
    };

    initFromHolder = (data) => {
        this.onSetZoomScale(data.zoomScale);
    };

    onMessage = (data, res) => {
        EditorController.onMessage(data, res, this);
    };

    postMessage = (data, callback) => {
        this.iFrameCommunicator.post(data, callback);
    };

    setPreview = (preview, callback) => {
        callback && callback();
        this.context.setPreview(preview);
    }

    testWebsite = () => {
        let siteData = cloneObject(defaultSiteData);
        let allComponentData = cloneObject(defaultAllComponentData);

        this.onComponentDataUpdated(allComponentData);
        this.onSiteDataUpdated(siteData);
    };

    doStaticChanges = (siteData, website, user) => {
        if (siteData.setting.favIconLink) {
            let favIconLink = document.getElementById("favIconLink");
            if (favIconLink) favIconLink.href = siteData.setting.favIconLink;
        }
    }

    onSiteDataUpdated = (siteData, website, user, isDashboard) => {
        if (!siteData) {
            siteData = cloneObject(defaultSiteData);
        }

        if (website)
            this.context.setWebsite(website);

        user && this.context.setUser(user);

        this.doStaticChanges(siteData, website, user);

        this.context.setSiteData(siteData, () => {
            if (isDashboard) {
                this.setState({isDashboard});
            } else {
                this.redirect(undefined, undefined, this.onHeightChange);
                // let pageData = getHomePage(siteData);
                // this.context.setPageData(pageData.props.pageId, false, this.onHeightChange);
            }
        });

        // TODO Test
        let allComponentData = cloneObject(defaultAllComponentData);
        this.onComponentDataUpdated(allComponentData);
    };

    setBreakpoints = (breakpoints) => {
        if (this.breakpointmanager)
            this.breakpointmanager.dispose();

        this.breakpointmanager = new BreakPointManager(breakpoints, this,
            undefined, this.onZoomLevelChange,
            this.onHeightChange, this.onResize);
    }

    onComponentDataUpdated = (allComponentData) => {
        this.setState({allComponentData});
    };

    onPageChange = (pageId, force, callback) => {
        if (!force && this.context.pageData.props.pageId === pageId) {
            return;
        }

        let todo = () => {
            this.idMan.clear();
            this.snap.clearSnaps();

            if (!this.context.production) {
                this.context.setPageData(undefined ,force, () => {
                    this.context.setPageData(pageId, false, () => {
                        if (this.rootLayoutRef.current) {
                            this.rootLayoutRef.current.onSelect(true, callback);
                        }
                        else
                        {
                            callback && callback();
                        }
                    });
                });
            } else {
                let page = Object.values(this.context.siteData.allPages).find(pageData => {
                    return pageData.props.pageId === pageId;
                });
                if (!page)
                    page = getHomePage(this.context.siteData);

                this.redirect(`/${page.props.pageName.toLowerCase()}`);
            }
        };

        if (this.rootLayoutRef.current) {
            this.rootLayoutRef.current.onSelect(true, todo);
        }
        else
        {
            todo();
        }
    };

    togglePreview = (preview) => {
        this.setState({preview});
    };

    setZoomLevel = (zoomLevel) => {
        this.setState({zoomLevel: zoomLevel || 100});
    };

    onPageZoomChange = (zoomScale) => {
        this.postMessage({
            type: "Holder",
            func: "changePageZoom",
            inputs: [zoomScale]
        }, (data) => {
            this.onSetZoomScale(data.result)
        });
    };

    onSetZoomScale = (zoomScale) => {
        document.documentElement.style.setProperty('--zoom-scale', zoomScale);

        this.context.setZoomScale(zoomScale, this.onZoomLevelChange);
    };

    // Just in editor
    onBreakpointChange = (width, newBreakpointName, devicePixelRatio) => {
        if (this.rootLayoutRef.current)
            width = this.rootLayoutRef.current.getSize(false).width;

        console.log("EditorBoundary onBreakpointChange");
        this.onPageResize(width, this.rootLayoutRef.current);
    };

    notifyBreakpointChange = (width, newBreakpointName, devicePixelRatio) => {
        console.log("notifyBreakpointChange")
        this.rootLayoutRef.current.props.aglComponent.updateTemplates();
        this.rootLayoutRef.current.onBreakpointChange(width, newBreakpointName, devicePixelRatio);
        this.select.onScrollItem();
    };

    onZoomLevelChange = (newDevicePixelRatio) => {
        if (!this.rootLayoutRef.current)
            return;
        !this.isPreview() && this.rootLayoutRef.current.invalidateSize(true, true, true);
        !this.isPreview() && this.select.onScrollItem();
        this.rootLayoutRef.current.onWindowSizeChange();
    };

    isPreview = () => {
        return this.context.preview;
    }

    onHeightChange = (e) => {
        if (!this.rootLayoutRef.current)
            return;
        this.rootLayoutRef.current.invalidateSize(true, true, true);
        !this.isPreview() && this.select.onScrollItem();
        this.rootLayoutRef.current.onWindowSizeChange();
        this.rootLayoutRef.current.updateLayout();

        this.onResize(e);
    };

    toggleInspector = () => {
        return this.inspectorRef.current.toggle();
    };

    pinInspector = () => {
        this.context.setInspectorPinned(!this.context.inspectorPinned, () => {
            this.select.onScrollItem();
            this.rootLayoutRef.current.invalidateSize();
        });

        // this.editorData.innerWidth = window.innerWidth -
        // this.context.inspectorPinned ? this.context.inspectorWidth : 0;

        this.onScrollBoundary();
        this.rootLayoutRef.current.updateLayout();
    };

    onPageResize = (width, pageAgl, force) => {
        console.log("EditorBoundary onPageResize");
        let result = this.breakpointmanager.checkBreakPointChange(width);

        this.onResize(undefined, width);

        this.context.setPageSizeWidth(width);

        if (result.changed || force) {
            this.notifyBreakpointChange(width, result.currentBreakpointName,
                this.breakpointmanager.getDevicePixelRatio());
        }
    };

    onResize = (e, width) => {
        if (!this.rootLayoutRef.current)
            return;

        this.onResizeD(e, width);
        this.onResizeT(e, width);
    };

    handleResize = (e, width) => {
        if (!this.rootLayoutRef.current)
            return;

        let fromOnPageResize = !!width;

        if (!width)
            width = this.rootLayoutRef.current.getSize(false, true).width;

        document.documentElement.style.setProperty('--vw-ratio', width / window.innerWidth);

        if (this.context.production && !fromOnPageResize) {
            console.log("EditorBoundary handleResize");
            this.onPageResize(width);
        }
    }

    onResizeD = debounce((e, width) => {
        this.handleResize(e, width);
    }, 100);

    onResizeT = throttle((e, width) => {
        this.handleResize(e, width);
    }, 100);

    onPageResizeStart = () => {
        if (this.isPreview()) return;
        this.resizeRef.current.activate(false);
        this.helpLinesRef.current.activate(false);
        this.miniMenuHolderRef.current.activate(false);
    };

    onPageResizeStop = () => {
        if (this.isPreview()) return;
        this.resizeRef.current.activate(true);
        this.helpLinesRef.current.activate(true);
        this.miniMenuHolderRef.current.activate(true);
    };

    onScrollBoundary = (e) => {
        !this.isPreview() && this.rootLayoutRef.current.invalidateSize(true, true, true);
        !this.isPreview() &&this.select.onScrollItem();

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

    toggleAddComponent = (force, state) => {
        if (state === true) {
            this.addComponentRef.current.open();
            return true;
        }
        return this.addComponentRef.current.toggle(force);
    };

    togglePageManager = (force, state) => {
        if (state === true) {
            this.pageManagerRef.current.open();
            return true;
        }
        return this.pageManagerRef.current.toggle(force);
    };

    toggleThemeManager = (force, state) => {
        if (state === true) {
            this.themeManagerRef.current.open();
            return true;
        }
        return this.themeManagerRef.current.toggle(force);
    };

    // pageData is a childData that is for PageBase component
    getLivePageData = () => {
        return {
            tagName: "PageBase",
            props: this.rootLayoutRef.current.getClearProps({...this.rootLayoutRef.current.props})
        };
    };

    getLiveSiteData = () => {
        let siteData = this.context.siteData || {allPages: {}};

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

    getSiteData = (callback) => {
        callback && callback(this.context.siteData);
        return this.context.siteData;
    }

    isProduction = () => {
        return this.context.production;
    }

    showLinkGenerator = (linkData, onDone) => {
        this.setState({linkGenerator: {linkData, onDone}});
    }

    showFileManager = (options, onDone) => {
        this.setState({fileManager: {options, onDone}});
    }

    showModal = (modal, callback) => {
        this.setState({modal}, callback);
    }

    hideModal = (callback) => {
        this.setState({modal: undefined}, callback);
    }

    redirect = (redirectPath, redirectProps, callback) => {
        console.log("redirect0222 " , this.routerRef.current);
        if (!this.routerRef.current)
            return;

        this.routerRef.current.redirect(redirectPath, redirectProps, callback);
    };

    render() {
        console.log("EditorBoundry Render");

        let borderClassess = classNames(
            "PageBaseWhiteBackground",
            this.context.production ? "PageBaseWhiteBackgroundHeightProduction" : "PageBaseWhiteBackgroundHeightEditor",
        );
        if (!this.state.isDashboard) {
            // if (this.context.pageData) {
                return (
                    <div className="EditorBoundaryRoot" onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}>
                        {
                            this.context.pageData && !this.isPreview() && !this.isProduction() &&
                            <div className="EditorBoundaryHeader">
                                <EditorHeader
                                    onAddComponentClick={this.toggleAddComponent}
                                    onInspectorClick={this.toggleInspector}
                                    onThemeManagerClick={this.toggleThemeManager}
                                    onPageManagerClick={this.togglePageManager}
                                    onPageZoomChange={this.onPageZoomChange}
                                />
                            </div>
                        }
                        {
                            this.context.pageData && this.isPreview() && !this.isProduction() &&
                            <div className="EditorBoundaryHeader">
                                <PreviewHeader
                                    onAddComponentClick={this.toggleAddComponent}
                                    onInspectorClick={this.toggleInspector}
                                    onThemeManagerClick={this.toggleThemeManager}
                                    onPageManagerClick={this.togglePageManager}
                                    onPageZoomChange={this.onPageZoomChange}
                                />
                            </div>
                        }
                        <div className="EditorBoundaryContent">
                            {
                                this.context.pageData && !this.isPreview() && !this.isProduction() &&
                                <>
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
                                        editor={this}
                                        onPageChange={this.onPageChange}
                                    />
                                </>
                            }

                            {
                                <PageView
                                    onScrollBoundary={this.onScrollBoundary}
                                    rootLayoutRef={this.rootLayoutRef}
                                    routerRef={this.routerRef}
                                >
                                    {
                                        this.context.pageData &&
                                        <div className={borderClassess} style={{
                                            marginTop: this.context.production? 0 : `${8*this.context.zoomScale}vh`
                                        }}
                                        >
                                            <PageBase
                                                key={this.context.pageData.props.pageId}
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
                                                editor={!this.isPreview() && this}
                                                devicePixelRatio={this.state.devicePixelRatio}
                                                {...this.context.pageData.props}
                                                pageSize={this.context.pageSize}
                                                noScroll={this.state.noScroll}
                                            />
                                        </div>
                                    }
                                </PageView>
                            }

                            {
                                this.context.pageData && !this.isPreview() && !this.isProduction() &&
                                <>
                                    {
                                        !this.context.pageData &&
                                        <div>
                                            {/*Loading...*/}
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
                                        this.context.pageData &&
                                        <Layout
                                            ref={this.layoutRef}
                                            idMan={this.idMan}
                                        />
                                    }

                                    {
                                        this.context.siteData &&
                                        this.context.pageData &&
                                        <ThemeManager
                                            ref={this.themeManagerRef}
                                            editor={this}
                                        />
                                    }

                                    {
                                        this.state.linkGenerator &&
                                        <LinkGenerator
                                            open={true}
                                            linkData={this.state.linkGenerator.linkData}
                                            onClose={() => {this.setState({linkGenerator: undefined})}}
                                            onDone={this.state.linkGenerator.onDone}
                                        />
                                    }

                                    {
                                        this.state.fileManager &&
                                        <FileManagerModal
                                            open={true}
                                            options={this.state.fileManager.options}
                                            onClose={() => {this.setState({fileManager: undefined})}}
                                            onDone={this.state.fileManager.onDone}
                                        />
                                    }

                                    {
                                        this.state.modal
                                    }

                                    <AddComponent
                                        ref={this.addComponentRef}
                                        allComponentData={this.state.allComponentData}
                                        pageRef={this.rootLayoutRef}
                                        editor={this}
                                    />

                                    <Inspector
                                        ref={this.inspectorRef}
                                        pinInspector={this.pinInspector}
                                    />
                                    <MenuHolder
                                        ref={this.miniMenuHolderRef}
                                    />
                                </>
                            }
                        </div>
                    </div>
                )
            // }
        }
        else
        {
            return <Dashboard/>;
        }

        return null;
    }
}
