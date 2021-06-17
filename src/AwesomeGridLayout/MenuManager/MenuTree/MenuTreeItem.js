import React from "react";
import {EditorContext} from "../../Editor/EditorContext";
import './MenuTree.css';
import MenuTreeOrderer from "./MenuTreeOrderer";

export default class MenuTreeItem extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);

        this.state = {
            hover: false
        }
    }

    onDragOver = (e) => {
        let {menuItem} = this.props;

        if (menuItem.isParent)
            this.setState({hover: true});

        this.props.onDragOver(e, menuItem);
    }

    onDragLeave = (e) => {
        this.setState({hover: false});
    }


    render () {
        let {menuItem} = this.props;
        let itemClassName = "MenuTreeItem";
        if (this.state.hover) itemClassName += " MenuTreeItemDropOver";

        let dropableProps = menuItem.isParent ? {
            onDrop: (e) => {this.props.onDrop(e, menuItem)},
            onDragOver: this.onDragOver,
            onDragLeave: this.onDragLeave,
            onClick: this.onDragLeave,
        } : {};
        return (
            <div
                className="MenuTreeItemRoot"
            >
                <div
                    draggable
                    className={itemClassName}
                    onDragStart={(e) => {this.props.onDragStart(e, menuItem)}}
                    {...dropableProps}
                >
                    {this.props.renderer(menuItem)}
                </div>
                {
                    menuItem.isParent &&
                    <div
                        className="MenuTreeItemParentRoot"
                    >
                        {
                            menuItem.menuItems.length > 0 &&
                            <MenuTreeOrderer
                                onDragOver={(e) => {this.props.onOrderOver(e, menuItem, 0)}}
                                onDrop={(e) => {this.props.onOrderDrop(e, menuItem, 0)}}
                            />
                        }
                        {
                            menuItem.menuItems.map((mi, index) => {
                                return (
                                    <React.Fragment key={mi.id}>
                                        <MenuTreeItem
                                            menuItem={mi}
                                            onDragStart={this.props.onDragStart}
                                            onDrop={this.props.onDrop}
                                            onDragOver={this.props.onDragOver}
                                            renderer={this.props.renderer}
                                            onOrderOver={this.props.onOrderOver}
                                            onOrderDrop={this.props.onOrderDrop}
                                        />
                                        <MenuTreeOrderer
                                            onDragOver={(e) => {this.props.onOrderOver(e, menuItem, index + 1)}}
                                            onDrop={(e) => {this.props.onOrderDrop(e, menuItem, index + 1)}}
                                        />
                                    </React.Fragment>
                                )
                            })
                        }
                    </div>
                }
            </div>
        )
    }
}
