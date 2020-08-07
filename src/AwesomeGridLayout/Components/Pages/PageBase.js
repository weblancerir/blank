import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import Header from "../Containers/Header";
import Footer from "../Containers/Footer";
import Section from "../Containers/Section";
import AGLComponent from "../Helpers/AGLComponent";
import DynamicComponents from "../../Dynamic/DynamicComponents";
import {initGriddata, swapArrayElements} from "../../AwesomeGridLayoutUtils";
import InspectorBreadcrumbs from "../../Test/Inspector/InspectorBreadcrumbs";
import InspectorPadding from "../../Test/Inspector/InspectorPadding";
import InspectorBackground from "../../Test/Inspector/InspectorBackground";
import './PageBase.css';
import {isHideInBreakpoint} from "../../AwesomwGridLayoutHelper";
import {getFromData} from "../../BreakPointManager";

const mainColTemplate = "minmax(0px,1fr)";

export default class PageBase extends AGLComponent {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.gridTemplateRows = "auto";
        this.gridTemplateColumns = mainColTemplate;
        this.gridX = 0;
        this.gridY = 1;

        this.allSectionsH = [];
        this.allSectionsV = [null];

        this.root = React.createRef();

        this.initKeyboard();

        this.initDataFromPageData(props);
    }

    initDataFromPageData = (props) => {
        if (!props.griddata.initialized)
            initGriddata(props.griddata, this.props.breakpointmanager);

        if (!props.griddata.allSectionsH)
            props.griddata.allSectionsH = [];
        if (!props.griddata.allSectionsV)
            props.griddata.allSectionsV = [null];

        this.allSectionsH = props.griddata.allSectionsH;
        this.allSectionsV = props.griddata.allSectionsV;
        let grid = this.props.breakpointmanager.getFromData(props.griddata, "grid");
        if (grid) {
            this.gridX = grid.x;
            this.gridY = grid.y;
            this.gridTemplateRows = grid.gridTemplateRows;
            this.gridTemplateColumns = grid.gridTemplateColumns;
        }
    };

    initKeyboard = () => {
        window.addEventListener("keydown", (e) => {
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            let ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection

            if (key === 38 && ctrl) {
                e.preventDefault();
                let selectedItem = this.props.select.getSelected();
                if (this.getHorizontalSection(selectedItem.props.id))
                    this.moveUp(selectedItem.props.id);

                this.props.select.onScrollItem(e, this);
            }

            if (key === 40 && ctrl) {
                e.preventDefault();
                console.log("ctrl + Down");
                let selectedItem = this.props.select.getSelected();
                if (this.getHorizontalSection(selectedItem.props.id))
                    this.moveDown(selectedItem.props.id);

                this.props.select.onScrollItem(e, this);
            }

            if (key === 37 && ctrl) {
                e.preventDefault();
                let selectedItem = this.props.select.getSelected();
                if (this.getVerticalSection(selectedItem.props.id))
                    this.moveLeft(selectedItem.props.id);

                this.props.select.onScrollItem(e, this);
            }

            if (key === 39 && ctrl) {
                e.preventDefault();
                console.log("ctrl + Right");
                let selectedItem = this.props.select.getSelected();
                if (this.getVerticalSection(selectedItem.props.id))
                    this.moveRight(selectedItem.props.id);

                this.props.select.onScrollItem(e, this);
            }
        });
    };

    componentDidMount() {
        // TODO remove tests
        // this.addSectionQueue(0, "Header", DynamicComponents, undefined, false);
        // this.addSectionQueue(1, "Section", DynamicComponents, undefined, false);
        // this.addSectionQueue(2, "Footer", DynamicComponents, undefined, false);
    }

    getDefaultData = () => {
        return {
            isContainer: true,
            draggable: false,
            resizable: true,
            pageResize: true,
            bpData: {
                overflowData: {
                    state: "scroll",
                    overflowY: "scroll",
                    auto: true
                },
                grid: {
                    x: this.gridX,
                    y: this.gridY,
                    gridTemplateRows: this.gridTemplateRows,
                    gridTemplateColumns: this.gridTemplateColumns
                },
                containerHeight: "max-content",
            }
        };
    };

    getHorizontalSection = (id) => {
        return this.props.idMan.getItem(this.allSectionsH.find(h => {
            return h === id;
        }));
    };

    deleteHorizontalSection = (id) => {
        let index = this.allSectionsH.findIndex(h => {
            return h === id;
        });
        if (index < 0)
            return false;

        if (this.allSectionsH.length === 1)
            return false;

        this.gridX--;

        let currentSection = this.allSectionsH[index];
        currentSection = this.props.idMan.getItem(currentSection);
        let gridArea = currentSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);

        let firstRow = x1;
        let lastRow = x2;

        this.allSectionsV.forEach(verticalSection => {
            if (verticalSection === null)
                return;

            verticalSection = this.props.idMan.getItem(verticalSection);

            let gridArea = verticalSection.getGridArea();
            let areas = gridArea.split('/');
            let x12 = parseInt(areas[0]);
            let y12 = parseInt(areas[1]);
            let x22 = parseInt(areas[2]);
            let y22 = parseInt(areas[3]);

            if (firstRow >= x12 && lastRow <= x22) {
                x22--;
            } else if (lastRow <= x12) {
                x22--;
                x12--;
            }

            gridArea = `${x12}/${y12}/${x22}/${y22}`;
            verticalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });
        this.allSectionsH.forEach(horizontalSection => {
            horizontalSection = this.props.idMan.getItem(horizontalSection);
            let gridArea = horizontalSection.getGridArea();
            let areas = gridArea.split('/');
            let x13 = parseInt(areas[0]);
            let y13 = parseInt(areas[1]);
            let x23 = parseInt(areas[2]);
            let y23 = parseInt(areas[3]);

            if (lastRow <= x13) {
                x13--;
                x23--;
            }

            gridArea = `${x13}/${y13}/${x23}/${y23}`;
            horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });

        index >= 0 && this.allSectionsH.splice(index, 1);

        this.gridTemplateRows = new Array(this.allSectionsH.length).fill(0).map(a => {
            return "auto";
        }).join(' ');

        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
        return true;
    };

    getVerticalSection = (id) => {
        return this.props.idMan.getItem(this.allSectionsV.find(h => {
            if (h === null)
                return false;

            return h === id;
        })) || null;
    };

    deleteVerticalSection = (id) => {
        let index = this.allSectionsV.findIndex(h => {
            if (h === null)
                return false;
            return h === id;
        });
        if (index < 0)
            return false;

        this.gridY--;

        let currentSection = this.allSectionsV[index];
        currentSection = this.props.idMan.getItem(currentSection);
        let gridArea = currentSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);

        let firstRow = x1;
        let lastRow = x2;
        let firstCol = y1;
        let lastCol = y2;

        this.allSectionsV.forEach(verticalSection => {
            if (verticalSection === null)
                return;

            verticalSection = this.props.idMan.getItem(verticalSection);

            let gridArea = verticalSection.getGridArea();
            let areas = gridArea.split('/');
            let x12 = parseInt(areas[0]);
            let y12 = parseInt(areas[1]);
            let x22 = parseInt(areas[2]);
            let y22 = parseInt(areas[3]);

            if (y12 >= firstCol) {
                y12--;
                y22--;
            }

            gridArea = `${x12}/${y12}/${x22}/${y22}`;
            verticalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });
        this.allSectionsH.forEach(horizontalSection => {
            horizontalSection = this.props.idMan.getItem(horizontalSection);
            let gridArea = horizontalSection.getGridArea();
            let areas = gridArea.split('/');
            let x13 = parseInt(areas[0]);
            let y13 = parseInt(areas[1]);
            let x23 = parseInt(areas[2]);
            let y23 = parseInt(areas[3]);

            if (y13 >= lastCol) {
                // fully right
                y13--;
                y23--;
            } else if (y23 >= lastRow) {
                // partially right
                y23--;
            }

            gridArea = `${x13}/${y13}/${x23}/${y23}`;
            horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });

        this.allSectionsV.splice(index, 1);

        let mainColIndex = this.getMainColIndex();
        this.gridTemplateColumns = new Array(this.allSectionsV.length).fill(0).map((a, i) => {
            if (i === mainColIndex)
                return mainColTemplate;
            return "auto";
        }).join(' ');

        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
        return true;
    };

    addSectionQueue = (index, tagName, dynamicComponents, as, isVertical, callback) => {
        if (!this.addQueue)
            this.addQueue = [];

        this.addQueue.push({
            index, tagName, dynamicComponents, as, isVertical, callback
        });

        if (!this.checkingAddQueue) {
            let nextOne = this.addQueue.shift();
            this.checkAddQueue(nextOne);
        }
    };

    checkAddQueue = (nextOne) => {
        this.checkingAddQueue = true;
        if (!nextOne.isVertical) {
            this.addHorizontalSection(nextOne.index, nextOne.tagName, nextOne.dynamicComponents,
                nextOne.as, (agl) => {
                    if (nextOne.callback)
                        nextOne.callback(agl);
                    let newNextOne = this.addQueue.shift();
                    if (newNextOne)
                        this.checkAddQueue(newNextOne);
                    else
                        this.checkingAddQueue = false;
                });
        } else {
            this.addVerticalSection(nextOne.index, nextOne.tagName, nextOne.dynamicComponents,
                nextOne.as, (agl) => {
                    if (nextOne.callback)
                        nextOne.callback(agl);
                    let newNextOne = this.addQueue.shift();
                    if (newNextOne)
                        this.checkAddQueue(newNextOne);
                    else
                        this.checkingAddQueue = false;
                });
        }
    };

    onItemPreDelete = (item) => {
        let allow = this.deleteHorizontalSection(item.props.id);
        if (!allow)
            allow = this.deleteVerticalSection(item.props.id);

        return allow;
    };

    // Just for vertical items
    onItemPreResizeStop = (item, e, dir, delta, runtimeStyle) => {
        console.log("small from top0", this.allSectionsH, this.allSectionsV)
        if (dir === 'e' || dir === 'w')
            return;

        let gridArea = item.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);

        this.root.current.prepareRects(false, true);
        let yLineRefs = this.props.gridLine.getYlineRef(this.root.current.props.id);
        let firstLineTop =
            this.root.current.getGridLineRect(yLineRefs[0], 0, 'y', this.root.current).top;

        console.log("small from top1", this.allSectionsH, this.allSectionsV)
        if (dir === 'n') {
            if (delta.y > 0) { // small from top
                let targetTop = runtimeStyle.top - firstLineTop;
                let selectedX1 = 1;
                for (let i = yLineRefs.length - 1; i >= 0; i--) {
                    let lineTop =
                        this.root.current.getGridLineRect(yLineRefs[i], i, 'y', this.root.current).top - firstLineTop;
                    if (i === yLineRefs.length - 1) // last line
                        lineTop++;

                    if (targetTop >= lineTop) {
                        selectedX1 = i + 1;
                        break;
                    }
                }

                console.log("small from top", this.allSectionsH, this.allSectionsV)

                this.allSectionsH.forEach(horizontalSection => {
                    horizontalSection = this.props.idMan.getItem(horizontalSection);
                    let gridArea = horizontalSection.getGridArea();
                    let areas = gridArea.split('/');
                    let x12 = parseInt(areas[0]);
                    let y12 = parseInt(areas[1]);
                    let x22 = parseInt(areas[2]);
                    let y22 = parseInt(areas[3]);

                    if (x12 >= x1 && x12 < selectedX1) {
                        if (y12 === y2) { // shift left
                            y12--;
                            let checkIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            }) - 1;
                            while (checkIndex >= 0) {
                                let nextSectionV = this.allSectionsV[checkIndex];
                                nextSectionV = this.props.idMan.getItem(nextSectionV);
                                if (nextSectionV) {
                                    let gridArea = nextSectionV.getGridArea();
                                    let areas = gridArea.split('/');
                                    let x13 = parseInt(areas[0]);
                                    let y13 = parseInt(areas[1]);
                                    let x23 = parseInt(areas[2]);
                                    let y23 = parseInt(areas[3]);

                                    if (x22 <= x13) {
                                        y12--;
                                        checkIndex--;
                                    } else {
                                        checkIndex = -1;
                                    }
                                }
                            }
                        } else if (y22 === y1) { // shift right
                            y22++;
                            let checkIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            }) + 1;
                            while (checkIndex < this.allSectionsV.length) {
                                let nextSectionV = this.allSectionsV[checkIndex];
                                nextSectionV = this.props.idMan.getItem(nextSectionV);
                                if (nextSectionV) {
                                    let gridArea = nextSectionV.getGridArea();
                                    let areas = gridArea.split('/');
                                    let x13 = parseInt(areas[0]);
                                    let y13 = parseInt(areas[1]);
                                    let x23 = parseInt(areas[2]);
                                    let y23 = parseInt(areas[3]);

                                    if (x22 <= x13) {
                                        y22++;
                                        checkIndex++;
                                    } else {
                                        checkIndex = this.allSectionsV.length;
                                    }
                                } else {
                                    checkIndex = this.allSectionsV.length;
                                }
                            }
                        }
                    }

                    gridArea = `${x12}/${y12}/${x22}/${y22}`;
                    horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
                });

                x1 = Math.min(selectedX1, x2 - 1);
            }
            else { // big from top
                let targetTop = runtimeStyle.top - firstLineTop;
                let selectedX1 = 1;
                for (let i = yLineRefs.length - 1; i >= 0; i--) {
                    let lineTop =
                        this.root.current.getGridLineRect(yLineRefs[i], i, 'y', this.root.current).top - firstLineTop;
                    if (i === yLineRefs.length - 1) // last line
                        lineTop++;

                    if (targetTop >= lineTop) {
                        selectedX1 = i + 1;
                        break;
                    }
                }

                this.allSectionsH.forEach(horizontalSection => {
                    horizontalSection = this.props.idMan.getItem(horizontalSection);
                    let gridArea = horizontalSection.getGridArea();
                    let areas = gridArea.split('/');
                    let x12 = parseInt(areas[0]);
                    let y12 = parseInt(areas[1]);
                    let x22 = parseInt(areas[2]);
                    let y22 = parseInt(areas[3]);

                    if (x22 <= x1 && x12 >= selectedX1) {
                        if (y12 <= y1 && y22 >= y2) { // walk through
                            let mainColIndex = this.getMainColIndex();
                            let currentIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            });
                            if (mainColIndex > currentIndex) { // move right
                                y12 = y2;
                            } else { // move left
                                y22 = y1;
                            }
                        }
                    }

                    gridArea = `${x12}/${y12}/${x22}/${y22}`;
                    horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
                });

                x1 = Math.min(selectedX1, x2 - 1);
            }
        }
        else { // dir === 's'
            if (delta.y > 0) { // big from bottom
                let targetBottom = runtimeStyle.height + (runtimeStyle.top - firstLineTop);
                let selectedX2 = yLineRefs.length;
                for (let i = 1; i < yLineRefs.length; i++) {
                    let lineBottom =
                        this.root.current.getGridLineRect(yLineRefs[i], i, 'y', this.root.current).top - firstLineTop;
                    if (i === yLineRefs.length - 1) // last line
                        lineBottom++;

                    if (targetBottom <= lineBottom) {
                        selectedX2 = i + 1;
                        break;
                    }
                }

                this.allSectionsH.forEach(horizontalSection => {
                    horizontalSection = this.props.idMan.getItem(horizontalSection);
                    let gridArea = horizontalSection.getGridArea();
                    let areas = gridArea.split('/');
                    let x12 = parseInt(areas[0]);
                    let y12 = parseInt(areas[1]);
                    let x22 = parseInt(areas[2]);
                    let y22 = parseInt(areas[3]);

                    if (x12 >= x2 && x12 < selectedX2) {
                        if (y12 <= y1 && y22 >= y2) { // walk through
                            let mainColIndex = this.getMainColIndex();
                            let currentIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            });
                            if (mainColIndex > currentIndex) { // move right
                                y12 = y2;
                            } else { // move left
                                y22 = y1;
                            }
                        }
                    }

                    gridArea = `${x12}/${y12}/${x22}/${y22}`;
                    horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
                });

                x2 = Math.max(selectedX2, x1 + 1);
            }
            else { // small from bottom
                let targetBottom = runtimeStyle.height + (runtimeStyle.top - firstLineTop);
                let selectedX2 = yLineRefs.length;
                for (let i = 1; i < yLineRefs.length; i++) {
                    let lineBottom =
                        this.root.current.getGridLineRect(yLineRefs[i], i, 'y', this.root.current).top - firstLineTop;
                    if (i === yLineRefs.length - 1) // last line
                        lineBottom++;

                    if (targetBottom <= lineBottom) {
                        selectedX2 = i + 1;
                        break;
                    }
                }

                this.allSectionsH.forEach(horizontalSection => {
                    horizontalSection = this.props.idMan.getItem(horizontalSection);
                    let gridArea = horizontalSection.getGridArea();
                    let areas = gridArea.split('/');
                    let x12 = parseInt(areas[0]);
                    let y12 = parseInt(areas[1]);
                    let x22 = parseInt(areas[2]);
                    let y22 = parseInt(areas[3]);

                    if (x12 < x2 && x12 >= selectedX2) {
                        if (y12 === y2) { // shift left
                            y12--;
                            let checkIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            }) - 1;
                            while (checkIndex >= 0) {
                                let nextSectionV = this.allSectionsV[checkIndex];
                                nextSectionV = this.props.idMan.getItem(nextSectionV);
                                if (nextSectionV) {
                                    let gridArea = nextSectionV.getGridArea();
                                    let areas = gridArea.split('/');
                                    let x13 = parseInt(areas[0]);
                                    let y13 = parseInt(areas[1]);
                                    let x23 = parseInt(areas[2]);
                                    let y23 = parseInt(areas[3]);

                                    if (x12 >= x23) {
                                        y12--;
                                        checkIndex--;
                                    } else {
                                        checkIndex = -1;
                                    }
                                } else {
                                    checkIndex = -1;
                                }
                            }
                        } else if (y22 === y1) { // shift right
                            y22++;
                            let checkIndex = this.allSectionsV.findIndex(h => {
                                if (h === null)
                                    return false;
                                return h === item.props.id;
                            }) + 1;
                            while (checkIndex < this.allSectionsV.length) {
                                let nextSectionV = this.allSectionsV[checkIndex];
                                nextSectionV = this.props.idMan.getItem(nextSectionV);
                                if (nextSectionV) {
                                    let gridArea = nextSectionV.getGridArea();
                                    let areas = gridArea.split('/');
                                    let x13 = parseInt(areas[0]);
                                    let y13 = parseInt(areas[1]);
                                    let x23 = parseInt(areas[2]);
                                    let y23 = parseInt(areas[3]);

                                    if (x12 >= x23) {
                                        y22++;
                                        checkIndex++;
                                    } else {
                                        checkIndex = this.allSectionsV.length;
                                    }
                                } else {
                                    checkIndex = this.allSectionsV.length;
                                }
                            }
                        }
                    }

                    gridArea = `${x12}/${y12}/${x22}/${y22}`;
                    horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
                });

                x2 = Math.max(selectedX2, x1 + 1);
            }
        }

        item.setGridArea(
            `${x1}/${y1}/${x2}/${y2}`
            , this.props.breakpointmanager.getHighestBpName());
    };

    addHorizontalSection = (index, tagName, dynamicComponents, as, callback) => {
        this.gridX++;
        this.gridTemplateRows = new Array(this.allSectionsH.length + 1).fill(0).map(a => {
            return "auto";
        }).join(' ');

        let currentSectionIndex = index !== 0 ? index - 1 : 0;

        let currentSection = this.allSectionsH[currentSectionIndex];
        currentSection = this.props.idMan.getItem(currentSection);

        let currentSectionGridArea = currentSection && currentSection.getGridArea();
        let gridArea = currentSectionGridArea ? `${index + 1}/${
                currentSectionGridArea.split('/')[1]
                }/${index + 2}/${
                currentSectionGridArea.split('/')[3]
                }` :
            "1/1/2/2"
        ;

        if (!tagName)
            tagName = "Section";

        let Tag = dynamicComponents[tagName];

        let section = <Tag
            as={as}
            portalNodeId={tagName === "Section" ? "page-main-sections" : undefined}
            isSection
            data={{
                bpData: {
                    gridItemStyle: {
                        gridArea: gridArea,
                        marginTop: "0px",
                        marginLeft: "0px",
                        marginBottom: "0px",
                        marginRight: "0px",
                    }
                },
                isSection: true,
            }}
            resizeSides={['s', 'n']}
            onItemPreDelete={this.onItemPreDelete}
        />;

        this.allSectionsV.forEach(verticalSection => {
            if (verticalSection === null)
                return;

            verticalSection = this.props.idMan.getItem(verticalSection);

            let gridArea = verticalSection.getGridArea();
            let areas = gridArea.split('/');
            let x1 = parseInt(areas[0]);
            let y1 = parseInt(areas[1]);
            let x2 = parseInt(areas[2]);
            let y2 = parseInt(areas[3]);

            let firstRow = index + 1;

            if (x2 >= firstRow)
                x2++;
            if (x1 >= firstRow)
                x1++;

            gridArea = `${x1}/${y1}/${x2}/${y2}`;
            verticalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });
        this.allSectionsH.forEach(horizontalSection => {
            horizontalSection = this.props.idMan.getItem(horizontalSection);
            let gridArea = horizontalSection.getGridArea();
            let areas = gridArea.split('/');
            let x1 = parseInt(areas[0]);
            let y1 = parseInt(areas[1]);
            let x2 = parseInt(areas[2]);
            let y2 = parseInt(areas[3]);

            let firstCol = index + 1;

            if (x1 >= firstCol)
                x1++;
            if (x2 > firstCol)
                x2++;

            gridArea = `${x1}/${y1}/${x2}/${y2}`;
            horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });

        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());
        this.root.current.addChild(section, undefined, undefined, undefined, (agl) => {
            this.allSectionsH.splice(index, 0, agl.props.id);
            if (callback)
                callback(agl);
        }, undefined, true);
    };

    getMainColIndex = (insertIndex) => {
        let index = this.allSectionsV.findIndex(v => {
            return v === null;
        });

        if (insertIndex !== undefined && index >= insertIndex)
            return index + 1;

        return index;
    };

    addVerticalSection = (index, tagName, dynamicComponents, as, callback) => {
        this.gridY++;

        let currentSectionIndex = index !== 0 ? index - 1 : 0;

        let currentSection = this.allSectionsV[currentSectionIndex] || null;
        if (currentSection === null)
            currentSection = this.allSectionsV[currentSectionIndex + 1];

        currentSection = this.props.idMan.getItem(currentSection);

        let currentSectionGridArea = currentSection && currentSection.getGridArea();
        let gridArea = currentSectionGridArea ? `${
                currentSectionGridArea.split('/')[0]
                }/${index + 1}/${
                currentSectionGridArea.split('/')[2]
                }/${index + 2}` :
            `${1}/${index + 1}/${this.gridX + 1}/${index + 2}`
        ;

        if (!tagName)
            tagName = "Section";

        let Tag = dynamicComponents[tagName];

        let section = <Tag
            as={as}
            portalNodeId={tagName === "Section" ? "page-main-sections" : undefined}
            isSection
            isVerticalSection
            data={{
                bpData: {
                    gridItemStyle: {
                        gridArea: gridArea,
                        marginTop: "0px",
                        marginLeft: "0px",
                        marginBottom: "0px",
                        marginRight: "0px",
                    }
                },
                isSection: true,
                isVerticalSection: true,
            }}
            style={{
                width: "200px",
                height: "auto",
                minHeight: "auto",
            }}
            resizeSides={['e', 'w', 'n', 's']}
            onItemPreDelete={this.onItemPreDelete}
            onItemPreResizeStop={this.onItemPreResizeStop}
        />;

        this.allSectionsH.forEach(horizontalSection => {
            horizontalSection = this.props.idMan.getItem(horizontalSection);
            let gridArea = horizontalSection.getGridArea();
            let areas = gridArea.split('/');
            let x1 = parseInt(areas[0]);
            let y1 = parseInt(areas[1]);
            let x2 = parseInt(areas[2]);
            let y2 = parseInt(areas[3]);

            let firstCol = index + 1;

            if (y1 >= firstCol)
                y1++;
            if (y2 > firstCol)
                y2++;

            gridArea = `${x1}/${y1}/${x2}/${y2}`;
            horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });
        this.allSectionsV.forEach(verticalSection => {
            if (verticalSection === null)
                return;
            verticalSection = this.props.idMan.getItem(verticalSection);

            let gridArea = verticalSection.getGridArea();
            let areas = gridArea.split('/');
            let x1 = parseInt(areas[0]);
            let y1 = parseInt(areas[1]);
            let x2 = parseInt(areas[2]);
            let y2 = parseInt(areas[3]);

            let firstCol = index + 1;

            if (y1 >= firstCol)
                y1++;
            if (y2 > firstCol)
                y2++;

            gridArea = `${x1}/${y1}/${x2}/${y2}`;
            verticalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
        });

        let mainColIndex = this.getMainColIndex(index);
        this.gridTemplateColumns = new Array(this.allSectionsV.length + 1).fill(0).map((a, i) => {
            if (i === mainColIndex)
                return mainColTemplate;
            return "auto";
        }).join(' ');

        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());
        this.root.current.addChild(section, undefined, undefined, undefined, (agl) => {
            this.allSectionsV.splice(index, 0, agl.props.id);
            this.props.select.onScrollItem();
            if (callback)
                callback(agl);
        }, undefined, true);
    };

    moveUp = (id) => {
        let horizontalSection = this.getHorizontalSection(id);
        if (!horizontalSection)
            return;

        let gridArea = horizontalSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);
        let gridArea2, areas2, x12, y12, x22, y22;

        let currentIndex = x1 - 1;
        let sideSection = this.allSectionsH[currentIndex - 1];
        sideSection = this.props.idMan.getItem(sideSection);
        if (sideSection) {
            gridArea2 = sideSection.getGridArea();
            areas2 = gridArea2.split('/');
            x12 = parseInt(areas2[0]);
            y12 = parseInt(areas2[1]);
            x22 = parseInt(areas2[2]);
            y22 = parseInt(areas2[3]);

            sideSection.setGridArea(
                `${x12 + 1}/${y1}/${x22 + 1}/${y2}`
                , this.props.breakpointmanager.getHighestBpName());

            horizontalSection.setGridArea(
                `${x1 - 1}/${y12}/${x2 - 1}/${y22}`
                , this.props.breakpointmanager.getHighestBpName());

            swapArrayElements(this.allSectionsH, currentIndex, currentIndex - 1);
        }

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
    };

    moveDown = (id) => {
        let horizontalSection = this.getHorizontalSection(id);
        if (!horizontalSection)
            return;

        let gridArea = horizontalSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);
        let gridArea2, areas2, x12, y12, x22, y22;

        let currentIndex = x1 - 1;
        let sideSection = this.allSectionsH[currentIndex + 1];
        sideSection = this.props.idMan.getItem(sideSection);
        if (sideSection) {
            gridArea2 = sideSection.getGridArea();
            areas2 = gridArea2.split('/');
            x12 = parseInt(areas2[0]);
            y12 = parseInt(areas2[1]);
            x22 = parseInt(areas2[2]);
            y22 = parseInt(areas2[3]);

            sideSection.setGridArea(
                `${x12 - 1}/${y1}/${x22 - 1}/${y2}`
                , this.props.breakpointmanager.getHighestBpName());

            horizontalSection.setGridArea(
                `${x1 + 1}/${y12}/${x2 + 1}/${y22}`
                , this.props.breakpointmanager.getHighestBpName());

            swapArrayElements(this.allSectionsH, currentIndex, currentIndex + 1);
        }

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
    };

    moveRight = (id) => {
        let verticalSection = this.getVerticalSection(id);
        if (!verticalSection)
            return;

        let gridArea = verticalSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);
        let gridArea2, areas2, x12, y12, x22, y22;

        let currentIndex = y1 - 1;
        let sideSection = this.allSectionsV[currentIndex + 1];
        sideSection = this.props.idMan.getItem(sideSection) || null;
        if (sideSection) {
            gridArea2 = sideSection.getGridArea();
            areas2 = gridArea2.split('/');
            x12 = parseInt(areas2[0]);
            y12 = parseInt(areas2[1]);
            x22 = parseInt(areas2[2]);
            y22 = parseInt(areas2[3]);

            sideSection.setGridArea(
                `${x1}/${y12 - 1}/${x2}/${y22 - 1}`
                , this.props.breakpointmanager.getHighestBpName());

            verticalSection.setGridArea(
                `${x12}/${y1 + 1}/${x22}/${y2 + 1}`
                , this.props.breakpointmanager.getHighestBpName());

            swapArrayElements(this.allSectionsV, currentIndex, currentIndex + 1);

            this.getAgl().invalidateSize();
            this.props.select.onScrollItem();
            return;
        }

        // if side section was main horizontal sections
        if (sideSection === null) {
            verticalSection.setGridArea(
                `${x1}/${y1 + 1}/${x2}/${y2 + 1}`
                , this.props.breakpointmanager.getHighestBpName());
            this.allSectionsH.forEach(horizontalSection => {
                horizontalSection = this.props.idMan.getItem(horizontalSection);
                let gridArea = horizontalSection.getGridArea();
                let areas = gridArea.split('/');
                let x13 = parseInt(areas[0]);
                let y13 = parseInt(areas[1]);
                let x23 = parseInt(areas[2]);
                let y23 = parseInt(areas[3]);

                let firstRow = x1;
                let lastRow = x2;

                if (x13 >= firstRow || x23 <= lastRow) {
                    y13--;
                    y23--;
                }

                gridArea = `${x13}/${y13}/${x23}/${y23}`;
                horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
            });

            swapArrayElements(this.allSectionsV, currentIndex, currentIndex + 1);
        }

        let mainColIndex = this.getMainColIndex();
        this.gridTemplateColumns = new Array(this.allSectionsV.length).fill(0).map((a, i) => {
            if (i === mainColIndex)
                return mainColTemplate;
            return "auto";
        }).join(' ');
        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
    };

    moveLeft = (id) => {
        let verticalSection = this.getVerticalSection(id);
        if (!verticalSection)
            return;

        let gridArea = verticalSection.getGridArea();
        let areas = gridArea.split('/');
        let x1 = parseInt(areas[0]);
        let y1 = parseInt(areas[1]);
        let x2 = parseInt(areas[2]);
        let y2 = parseInt(areas[3]);
        let gridArea2, areas2, x12, y12, x22, y22;

        let currentIndex = y1 - 1;
        let sideSection = this.allSectionsV[currentIndex - 1];
        sideSection = this.props.idMan.getItem(sideSection) || null;
        if (sideSection) {
            gridArea2 = sideSection.getGridArea();
            areas2 = gridArea2.split('/');
            x12 = parseInt(areas2[0]);
            y12 = parseInt(areas2[1]);
            x22 = parseInt(areas2[2]);
            y22 = parseInt(areas2[3]);

            sideSection.setGridArea(
                `${x1}/${y12 + 1}/${x2}/${y22 + 1}`
                , this.props.breakpointmanager.getHighestBpName());

            verticalSection.setGridArea(
                `${x12}/${y1 - 1}/${x22}/${y2 - 1}`
                , this.props.breakpointmanager.getHighestBpName());

            swapArrayElements(this.allSectionsV, currentIndex, currentIndex - 1);

            this.getAgl().invalidateSize();
            this.props.select.onScrollItem();
            return;
        }

        // if side section was main horizontal sections
        if (sideSection === null) {
            verticalSection.setGridArea(
                `${x1}/${y1 - 1}/${x2}/${y2 - 1}`
                , this.props.breakpointmanager.getHighestBpName());
            this.allSectionsH.forEach(horizontalSection => {
                horizontalSection = this.props.idMan.getItem(horizontalSection);
                let gridArea = horizontalSection.getGridArea();
                let areas = gridArea.split('/');
                let x13 = parseInt(areas[0]);
                let y13 = parseInt(areas[1]);
                let x23 = parseInt(areas[2]);
                let y23 = parseInt(areas[3]);

                let firstRow = x1;
                let lastRow = x2;

                if (x13 >= firstRow || x23 <= lastRow) {
                    y13++;
                    y23++;
                }

                gridArea = `${x13}/${y13}/${x23}/${y23}`;
                horizontalSection.setGridArea(gridArea, this.props.breakpointmanager.getHighestBpName());
            });

            swapArrayElements(this.allSectionsV, currentIndex, currentIndex - 1);
        }

        let mainColIndex = this.getMainColIndex();
        this.gridTemplateColumns = new Array(this.allSectionsV.length).fill(0).map((a, i) => {
            if (i === mainColIndex)
                return mainColTemplate;
            return "auto";
        }).join(' ');
        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());

        this.getAgl().invalidateSize();
        this.props.select.onScrollItem();
    };

    updateTemplates = () => {
        let mainColIndex = this.getMainColIndex();
        this.gridTemplateColumns = new Array(this.allSectionsV.length).fill(0).map((a, i) => {
            if (i === mainColIndex)
                return mainColTemplate;
            if (isHideInBreakpoint(this.props.idMan.getItem(this.allSectionsV[i])))
                return "0px";
            return "auto";
        }).join(' ');
        this.gridTemplateRows = new Array(this.allSectionsH.length).fill(0).map((a, i) => {
            if (isHideInBreakpoint(this.props.idMan.getItem(this.allSectionsH[i])))
                return "0px";
            return "auto";
        }).join(' ');
        this.root.current.setGrid({
            x: this.gridX,
            y: this.gridY,
            gridTemplateRows: this.gridTemplateRows,
            gridTemplateColumns: this.gridTemplateColumns
        }, undefined, this.props.breakpointmanager.getHighestBpName());
    };

    hasMiniMenuOverride = () => {
        return false;
    };

    invalidateSizeOverride = (agl, self, updateParent, updateChildren, sourceId) => {
        if (self)
            delete this.tempSize;

        Object.values(agl.allChildRefs).forEach(childRef => {
            if (childRef && childRef.current && sourceId !== childRef.current.props.id) {
                childRef.current.invalidateSize(true, false, true);
            }
        });
    };

    getInspectorOverride = () => {
        return (
            <>
                <InspectorBreadcrumbs
                    item={this.getAgl()}
                />
                <InspectorBackground
                    item={this.getAgl()}
                />
                <InspectorPadding
                    item={this.getAgl()}
                />
            </>
        )
    };

    getSectionOfPoint = (left, top, width, height) => {
        let childRef = Object.values(this.getAgl().allChildRefs).find(childRef => {
            if (childRef && childRef.current) {
                if (childRef.current.isPointInclude(left, top))
                    return true;
            }
        });

        if (!childRef)
            childRef = Object.values(this.getAgl().allChildRefs).find(childRef => {
                if (childRef && childRef.current) {
                    if (childRef.current.isPointInclude(left + width, top + height))
                        return true;
                }
            });

        if (!childRef)
            childRef = Object.values(this.getAgl().allChildRefs).find(childRef => {
                return (childRef && childRef.current);
            });

        return childRef.current;
    };

    updateDesign = (compositeDesign) => {
    };
    // White Background
    getStaticChildren = () => {

        return <div
            className="PageBaseWhiteBackground"
            style={{

            }}
        />
    };

    render() {
        let fullWidth = (this.getAgl() && this.getAgl().getSize(false)) ||
            (1002/*0.735 * this.props.editorData.innerWidth*/);
        return (
            <AGLWrapper tagName="PageBase"
                        aglRef={!this.props.aglRef ? this.root : this.root = this.props.aglRef}
                        aglComponent={this}
                        {...this.props}
                        className="Page1Root"
                        style={{
                            width: `${fullWidth}px`,
                            height: "100%",
                            boxShadow: "0 2px 12px 6px rgba(134,138,165,.41)",
                            // marginTop: "10vh !important",
                            display: "inline-block",
                        }}
                        data={this.getData()}
                        isPage
                        resizeSides={[]}
                        page={this}
                        hasMiniMenuOverride={this.hasMiniMenuOverride}
                        getInspector={this.getInspector}
                        invalidateSizeOverride={this.invalidateSizeOverride}
                        // getStaticChildren={this.getStaticChildren}

            >
                <main
                    style={{display: "contents"}}
                    id={"page-main-sections"}
                />
            </AGLWrapper>
        )
    }
}

PageBase.defaultProps = {
    tagName: "PageBase",
};
