import React from 'react';
import BreakPointManager from "../BreakPointManager";
import chroma from "chroma-js";
import {addCSS} from "../AwesomeGridLayoutUtils";
import {getHomePage, resolveDefaultMenu} from "../MenuManager/MenuManager";

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
                },
                menuManager: {
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
            setWebsite: this.setWebsite,
            showModal: this.showModal,
            hideModal: this.hideModal,
            setUser: this.setUser,
            isInMenu: this.isInMenu,
            redirect: this.redirect
        };
    }

    setUser = (user, callback) => {
        console.log("EditorContext setUser");
        this.setState({user}, callback);
    }

    isInMenu = () => {
        if (this.state.inModal)
            return true;

        if (this.state.menuHolderRef.current && this.state.menuHolderRef.current.isInMenu())
            return true;
        return false;
    }

    showModal = (modal, callback) => {
        console.log("EditorContext showModal");
        this.setState({inModal: true});
        this.state.editor.showModal(modal, callback);
    }

    hideModal = (callback) => {
        console.log("EditorContext hideModal");
        this.setState({inModal: false});
        this.state.editor.hideModal(callback);
    }

    setWebsite = (website) => {
        console.log("EditorContext setWebsite");
        this.setState({website});
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
        console.log("EditorContext setProduction");
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
            console.log("EditorContext setPreview");
            this.setState({preview}, () => {
                this.setPageData(pageData.props.pageId, false, callback);
            });
        });
    }

    update = (callback) => {
        console.log("EditorContext update");
        this.setState({reload: true}, callback);
    };

    initContext = (state, callback) => {
        console.log("EditorContext initContext");
        this.setState(state, callback);
    };

    getInnerWidth = () => {
        return window.innerWidth - this.state.inspectorPinned ? this.state.inspectorWidth : 0;
    };

    setZoomScale = (zoomScale, callback) => {
        console.log("EditorContext setZoomScale");
        this.setState({zoomScale}, callback);
    };

    setSiteData = (siteData, callback) => {
        console.log("EditorContext setSiteData");
        this.setState({siteData}, () => {
            this.postSiteData();
            resolveDefaultMenu(siteData);
            callback && callback();
        });
    };

    postSiteData = () => {
        this.calculateColorCSS();
    }

    redirect = (pageId, force, callback) => {
        let pageData = this.state.siteData.allPages[pageId];
        if (!pageData) pageData = getHomePage(this.state.pageData);
        console.log("redirect000 ");

        this.state.editor.redirect(`/${pageData.props.pageName.toLowerCase()}`, undefined, callback);
    }

    setPageData = (pageId, force, callback) => {
        console.log("EditorContext setPageData0");
        if (this.state.pageData && !force && this.state.pageData.props.pageId === pageId) {
            callback && callback();
            return;
        }

        if (!pageId) {
            console.log("EditorContext setPageData1");
            this.setState({pageData: undefined}, callback);
            return;
        }

        console.log("EditorContext setPageData1.5");
        if (!this.state.pageData) {
            let pageData = this.state.siteData.allPages[pageId];

            if (!pageData.breakpoints) {
                pageData.breakpoints = BreakPointManager.getDefault();
            }

            this.state.editor.setBreakpoints(pageData.breakpoints);
            console.log("EditorContext setPageData2");
            this.setState({pageData}, callback);
            return;
        }

        console.log("EditorContext setPageData2.5");
        if (!this.state.preview) {
            let todo = () => {
                this.state.editor.idMan.clear();
                this.state.editor.snap.clearSnaps();

                this.state.setPageData(undefined, false , () => {
                    let pageData = this.state.siteData.allPages[pageId];

                    if (!pageData.breakpoints) {
                        pageData.breakpoints = BreakPointManager.getDefault();
                    }

                    this.state.editor.setBreakpoints(pageData.breakpoints);
                    console.log("EditorContext setPageData3");
                    this.setState({pageData}, callback);
                });
            }
            console.log("EditorContext setPageData3.5");
            if (this.state.editor.rootLayoutRef.current) {
                this.state.editor.rootLayoutRef.current.onSelect(true, todo);
            } else {
                todo();
            }
        }
        else
        {
            console.log("EditorContext setPageData4.5");
            this.state.editor.idMan.clear();
            this.state.editor.snap.clearSnaps();

            this.state.setPageData(undefined, false , () => {
                let pageData = this.state.siteData.allPages[pageId];

                if (!pageData.breakpoints) {
                    pageData.breakpoints = BreakPointManager.getDefault();
                }

                this.state.editor.setBreakpoints(pageData.breakpoints);
                console.log("EditorContext setPageData4");
                this.setState({pageData}, callback);
            });
        }
    };

    onNewBpAdded = (newBpData, prevBpData) => {
        if (!prevBpData){
            this.update();
            return;
        }

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
        console.log("EditorContext setInspectorPinned");
        this.setState({inspectorPinned}, callback);
    };

    setInspectorWidth = (inspectorWidth, callback) => {
        console.log("EditorContext setInspectorWidth");
        this.setState({inspectorWidth}, callback);
    };

    setDevicePixelRatio = (devicePixelRatio, callback) => {
        console.log("EditorContext setDevicePixelRatio");
        this.setState({devicePixelRatio}, callback);
    };

    setAllComponentData = (allComponentData, callback) => {
        console.log("EditorContext setAllComponentData");
        this.setState({allComponentData}, callback);
    };

    toggleRightMenu = (menuName, state) => {
        let {rightMenus} = this.state;

        if (!state)
            state = !rightMenus[menuName].state;

        if (state === rightMenus[menuName].state)
            return;

        for(let props in rightMenus) {
            if (rightMenus[props].state) {
                rightMenus[props].state = false;
                rightMenus[props].toggle(true);
            }
        }

        rightMenus[menuName].state = rightMenus[menuName].toggle(false, state);

        console.log("EditorContext toggleRightMenu");
        this.setState({rightMenus: {...rightMenus}});
    };

    setPageSizeWidth = (width) => {
        this.state.editor.rootLayoutRef.current.setPageSizeWidth(width);
        this.state.editor.breakpointmanager.setWindowWidth(width);
        console.log("EditorContext setPageSizeWidth");
        this.setState({pageSize: width});
    };

    setPageSize = (pageSize) => {
        console.log("EditorContext setPageSize");
        this.setState({pageSize});
    };

    setRightMenus = (rightMenus, callback) => {
        console.log("EditorContext setRightMenus");
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
