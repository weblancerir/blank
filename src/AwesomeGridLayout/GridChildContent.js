import React from "react";

export default class GridChildContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.childContainer.griddata.propsChange) {
            delete nextProps.childContainer.griddata.propsChange;
            return true;
        }
        if (nextProps.childContainer.isContainer !==
            this.props.childContainer.isContainer ||
            nextProps.childContainer.selected !==
            this.props.childContainer.selected) {
            return true;
        }

        if (nextProps.childContainer.isDummy) {
            return true;
        }

        return false;
    }

    getShadow = () => {
        if(this.props.childContainer.isContainer)
            return "0px 0px 2px 2px rgba(110, 110, 110, 0.3)";

        if (this.props.childContainer.selected)
            return "0px 0px 2px 2px rgba(51, 71, 255, 0.5)";
    };

    render () {
        let {childContainer} = this.props;
        return (
            <div
                style={{
                    boxShadow: this.getShadow(),
                    width: "100%",
                    height: "100%",
                }}
                key={childContainer.griddata.id}
            >
                {
                    childContainer.child
                }
            </div>
        )
    }
}
