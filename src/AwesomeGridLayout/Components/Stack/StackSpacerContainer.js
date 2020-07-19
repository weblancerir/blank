import React from "react";
import Portal from "../../Portal";

export default class StackSpacerContainer extends React.PureComponent{
    constructor(props) {
        super(props);

        this.state = {
            spacers: []
        };
    }

    updateSpacers = (spacers) => {
        setTimeout(() => {
            this.setState({spacers});
        }, 0);
    };

    render() {
        return (
            this.state.spacers.map((spacer, index) => {
                return <Portal nodeId={`${this.props.aglRef.current.props.id}_container`}
                               key={index}
                               document={this.props.document}
                >
                    {spacer}
                </Portal>
            })
        )
    }
}
