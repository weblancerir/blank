import React, {Component} from 'react';
import './App.css';
import BreakPointManager from "./AwesomeGridLayout/BreakPointManager";
import UndoRedo from "./AwesomeGridLayout/UndoRedo";
import DragDropManager from "./AwesomeGridLayout/DragDropManager";
import SelectManager from "./AwesomeGridLayout/SelectManager";
import SnapManager from "./AwesomeGridLayout/SnapManager";
import {initDynamicComponents} from "./AwesomeGridLayout/Dynamic/DynamicComponents";
import CopyManager from "./AwesomeGridLayout/CopyManager";
import IdManager from "./AwesomeGridLayout/IdManager";
import AdjustmentSnap from "./AwesomeGridLayout/Adjustment/AdjustmentSnap";
import AdjustmentGridLines from "./AwesomeGridLayout/Adjustment/AdjustmentGridLines";
import GridLineManager from "./AwesomeGridLayout/GridLineManager";
import PageBase from "./AwesomeGridLayout/Components/Pages/PageBase";
import AdjustmentGrid from "./AwesomeGridLayout/Adjustment/AdjustmentGrid";
import AnchorManager from "./AwesomeGridLayout/AnchorManager";
import InputManager from "./AwesomeGridLayout/InputManager";
import AdjustmentGroupRect from "./AwesomeGridLayout/Adjustment/AdjustmentGroupRect";
import MenuHolder from "./AwesomeGridLayout/Menus/MenuHolder";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        // Declare all managers & refs
        this.rootLayoutRef = React.createRef();
        this.snapSvgRef = React.createRef();
        this.gridContainerRef = React.createRef();
        this.gridEditorRef = React.createRef();
        this.groupSelectRef = React.createRef();
        this.miniMenuHolderRef = React.createRef();
        this.breakpointmanager =
            new BreakPointManager(undefined, undefined, !this.props.editor && this.onBreakpointChange);
        this.dragdrop = new DragDropManager();
        this.inputManager = new InputManager();
        this.select = new SelectManager(this.inputManager, this.groupSelectRef,
            this.rootLayoutRef, this.miniMenuHolderRef);
        this.snap = new SnapManager(5, this.snapSvgRef);
        this.copyMan = new CopyManager(this.select, this.rootLayoutRef);
        this.idMan = new IdManager('comp');
        this.undoredo = new UndoRedo(100, document, this.idMan);
        this.gridLine = new GridLineManager(this.gridContainerRef);
        this.anchorMan = new AnchorManager();

        initDynamicComponents();
    }

    componentWillUnmount(){
        this.breakpointmanager.dispose();
    }

    onBreakpointChange = (width, newBreakpointName) => {
        this.rootLayoutRef.current.onBreakpointChange(width, newBreakpointName);
    };

    onPageResize = (width, pageAgl, force) => {
        let result = this.breakpointmanager.checkBreakPointChange(width);
        this.breakpointmanager.setWindowWidth(width);

        if (result.changed || force) {
            this.onBreakpointChange(width, result.currentBreakpointName);
        }

        this.select.onScrollItem();
    };

    render() {
        return (
            <div className="App">
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
                <PageBase id="page"
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
                          onPageResize={this.onPageResize}
                          editor={this.props.editor}
                >
                </PageBase>
            </div>
        );
    }
}

export default App;
