import React from 'react';
import BreakPointManager from "../BreakPointManager";

export const EditorContext = React.createContext({});

export default class EditorContextProvider extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            update: this.update,
            initContext: this.initContext,
            zoomScale: 1,
            editor: undefined,
            setZoomScale: this.setZoomScale,
            siteData: undefined,
            setSiteData: this.setSiteData,
            pageSize: 1006,
            setPageSize: this.setPageSize,
            setPageSizeWidth: this.setPageSizeWidth,
            pageData: undefined,
            setPageData: this.setPageData,
            inspectorPinned: true,
            setInspectorPinned: this.setInspectorPinned,
            inspectorWidth: 260,
            getInnerWith: this.getInnerWidth,
            setInspectorWidth: this.setInspectorWidth,
            devicePixelRatio: window.devicePixelRatio,
            setDevicePixelRatio: this.setDevicePixelRatio,
            allComponentData: undefined,
            setAllComponentData: this.setAllComponentData,
            rightMenus: {
                addComponent: {
                    state: false,
                },
                pageManager: {
                    state: false,
                },
                themeManager: {
                    state: false,
                }
            },
            setRightMenus: this.setRightMenus,
            toggleRightMenu: this.toggleRightMenu,
            onNewBpAdded: this.onNewBpAdded,
            preview: false,
            setPreview: this.setPreview,
            sendEditCommand: this.sendEditCommand,
            sendPublishCommand: this.sendPublishCommand
        };
    }

    sendEditCommand = (callback) => {
        this.state.editor.postMessage({
            type: "Holder",
            func: "onEditMode",
            inputs: []
        });
        this.setPreview(false, callback);
    }

    sendPublishCommand = () => {
        this.sendEditCommand(() => {
            this.state.editor.postMessage({
                type: "Holder",
                func: "onPublishClick",
                inputs: []
            });
        });
    }

    setPreview = (preview, callback) => {
        let pageData = this.state.pageData;
        this.setPageData(undefined, false, () => {
            this.state.editor.idMan.clear();
            this.setState({preview}, () => {
                this.setPageData(pageData.props.pageId, false, callback);
            });
        });
    }

    update = (callback) => {
        this.setState({reload: true}, callback);
    };

    initContext = (state, callback) => {
        this.setState(state, callback);
    };

    getInnerWidth = () => {
        return window.innerWidth - this.state.inspectorPinned ? this.state.inspectorWidth : 0;
    };

    setZoomScale = (zoomScale, callback) => {
        this.setState({zoomScale}, callback);
    };

    setSiteData = (siteData, callback) => {
        this.setState({siteData}, callback);
    };

    setPageData = (pageId, force, callback) => {
        if (this.state.pageData && !force && this.state.pageData.props.pageId === pageId) {
            return;
        }

        if (!pageId) {
            this.setState({pageData: undefined}, callback);
            return;
        }

        if (!this.state.pageData) {
            let pageData = this.state.siteData.allPages[pageId];

            if (!pageData.breakpoints) {
                pageData.breakpoints = BreakPointManager.getDefault();
            }

            this.state.editor.setBreakpoints(pageData.breakpoints);
            this.setState({pageData}, callback);
            return;
        }

        if (!this.state.preview) {
            this.state.editor.rootLayoutRef.current.onSelect(true, () => {
                this.state.editor.idMan.clear();

                this.state.setPageData(undefined, false , () => {
                    let pageData = this.state.siteData.allPages[pageId];

                    if (!pageData.breakpoints) {
                        pageData.breakpoints = BreakPointManager.getDefault();
                    }

                    this.state.editor.setBreakpoints(pageData.breakpoints);
                    this.setState({pageData}, callback);
                });
            });
        }
        else
        {
            this.state.editor.idMan.clear();

            console.log("setPageData", 62)
            this.state.setPageData(undefined, false , () => {
                let pageData = this.state.siteData.allPages[pageId];

                if (!pageData.breakpoints) {
                    pageData.breakpoints = BreakPointManager.getDefault();
                }

                console.log("setPageData", 72)
                this.state.editor.setBreakpoints(pageData.breakpoints);
                this.setState({pageData}, callback);
            });
        }
    };

    onNewBpAdded = (newBpData, prevBpData) => {
        if (!prevBpData){
            this.update();
            return;
        }

        console.log("newBpData", newBpData.name, prevBpData.name)

        let changeGriddata = (item, childData) => {
            if (!item || !item.mounted)
                return;

            let bpData = childData.props.griddata.bpData;
            bpData[newBpData.name] = bpData[prevBpData.name];
            delete bpData[prevBpData.name];

            Object.keys(item.getFromTempData("savedChildren")).map(childId => {
                let childData = item.getFromTempData("savedChildren")[childId];
                changeGriddata(
                    item.allChildRefs[childId].current,
                    childData
                );
            })
        };

        let pageChildData = {
            tagName: this.state.editor.rootLayoutRef.current.props.tagName,
            props: this.state.editor.rootLayoutRef.current.getClearProps({...this.state.editor.rootLayoutRef.current.props}),
            zIndex: 0
        };

        changeGriddata(this.state.editor.rootLayoutRef.current, pageChildData);

        this.update();
    }

    setInspectorPinned = (inspectorPinned, callback) => {
        this.setState({inspectorPinned}, callback);
    };

    setInspectorWidth = (inspectorWidth, callback) => {
        this.setState({inspectorWidth}, callback);
    };

    setDevicePixelRatio = (devicePixelRatio, callback) => {
        this.setState({devicePixelRatio}, callback);
    };

    setAllComponentData = (allComponentData, callback) => {
        this.setState({allComponentData}, callback);
    };

    toggleRightMenu = (menuName, state) => {
        let {rightMenus} = this.state;

        if (state === rightMenus[menuName].state)
            return;

        for(let props in rightMenus) {
            if (rightMenus[props].state) {
                rightMenus[props].state = false;
                rightMenus[props].toggle(true);
            }
        }

        rightMenus[menuName].state = rightMenus[menuName].toggle(false, state);

        this.setState({rightMenus: {...rightMenus}});
    };

    setPageSizeWidth = (width) => {
        this.state.editor.rootLayoutRef.current.setPageSizeWidth(width);
        this.state.editor.breakpointmanager.setWindowWidth(width);
        this.setState({pageSize: width});
    };

    setPageSize = (pageSize) => {
        this.setState({pageSize});
    };

    setRightMenus = (rightMenus, callback) => {
        this.setState({rightMenus}, callback);
    };

    render () {
        return (
            <EditorContext.Provider value={this.state}>
                {this.props.children}
            </EditorContext.Provider>
        )
    }
}
