import React from "react";
import './AddComponent.css';
import ComponentGrid from "./ComponentGrid";
import Divider from "../../Menus/CommonComponents/Divider";
import debounce from 'lodash.debounce';
import {sortBy} from "../../AwesomwGridLayoutHelper";

export default class AddComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            percent: props.open ? 100 : 0,
            componentListItem: undefined,
            componentSubListItem: undefined,
            componentListItemHover: undefined,
            componentSubListItemHover: undefined
        };

        this.opening = false;
        this.closing = false;
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    open = () => {
        this.opening = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: true});
        this.openInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.openInterval);
                return;
            }
            let percent = this.state.percent += (this.props.speed * this.props.interval / 1000);
            if (percent >= 100) {
                this.opening = false;
                clearInterval(this.openInterval);
            }
            percent = Math.min(100, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    close = (force) => {
        this.closing = true;
        clearInterval(this.closeInterval);
        clearInterval(this.openInterval);
        this.setState({ open: false});
        if (force) {
            this.setState({percent: 0});
            return;
        }
        this.closeInterval = setInterval(() => {
            if (!this.mounted) {
                clearInterval(this.closeInterval);
                return;
            }
            let percent = this.state.percent -= (this.props.speed * this.props.interval / 1000);
            if (percent <= 0) {
                this.closing = false;
                clearInterval(this.closeInterval);
            }
            percent = Math.max(0, percent);
            this.setState({percent});
        }, this.props.interval);
    };

    toggle = (force) => {
        let toggleState = !this.state.open;
        this.state.open ? this.close(force) : this.open();

        return toggleState;
    };

    setComponentListItemDebounce = debounce((componentListItem) => {
        this.setComponentListItem(componentListItem);
    }, 500);

    setComponentListItemLeave = (componentListItem) => {
        if (this.state.componentListItemHover === componentListItem) {
            this.setState({componentListItemHover: undefined});
        }
    };

    setComponentListItem = (componentListItem) => {
        if (componentListItem !== this.state.componentListItem &&
            componentListItem === this.state.componentListItemHover)
            this.setState({componentListItem,
                componentSubListItem: componentListItem.subList && Object.values(componentListItem.subList)[0]?
                    Object.values(componentListItem.subList)[0][0]: undefined
            });
    };

    setComponentSubListItemDebounce = debounce((componentSubListItem) => {
        console.log("componentSubListItem", componentSubListItem)
        this.setComponentSubListItem(componentSubListItem);
    }, 500);

    setComponentSubListItemLeave = (componentSubListItem) => {
        if (this.state.componentSubListItemHover === componentSubListItem) {
            this.setState({componentSubListItemHover: undefined});
        }
    };

    setComponentSubListItem = (componentSubListItem) => {
        if (componentSubListItem !== this.state.componentSubListItem &&
            componentSubListItem.listName === this.state.componentListItem.name &&
            componentSubListItem === this.state.componentSubListItemHover)
            this.setState({componentSubListItem});
    };

    render() {
        let {allComponentData} = this.props;
        if (!allComponentData)
            return null;

        let allItems;
        let rowHeight;
        let categoryItem;
        if (this.state.componentListItem && this.state.componentListItem.allItems) {
            allItems = this.state.componentListItem.allItems;
            rowHeight = this.state.componentListItem.rowHeight;
            categoryItem = this.state.componentListItem;
        }
        if (this.state.componentSubListItem && this.state.componentSubListItem.allItems) {
            allItems = this.state.componentSubListItem.allItems;
            rowHeight = this.state.componentSubListItem.rowHeight;
            categoryItem = this.state.componentSubListItem;
        }

        if (!this.state.componentListItem)
            allItems = undefined;

        return (
            <>
                <div
                    className="AddComponentRoot"
                    style={{
                        left: `${this.state.percent - 100}%`,
                        opacity: this.state.percent / 100
                    }}
                    onContextMenu={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <div
                        className="AddComponentList"
                    >
                        {
                            sortBy(Object.values(allComponentData.builtin), "order").map(componentListItem => {
                                let style = {};
                                if (componentListItem === this.state.componentListItem)
                                    style.backgroundColor = "#e5ffff";
                                if(!componentListItem.subList &&
                                    (!componentListItem.allItems || componentListItem.allItems.length < 1))
                                    return null;
                                return (
                                    <div
                                        key={componentListItem.name}
                                        className="AddComponentListItem"
                                        onMouseEnter={(e) => {
                                            this.setState({componentListItemHover: componentListItem});
                                            this.setComponentListItemDebounce(componentListItem);
                                        }}
                                        onMouseOver={(e) => {
                                            this.setState({componentListItemHover: componentListItem});
                                            this.setComponentListItemDebounce(componentListItem);
                                        }}
                                        onClick={(e) => {
                                            this.setComponentListItem(componentListItem);
                                        }}
                                        onMouseOut={(e) => {
                                            this.setComponentListItemLeave(componentListItem);
                                        }}
                                        style={style}
                                    >
                                        {componentListItem.name}
                                    </div>
                                )
                            })
                        }
                        <Divider/>
                        {
                            sortBy(Object.values(allComponentData.apps), "order").map(componentListItem => {
                                let style = {};
                                if (componentListItem === this.state.componentListItem)
                                    style.backgroundColor = "#e5ffff";
                                return (
                                    <div
                                        key={componentListItem.name}
                                        className="AddComponentListItem"
                                        onMouseEnter={(e) => {
                                            this.setState({componentListItemHover: componentListItem});
                                            this.setComponentListItemDebounce(componentListItem);
                                        }}
                                        onMouseOver={(e) => {
                                            this.setState({componentListItemHover: componentListItem});
                                            this.setComponentListItemDebounce(componentListItem);
                                        }}
                                        onClick={(e) => {
                                            this.setComponentListItem(componentListItem);
                                        }}
                                        onMouseOut={(e) => {
                                            this.setComponentListItemLeave(componentListItem);
                                        }}
                                        style={style}
                                    >
                                        {componentListItem.name}
                                    </div>
                                )
                            })
                        }
                    </div>

                    {
                        this.state.componentListItem &&
                        this.state.componentListItem.subList &&
                        <div
                            className="AddComponentSubList"
                        >
                            {
                                sortBy(Object.keys(allComponentData.builtin[this.state.componentListItem.name].subList), "order")
                                    .map(groupName => {
                                        let componentSubListItems =
                                            allComponentData.builtin[this.state.componentListItem.name].subList[groupName];
                                        return (
                                            <React.Fragment key={groupName}>
                                                <div
                                                    key={groupName}
                                                    className="AddComponentSubListGroup"
                                                >
                                                    {groupName}
                                                </div>
                                                {
                                                    sortBy(componentSubListItems, "order").map(componentSubListItem => {
                                                        let style = {};
                                                        if (componentSubListItem === this.state.componentSubListItem)
                                                            style.backgroundColor = "#e5ffff";
                                                        return (
                                                            <div
                                                                key={componentSubListItem.name}
                                                                className="AddComponentSubListItem"
                                                                onMouseEnter={(e) => {
                                                                    this.setState({componentSubListItemHover: componentSubListItem});
                                                                    this.setComponentSubListItemDebounce(componentSubListItem);
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    this.setState({componentSubListItemHover: componentSubListItem});
                                                                    this.setComponentSubListItemDebounce(componentSubListItem);
                                                                }}
                                                                onClick={(e) => {
                                                                    this.setComponentSubListItem(componentSubListItem);
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    this.setComponentSubListItemLeave(componentSubListItem);
                                                                }}
                                                                style={style}
                                                            >
                                                                {componentSubListItem.name}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </React.Fragment>
                                        )
                                })
                            }
                        </div>
                    }

                    <ComponentGrid
                        allItems={allItems}
                        id={this.state.componentSubListItem? this.state.componentSubListItem.name:
                            this.state.componentListItem? this.state.componentListItem.name: null}
                        closeMenu={this.close}
                        pageRef={this.props.pageRef}
                        editor={this.props.editor}
                        rowHeight={rowHeight}
                        categoryItem={categoryItem}
                    />
                </div>
            </>
        )
    }
}

AddComponent.defaultProps = {
    open: false,
    speed: 400,
    interval: 5
};
