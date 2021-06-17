import React from "react";
import AGLWrapper from "../Helpers/AGLWrapper";
import AGLComponent from "../Helpers/AGLComponent";
import '../../HelperStyle.css';
import './HorizontalMenu.css';
import {
    getCompositeDesignData,
    getFromTempData,
    parseColor,
    resolveDesignData,
} from "../../AwesomwGridLayoutHelper";
import {EditorContext} from "../../Editor/EditorContext";
import MenuButton from "../../Menus/MenuBase/MenuButton";
import AnimationDesign from "../Containers/Menus/AnimationDesign";
import ButtonDesign from "../Button/Menus/ButtonDesign";
import {getFontDataByName, getRandomLinkId} from "../Text/TextHelper";
import throttle from "lodash.throttle";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import HorizontalMenuItem from "./HorizontalMenuItem";
import {debounce} from "@material-ui/core";
import SelectMenu from "./SelectMenu";
import StaticFonts from "../Text/Fonts/StaticFonts.json";
import MenuItemDesign from "./Menus/MenuItemDesign";
import TextDesign from "../Button/Menus/TextDesign";
import MenuItemTextDesign from "./Menus/MenuItemTextDesign";
import MenuLayoutDesign from "./Menus/MenuLayoutDesign";
import MenuDropDownDesign from "./Menus/MenuDropDownDesign";

export default class HorizontalMenu extends AGLComponent{
    static contextType = EditorContext;
    constructor (props) {
        super(props);

        this.state = {
            itemInMore: 0
        };

        this.rootBorderRef = React.createRef();
        this.ulId = getRandomLinkId(6);
        this.navId = getRandomLinkId(6);
        this.moreId = getRandomLinkId(6);
    }

    componentDidMount() {
        this.fitMenuItems();
    }

