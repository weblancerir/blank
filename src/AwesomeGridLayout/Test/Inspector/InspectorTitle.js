import React from "react";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class InspectorTitle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.defaultOpen || false
        }
    }

    render () {
        return (
            <ButtonBase className="InspectorOptionTitle" onClick={(e) => {
                if (this.props.onChange)
                    this.props.onChange(!this.state.open);
                this.setState({open: !this.state.open});
            }}>
                    <span>
                        {this.props.title}
                    </span>

                    <div className="InspectorOptionTitleExpandIcon">
                        {
                            this.state.open &&
                            <img draggable={false} width={10} height={10}
                                 src={'/static/icon/down-arrow.svg'} />
                        }
                        {
                            !this.state.open &&
                            <img draggable={false} width={10} height={10}
                                 src={'/static/icon/right-arrow.svg'} />
                        }
                    </div>
            </ButtonBase>
        )
    }
}
