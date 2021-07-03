import React from "react";
import './AddComponent.css';
import {createItem, sortBy} from "../../AwesomwGridLayoutHelper";
import {cloneObject} from "../../AwesomeGridLayoutUtils";
import {EditorContext} from "../../Editor/EditorContext";

export default class ComponentGrid extends React.Component {
    static contextType = EditorContext;
    constructor(props) {
        super(props);

        this.state = {

        };

        this.rootRef = React.createRef();
    }

    getItemStyle = (item) => {
        let rootWidth = this.rootRef.current?
            this.rootRef.current.getBoundingClientRect().width - 24: 400 - 24;

        return {
            // width: rootWidth / (item.widthRatio || 2),
            // height: rootWidth / (item.widthRatio || 2) / (item.aspectRatio || 2)
            // height: "fit-content",
            gridColumnEnd: `span ${item.width || 2}`,
            gridRowEnd: `span ${item.height || 2}`
        };
    };

    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
    }

    setDraggingItem = (draggingItem, e) => {
        e.persist();

        e.preventDefault();
        // this.props.closeMenu(true);
        this.context.toggleRightMenu("addComponent");
        this.createItemAndDrag(draggingItem, e);
    };

    createItemAndDrag = (item, e) => {
        let {pageRef, editor} = this.props;
        let selectedItem = editor.select.getSelected();
        if (!selectedItem)
            selectedItem = pageRef.current;
        selectedItem = selectedItem.getContainerParent();

        createItem(selectedItem, {
            tagName: item.tagName,
            props: cloneObject(item.presetProps)
        }, undefined, undefined, undefined, (agl) => {
            if (agl.props.input.mouseDown) {
                window.requestAnimationFrame(() => {
                    agl.onMouseDown(e, true);
                });
            }
            // else {
            //     console.log("createItemAndDrag 2");
            //     window.requestAnimationFrame(() => {
            //         this.changeItemParent(agl, selectedItem);
            //     });
            // }
        });
    };

    changeItemParent = (agl, selectedItem) => {
        let size = agl.getSize(false);

        if (!selectedItem || selectedItem.props.isPage)
            selectedItem = this.props.editor.rootLayoutRef.current.props.aglComponent.getSectionOfPoint(
                size.left, size.top, size.width, size.height
            );

        let newGridItemStyle = {
            alignSelf: "center",
            justifySelf: "center",
            position: "relative",
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            gridArea: "1/1/2/2",
        };

        agl.props.dragdrop.dropItem(agl, agl.props.parent, selectedItem, (newItem) => {
            newItem.setGridItemStyle(newGridItemStyle, newItem.props.breakpointmanager.getHighestBpName());
        });
    };

    createItem = (item, e) => {
        // this.props.closeMenu(true);

        this.context.toggleRightMenu("addComponent");

        let {pageRef, editor} = this.props;
        let selectedItem = editor.select.getSelected();
        if (!selectedItem)
            selectedItem = pageRef.current;

        selectedItem = selectedItem.getContainerParent();

        createItem(pageRef.current, {
            tagName: item.tagName,
            props: cloneObject(item.presetProps)
        }, undefined, undefined, undefined, (agl) => {
            window.requestAnimationFrame(() => {
                this.changeItemParent(agl, selectedItem);
            });
        });
    };

    setDraggingEnd = () => {
        console.log("setDraggingEnd");
        this.setState({draggingItem: undefined});
    };

    render() {
        let {allItems, id, rowHeight, categoryItem} = this.props;
        if (!allItems)
            return null;

        console.log("AddComponentItemGrid", rowHeight);
        return (
            <React.Fragment key={id}>
                <div
                    className="AddComponentItemGrid"
                    ref={this.rootRef}
                    key={id}
                    style={{
                        gridAutoRows: rowHeight
                    }}
                >
                    {
                        sortBy(allItems, "order").map((item, index) => {
                            if (item.innerHtml) {
                                return (
                                    <div
                                        key={index}
                                        className="AddComponentItemGridItem"
                                        style={this.getItemStyle(item)}
                                        onDragStart={(e) => {
                                            this.setDraggingItem(item, e);
                                        }}
                                        onDragEnd={(e) => {
                                            this.setDraggingEnd();
                                        }}
                                        onClick={(e) => {
                                            this.createItem(item, e);
                                        }}
                                        draggable
                                    >
                                        <div
                                            dangerouslySetInnerHTML={{__html: item.innerHtml}}
                                        >

                                        </div>
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        key={index}
                                        className="AddComponentItemGridItem"
                                        style={this.getItemStyle(item)}
                                        onDragStart={(e) => {
                                            this.setDraggingItem(item, e);
                                        }}
                                        onDragEnd={(e) => {
                                            this.setDraggingEnd();
                                        }}
                                        onClick={(e) => {
                                            this.createItem(item, e);
                                        }}
                                        draggable
                                    >
                                        {
                                            item.imageUrl ?
                                            <img
                                                className="AddComponentItemGridItemImage"
                                                src={item.imageUrl}
                                                width={"100%"}
                                                draggable={false}
                                            />
                                            :
                                            <div
                                                className="AddComponentItemGridItemBorder"/>
                                        }
                                        {
                                            item.icon &&
                                            <img
                                                className="AddComponentItemGridQAImage"
                                                draggable={false}
                                                width={20 * (item.iconSizeMultiplyer || 1)}
                                                height="auto"
                                                src={require(`../../icons/${item.icon}`)}
                                            />
                                        }
                                        {
                                            item.label &&
                                            <span
                                                className="AddComponentItemGridItemLabel"
                                            >
                                                {item.label}
                                            </span>
                                        }
                                    </div>
                                )
                            }

                        })
                    }
                </div>
            </React.Fragment>
        )
    }
}
