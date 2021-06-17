import React from "react";
import './AddComponent.css';
import {createItem, sortBy} from "../../AwesomwGridLayoutHelper";
import {cloneObject} from "../../AwesomeGridLayoutUtils";

export default class ComponentGrid extends React.Component {
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
        this.setState({draggingItem});

        clearTimeout(this.closingTimeOut);
        this.closingTimeOut = setTimeout(() => {
            if (!this.mounted)
                return;

            if (this.state.draggingItem) {
                this.props.closeMenu(true);
                this.createItemAndDrag(this.state.draggingItem, e);
            }
        }, 200);
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
            console.log("mouseDown", agl.props.input.mouseDown);
            if (agl.props.input.mouseDown)
                window.requestAnimationFrame(() => {
                    agl.onMouseDown(e, true);
                });
            else
                window.requestAnimationFrame(() => {
                    this.changeItemParent(agl, selectedItem);
                });
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
        this.props.closeMenu(true);
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
        this.setState({draggingItem: undefined});
    };

    render() {
        let {allItems, id} = this.props;
        if (!allItems)
            return null;

        return (
            <React.Fragment key={id}>
                <div
                    className="AddComponentItemGrid"
                    ref={this.rootRef}
                    key={id}
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
                                        <img
                                            className="AddComponentItemGridItemImage"
                                            src={item.imageUrl || '/static/image/box.webp'}
                                            width={"100%"}
                                            draggable={false}
                                        />
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