    resolveDesignData = () => {
        resolveDesignData(this, "menuData", {
            menuId: "default",
            fillNav: true,
            sameSize: true,
            textAlign: "center",
            justifyContent: "center",
            rtl: false,
            moreText: "More"
        });
        resolveDesignData(this, "paintData", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
        resolveDesignData(this, "dropDown", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}});
        resolveDesignData(this, "normal", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 0,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
        resolveDesignData(this, "hover", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 5,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
        resolveDesignData(this, "select", {border: {shadow: {
                    xOffset: -1,
                    yOffset: 1,
                    distance: 1,
                    size: 5,
                    blur: 4
                }, radius: {}}, textColor: "#000000"});
    };

    getDefaultData = () => {
        return {
            bpData: {
                overflowData: {
                    state: "show"
                }
            }
        };
    };

    getPrimaryOptions = () => {
        this.resolveDesignData();

        return [
            <MenuButton
                key={1111}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/textwhite.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <MenuDropDownDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={12}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/textwhite.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <MenuLayoutDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={0}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/textwhite.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <MenuItemTextDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={1}
                icon={ <img draggable={false} width={16} height={16}
                            src={require('../../icons/paint.svg')} /> }
                select={this.props.select}
                menu={(e) =>
                    <MenuItemDesign
                        defaultPosition={{
                            x: e.clientX + 48 || 48,
                            y: e.clientY + 48 || 48
                        }}
                        onDesignChange={this.onDesignChange}
                        select={this.props.select}
                        item={this.getAgl()}
                        onStateChange={this.onStateChange}
                    />
                }
            />,
            <MenuButton
                key={2}
                icon={ <span>Change Menu</span> }
                onClick={(e) => {
                    let menuData = getCompositeDesignData(this).menuData;
                    this.context.showModal(<
                        SelectMenu
                            open={true}
                            onClose={() => {this.context.hideModal()}}
                            onDone={(menuId) => {
                                this.onDesignChange("design.menuData.menuId", menuId);
                            }}
                            menuId={menuData.menuId}
                        />
                    );
                }}
            />,
            <MenuButton
                key={33}
                icon={ <img draggable={false} width={16} height={16}
                            src={process.env.PUBLIC_URL + '/static/icon/add.svg'} /> }
                select={this.props.select}
                onClick={(e) => {
                    this.showComponentCode();
                }}
            />
        ]
    };

    updateDesign = (compositeDesign) => {
        this.fitMenuItems();
    };

    getMenu = () => {
        let {menuId} = getCompositeDesignData(this).menuData;

        return this.context.siteData.menus.find(m => m.id === menuId);
    }

    onInvalidateSize = throttle((runtimeStyle) => {
        this.fitMenuItems(runtimeStyle);
    }, 100);

    showItems = debounce(() => {
        let ulNode = document.getElementById(this.ulId);
        if (!ulNode)
            return;
        ulNode.style.visibility = "visible";
    }, 200);

    fitMenuItems = (runtimeStyle, itemAddedInMore) => {
        let menu = this.getMenu();
        let menuData = getCompositeDesignData(this).menuData;

        let ulNode = document.getElementById(this.ulId);
        let navNode = document.getElementById(this.navId);

        if (!navNode || !this.getAgl() || !ulNode)
            return;

        // if (moreNode)
        //     moreNode.style.display = "none";

        navNode.style["justify-content"] = "flex-start";
        ulNode.style.visibility = "hidden";

        let maxLiNodeWidth = 0;
        ulNode.childNodes.forEach(liNode => {
            liNode.style["flex-grow"] = "unset";
            liNode.style["width"] = "auto";
            let w = liNode.getBoundingClientRect().width;
            if (maxLiNodeWidth < w)
                maxLiNodeWidth = w;
        });

        let ulRect = ulNode.getBoundingClientRect();
        let compRect = runtimeStyle? runtimeStyle: this.getAgl().getSize();

        let compareWidth = menuData.sameSize ? maxLiNodeWidth * ulNode.childNodes.length : ulRect.width;
        if (compareWidth > compRect.width) {
            if (this.state.itemInMore === menu.menuItems.length)
                return;
            this.setState({itemInMore: this.state.itemInMore + 1}, () => {
                this.fitMenuItems(runtimeStyle,true);
            })
        } else {
            if (this.state.itemInMore > 0 && !itemAddedInMore) {
                this.setState({itemInMore: this.state.itemInMore - 1}, () => {
                    this.onInvalidateSize(runtimeStyle);
                })
                return;
            }

            if(menuData.fillNav) {
                let sum = 0;
                let childNodes = [];
                ulNode.childNodes.forEach(liNode => {
                    let data = {
                        liNode: liNode,
                        width: menuData.sameSize? maxLiNodeWidth : liNode.getBoundingClientRect().width
                    };
                    childNodes.push(data);
                    sum += data.width;
                });

                childNodes.forEach(liNodeData => {
                    let newWidth = liNodeData.width * compRect.width / sum;
                    console.log("SetNewWidth", newWidth, liNodeData.width, sum, compRect.width)
                    liNodeData.liNode.style["width"] = newWidth + "px";
                });

                navNode.style["justify-content"] = "center";
            }
        }
        navNode.style["justify-content"] = menuData.justifyContent || "center";

        this.showItems();
    }

    getMenuItemStyle = (state) => {
        let menuData = getCompositeDesignData(this).menuData;
        let spanData = getCompositeDesignData(this).spanData || {};
        let data = getCompositeDesignData(this)[state] || {};

        let textColor = data.textColor;
        if (textColor)
            textColor = parseColor(textColor, textColor.alpha, this.context);

        let border = data.border || {};
        let fillColor = data.fillColor;
        if (fillColor)
            fillColor = parseColor(fillColor, fillColor.alpha, this.context);

        border.radius = border.radius || {};

        let borderColor = border.color;
        if (borderColor)
            borderColor = parseColor(borderColor, borderColor.alpha, this.context);

        return {
            justifyContent: menuData.textAlign,
            border:
                `${border.width || 0}px solid ${borderColor || 'rgba(186,218,85,0.63)'}`,
            backgroundColor: fillColor,
            borderRadius:
                `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
            color: textColor || "#000000",
            fontFamily: spanData.fontFamily || getFontDataByName(StaticFonts, "Yekan").fontFamily,
            fontSize: `${spanData.fontSize}px`,
        };
    }
    getDropDownItemStyle = (state) => {
        let menuData = getCompositeDesignData(this).menuData;
        let spanData = getCompositeDesignData(this).spanData || {};
        let data = getCompositeDesignData(this)[state] || {};

        let textColor = data.textColor;
        if (textColor)
            textColor = parseColor(textColor, textColor.alpha, this.context);

        let fillColor = data.fillColor;
        if (fillColor)
            fillColor = parseColor(fillColor, fillColor.alpha, this.context);

        return {
            justifyContent: menuData.textAlign,
            backgroundColor: fillColor,
            color: textColor || "#000000",
            fontFamily: spanData.fontFamily || getFontDataByName(StaticFonts, "Yekan").fontFamily,
            fontSize: `${spanData.fontSize}px`,
        };
    }

    getDropDownStyle = () => {
        let data = getCompositeDesignData(this).dropDown;

        let border = data.border || {};
        let fillColor = data.fillColor;
        if (fillColor)
            fillColor = parseColor(fillColor, fillColor.alpha, this.context);

        border.radius = border.radius || {};
        border.shadow = border.shadow || {};

        let shadowColor = border.shadow.color;
        if (shadowColor)
            shadowColor = parseColor(shadowColor, shadowColor.alpha, this.context);
        let borderColor = border.color;
        if (borderColor)
            borderColor = parseColor(borderColor, borderColor.alpha, this.context);
        return {
            border:
                `${border.width || 0}px solid ${borderColor || 'rgba(186,218,85,0.63)'}`,
            backgroundColor: fillColor,
            borderRadius:
                `${border.radius.topLeft || 0}px ${border.radius.topRight || 0}px ${border.radius.bottomRight || 0}px ${border.radius.bottomLeft || 0}px`,
            boxShadow: `${(border.shadow.xOffset) * (border.shadow.distance)}px ${(border.shadow.yOffset) * (border.shadow.distance)}px ${border.shadow.blur}px ${border.shadow.size}px ${shadowColor || 'rgba(186,218,85,0.63)'}`,
        }
    }
    getStaticChildren = () => {
        this.resolveDesignData();

        let menuData = getCompositeDesignData(this).menuData;

        let menu = this.getMenu();
        let menuItems = cloneObject(menu.menuItems);
        if (menuData.rtl) {
            menuItems.reverse();
            menuItems = menuItems.slice(this.state.itemInMore, menuItems.length);
        } else {
            menuItems = menuItems.slice(0, menuItems.length - this.state.itemInMore);
        }

        let moreItems = cloneObject(menu.menuItems);
        if (menuData.rtl) {
            moreItems.reverse();
            moreItems = moreItems.slice(0, this.state.itemInMore);
        } else {
            moreItems = moreItems.slice(moreItems.length - this.state.itemInMore, moreItems.length);
        }

        return <nav
            className="HorizontalMenuNavRoot"
            ref={this.rootBorderRef}
            id={this.navId}
            style={{
                justifyContent: menuData.justifyContent || "center"
            }}
        >
            <ul
                className="HorizontalMenuUL"
                id={this.ulId}
            >
                {
                    this.state.itemInMore > 0 && menuData.rtl &&
                    <HorizontalMenuItem
                        moreId={this.moreId}
                        className="HorizontalMenuLI"
                        dropDownClassName="HorizontalMenuDropDownUL"
                        dropDownItemClassName="HorizontalMenuDropDownLI"
                        dropDownStyle={this.getDropDownStyle()}
                        getDropDownItemStyle={this.getDropDownItemStyle}
                        getMenuItemStyle={this.getMenuItemStyle}
                        menuItem={{
                            name: menuData.moreText,
                            menuItems: moreItems
                        }}
                        dropDownOnHover
                        state={this.state.menuItemState}
                    />
                }
                {
                    menuItems.map(mi => {
                        return (
                            <HorizontalMenuItem
                                key={mi.id}
                                className="HorizontalMenuLI"
                                dropDownClassName="HorizontalMenuDropDownUL"
                                dropDownItemClassName="HorizontalMenuDropDownLI"
                                dropDownStyle={this.getDropDownStyle()}
                                getDropDownItemStyle={this.getDropDownItemStyle}
                                getMenuItemStyle={this.getMenuItemStyle}
                                menuItem={mi}
                                dropDownOnHover
                                state={this.state.menuItemState}
                            />
                        )
                    })
                }
                {
                    this.state.itemInMore > 0 && !menuData.rtl &&
                    <HorizontalMenuItem
                        moreId={this.moreId}
                        className="HorizontalMenuLI"
                        dropDownClassName="HorizontalMenuDropDownUL"
                        dropDownItemClassName="HorizontalMenuDropDownLI"
                        dropDownStyle={this.getDropDownStyle()}
                        getDropDownItemStyle={this.getDropDownItemStyle}
                        getMenuItemStyle={this.getMenuItemStyle}
                        menuItem={{
                            name: menuData.moreText,
                            menuItems: moreItems
                        }}
                        dropDownOnHover
                        state={this.state.menuItemState}
                    />
                }
            </ul>
        </nav>
    };

    onStateChange = (stateName) => {
        this.setState({menuItemState: stateName});
    };

    render() {
        return (
            <AGLWrapper
                tagName="HorizontalMenu"
                aglComponent={this}
                {...this.props}
                style={{
                    width: "400px",
                    height: "50px",
                }}
                data={this.getData()}
                getPrimaryOptions={this.getPrimaryOptions}
                getInspector={this.getInspector}
                getStaticChildren={this.getStaticChildren}
                onInvalidateSize={this.onInvalidateSize}
                onResize={this.onInvalidateSize}
            />
        )
    }
}

HorizontalMenu.defaultProps = {
    tagName: "HorizontalMenu"
};
