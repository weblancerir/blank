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
import Frame, { FrameContextConsumer } from 'react-frame-component'
import Portal from "../Portal";

export default class EditorBoundary extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            editorScale: 1,
            inspectorPinned: true
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
        this.inspectorRef = React.createRef();
        this.editorData = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            inspectorWidth: 300,
            inspectorPinned: false
        };
        this.breakpointmanager =
            new BreakPointManager(undefined, this.editorData, undefined, this.onZoomLevelChange);
        this.dragdrop = new DragDropManager();
        this.inputManager = new InputManager();
        this.select = new SelectManager(this.inputManager, this.groupSelectRef,
            this.rootLayoutRef, this.miniMenuHolderRef, this.inspectorRef);
        this.snap = new SnapManager(5, this.snapSvgRef);
        this.copyMan = new CopyManager(this.select, this.rootLayoutRef);
        this.idMan = new IdManager('comp');
        this.undoredo = new UndoRedo(100, document, this.idMan);
        this.gridLine = new GridLineManager(this.gridContainerRef);
        this.anchorMan = new AnchorManager();

        initDynamicComponents();
        initDynamicAnimations();

        this.iFrameCommunicator = new IFrameCommunicator("test", window.parent, this.onMessage);

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
                this.openInspector();
            }
            if ( key === 79 && ctrl ) {
                e.preventDefault();
                console.log("ctrl + O");
                this.closeInspector();
            }
        });
    };

    onMessage = (data, res) => {
        EditorController.onMessage(data, res, this);
    };

    postMessage = (data, callback) => {
        this.iFrameCommunicator.post(data, callback);
    };

    onSiteDataUpdated = (siteData) => {
        this.setState({siteData});
    };

    onPageChange = (pageId) => {
        this.setState({pageId});
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
        this.rootLayoutRef.current.onBreakpointChange(width, newBreakpointName, devicePixelRatio);
    };

    onZoomLevelChange = (newDevicePixelRatio) => {
        // TODO
        this.select.onScrollItem();
        this.rootLayoutRef.current.getSize(true, true);
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
        })
    };

    closeInspector = () => {
        this.inspectorRef.current.close();
    };

    onPageResize = (width, pageAgl, force) => {
        let result = this.breakpointmanager.checkBreakPointChange(width);
        this.breakpointmanager.setWindowWidth(width);

        if (result.changed || force) {
            console.log("onBreakpointChange", width, result.currentBreakpointName);
            this.notifyBreakpointChange(width, result.currentBreakpointName,
                this.breakpointmanager.getDevicePixelRatio());
        }

        this.select.onScrollItem();
    };

    render() {
        // TODO if this.state.siteData not loaded, show loading component
        return (
            <div className="EditorBoundaryRoot">
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
                <MenuHolder
                    ref={this.miniMenuHolderRef}
                />
                <div
                    className="EditorBoundaryPageHolder"
                    style={{
                        // TODO add scale support
                        padding: "0 50px"
                    }}
                >
                    <PageBase
                        id="page"
                        aglRef={this.rootLayoutRef}
                        breakpointmanager={this.breakpointmanager}
                        undoredo={this.undoredo}
                        dragdrop={this.dragdrop}
                        select={this.select}
                        snap={this.snap}
                        idMan={this.idMan}
                        gridLine={this.gridLine}
                        gridEditorRef={this.gridEditorRef}
                        anchorMan={this.anchorMan}
                        copyMan={this.copyMan}
                        editorData={this.editorData}
                        onPageResize={this.onPageResize}
                        editor
                        devicePixelRatio={this.state.devicePixelRatio}
                        inspectorPinned={this.state.inspectorPinned}
                    />
                </div>

                <Inspector
                    ref={this.inspectorRef}
                    inspectorPinned={this.state.inspectorPinned}
                />
            </div>
        )
    }
}
