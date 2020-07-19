import React, {Component} from 'react';
import './App.css';
import {throttleDebounce} from "./AwesomeGridLayout/AwesomeGridLayoutUtils";
import BreakPointManager from "./AwesomeGridLayout/BreakPointManager";
import UndoRedo from "./AwesomeGridLayout/UndoRedo";
import DragDropManager from "./AwesomeGridLayout/DragDropManager";
import AwesomeGridLayout2 from "./AwesomeGridLayout/AwesomeGridLayout2";
import SelectManager from "./AwesomeGridLayout/SelectManager";
import SnapManager from "./AwesomeGridLayout/SnapManager";

class App2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        this.rootLayout = React.createRef();
        this.breakpointmanager = new BreakPointManager();
        this.undoredo = new UndoRedo(20, document);
        this.dragdrop = new DragDropManager();
        this.select = new SelectManager();
        this.snap = new SnapManager(5);
    }

    onWindowResize = throttleDebounce(() => {
        // TODO
    }, 100);

    componentDidMount () {
        window.addEventListener("resize", this.onWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize);
    }

    render() {
        return (
            <div className="App">
                <AwesomeGridLayout2 id="page" ref={this.rootLayout}
                                   breakpointmanager={this.breakpointmanager}
                                   undoredo={this.undoredo}
                                   dragdrop={this.dragdrop}
                                   select={this.select}
                                   snap={this.snap}
                                   griddata={{
                                       draggable: false,
                                       resizable: false,
                                       scrollType: "vertical",
                                   }}
                                    style={{
                                        width: "100%",
                                        height: "100%"
                                    }}
                                    isSelectable={false}
                >
                    <AwesomeGridLayout2
                        id={1}
                        griddata={{
                            w: "30%",
                            h: "100%",
                            absolute: true,
                            fix: false,
                            draggable: false,
                            resizable: false,
                            overflowData: {
                                state: 'scroll',
                                scroll: 'vertical'
                            }
                        }}
                        style={{
                            backgroundColor: "lightblue"
                        }}
                        defaultGridItemStyle={{
                            alignSelf: "center",
                            justifySelf: "start",
                            position: "relative",
                            marginLeft: 0,
                            marginRight: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            gridArea: "1/1/3/3",
                        }}
                    >
                        <AwesomeGridLayout2
                            id={3}
                            griddata={{
                                w: "50%",
                                h: "auto",
                                absolute: true,
                                fix: false,
                                draggable: false,
                                resizable: false,
                                scrollType: "hide",
                            }}
                            style={{
                                backgroundColor: "green"
                            }}
                            defaultGridItemStyle={{
                                alignSelf: "center",
                                justifySelf: "center",
                                position: "relative",
                                marginLeft: 0,
                                marginRight: 0,
                                marginTop: 0,
                                marginBottom: 0,
                                gridArea: "1/1/2/2",
                            }}
                        >
                        </AwesomeGridLayout2>
                    </AwesomeGridLayout2>

                    <AwesomeGridLayout2
                        id={2}
                        griddata={{
                            w: "70%",
                            h: "100%",
                            absolute: true,
                            fix: false,
                            draggable: false,
                            resizable: false,
                            scrollType: "hide",
                        }}
                        style={{
                            backgroundColor: "lightgray"
                        }}
                        defaultGridItemStyle={{
                            alignSelf: "center",
                            justifySelf: "end",
                            position: "relative",
                            marginLeft: 0,
                            marginRight: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            gridArea: "1/1/3/3",
                        }}
                    >
                        <AwesomeGridLayout2
                            id={4}
                            griddata={{
                                w: "50%",
                                h: "80%",
                                absolute: true,
                                fix: false,
                                draggable: false,
                                resizable: false,
                                scrollType: "hide",
                            }}
                            style={{
                                backgroundColor: "blue"
                            }}
                            defaultGridItemStyle={{
                                alignSelf: "center",
                                justifySelf: "center",
                                position: "relative",
                                marginLeft: 0,
                                marginRight: 0,
                                marginTop: 0,
                                marginBottom: 0,
                                gridArea: "1/1/2/2",
                            }}
                        >
                        </AwesomeGridLayout2>
                    </AwesomeGridLayout2>
                </AwesomeGridLayout2>
            </div>
        );
    }
}

export default App2;
