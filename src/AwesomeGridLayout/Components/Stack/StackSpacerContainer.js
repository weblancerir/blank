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

    updateDummy = (dummy) => {
        this.setState({dummy});
    };

    render() {
        return (
            <>
                {
                    this.state.spacers.map((spacer, index) => {
                        return <Portal nodeId={`${this.props.aglRef.current.props.id}_container`}
                                       key={index}
                                       document={this.props.document}
                        >
                            {spacer}
                        </Portal>
                    })
                }

                {
                    this.state.dummy &&
                        <>
                            <Portal nodeId={`${this.props.aglRef.current.props.id}_container`}
                                    document={this.props.document}
                            >
                                <div
                                    id={"DUMMYSPACER"}
                                    style={{
                                        ...this.state.dummy.gridItemStyle,
                                        ...this.state.dummy.style,
                                        ...this.state.dummy.size,
                                    }}
                                >

                                </div>
                            </Portal>
                        </>
                }
            </>
        )
    }
}
