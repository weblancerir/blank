import React from "react";
import './Inspector.css';
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class InspectorBreadcrumbs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount () {
        this.mounted = true;
    }

    componentWillUnmount () {
        this.mounted = false;
    }

    render () {
        let {item} = this.props;
        return (
            <div
                className="InspectorOptionRoot"
            >
                <div
                    className="InspectorBreadcrumbsParentsRoot"
                >
                        {
                            item.getParentsId().slice(0, 2).reverse().map(parentId => {
                                let parent = item.props.idMan.getItem(parentId);
                                return (
                                    <ButtonBase
                                        className={"InspectorBreadcrumbsParentsButton"}
                                        onClick={(e) => {
                                            parent.onSelect(true);
                                        }}
                                        key={parent.props.id}
                                    >
                                        {
                                            parent.props.tagName + " >"
                                        }
                                    </ButtonBase>
                                )
                            })
                        }
                </div>

                <span
                    className="InspectorBreadcrumbsTagName"
                >
                    {item.props.tagName}
                </span>
            </div>
        )
    }
}
