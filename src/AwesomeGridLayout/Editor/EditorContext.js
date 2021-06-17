import React from 'react';
import BreakPointManager from "../BreakPointManager";
import chroma from "chroma-js";
import {addCSS, JSToCSS} from "../AwesomeGridLayoutUtils";
import {resolveDefaultMenu} from "../MenuManager/MenuManager";

function getColorScheme (baseColor) {
    return {
        "1": chroma(baseColor).luminance(0.025).css(),
        "2": chroma(baseColor).luminance(0.06).css(),
        "3": chroma(baseColor).luminance(0.15).css(),
        "4": chroma(baseColor).luminance(0.35).css(),
        "5": chroma(baseColor).luminance(0.55).css(),
    }
}

export const EditorContext = React.createContext({});

const colorKeys = [
    "1","2","3","4","5",
];

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
            setPreview: this.setPreview,
            sendEditCommand: this.sendEditCommand,
            sendPublishCommand: this.sendPublishCommand,
            setProduction: this.setProduction,
            preview: false,
            production: false,
            getTheme: this.getTheme,
            getColor: this.getColor,
            getThemeColorClass: this.getThemeColorClass,
            getThemeBackColorClass: this.getThemeBackColorClass,
            calculateTheme: this.calculateTheme,
            calculateColorCSS: this.calculateColorCSS,
            showLinkGenerator: this.showLinkGenerator,
            showFileManager: this.showFileManager,
            isEditor: this.isEditor,
            postMessageToHolder: this.postMessageToHolder,
            setWebsiteId: this.setWebsiteId,
            showModal: this.showModal,
            hideModal: this.hideModal
        };
    }

    showModal = (modal, callback) => {
        this.state.editor.showModal(modal, callback);
    }

    hideModal = (callback) => {
        this.state.editor.hideModal(callback);
    }

    setWebsiteId = (websiteId) => {
        this.setState({websiteId});
    }

    getThemeColorClass = (color) => {
        if (!color.paletteName || !color.key)
            return '';

        let name = color.paletteName.replaceAll(' ', '_');
        return `Color_${name}_${color.key}`;
    }

    getThemeBackColorClass = (color) => {
        if (!color.paletteName || !color.key)
            return '';

        let name = color.paletteName.replaceAll(' ', '_');
        return `BackColor_${name}_${color.key}`;
    }

    getTheme = (category, name) => {
        if (name)
            return Object.values(this.state.siteData.theme[category].items).find(t => {
                return t.name === name;
            })

        return Object.values(this.state.siteData.theme[category].items);
    }

    getColor = (paletteName, key) => {
        let {siteData} = this.state;

        let theme = siteData.theme;

        this.calculateTheme(false);

        return theme.Colors.items[paletteName][key];
    };

    calculateTheme = (force = true) => {
        let {siteData} = this.state;

        let theme = siteData.theme;

        if (!theme.Colors.calculated) {
            Object.values(theme.Colors.items).forEach(item => {
                let scheme = getColorScheme(item.main);
                colorKeys.forEach(key => {
                    if (force || !item[key])
                        item[key] = scheme[key];
                })
            });

            theme.Colors.calculated = true;

            this.calculateColorCSS();
        }
    };

    calculateColorCSS = (doc) => {
        let {siteData} = this.state;
        let theme = siteData.theme;
        let colorsCSS = [];
        console.log("calculateColorCSS", doc);
        Object.values(theme.Colors.items).forEach(item => {
            colorKeys.forEach(key => {
                let id = this.getThemeColorClass({
                    paletteName: item.name,
                    key: key
                });
                let backColor = this.getThemeBackColorClass({
                    paletteName: item.name,
                    key: key
                });

                let cssText = `
                    .${id} {
                        color: ${item[key]}
                    }
                    
                    .${backColor} {
                        background-color: ${item[key]}
                    }
                    `;

                colorsCSS.push({cssText, id});
                addCSS(cssText, id, doc);
            })
        });
    }

    setProduction = (callback) => {
        this.setState({production:true, preview:true}, callback);
    }

    postMessageToHolder = (data, callback) => {
        this.state.editor.postMessage(data, callback);
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

    isEditor = () => {
        return !this.state.preview && !this.state.production;
    }

    setPreview = (preview, callback) => {
        let pageData = this.state.pageData;
        this.setPageData(undefined, false, () => {
            this.state.editor.idMan.clear();
            this.state.editor.snap.clearSnaps();
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
        console.log("setSiteData", siteData)
        this.setState({siteData}, () => {
            this.postSiteData();
            resolveDefaultMenu(siteData);
            callback && callback();
        });
    };

    postSiteData = () => {
        this.calculateColorCSS();
    }

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
                this.state.editor.snap.clearSnaps();

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
            this.state.editor.snap.clearSnaps();

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

    showLinkGenerator = (linkData, onDone) => {
        this.state.editor.showLinkGenerator(linkData, onDone);
    }

    showFileManager = (options, onDone) => {
        this.state.editor.showFileManager(options, onDone);
    }

    render () {
        return (
            <EditorContext.Provider value={this.state}>
                {this.props.children}
            </EditorContext.Provider>
        )
    }
}
