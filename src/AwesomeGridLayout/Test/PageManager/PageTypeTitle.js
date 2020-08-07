import React from "react";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";
import './PageTypeTitle.css';

export default class PageTypeTitle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.defaultOpen || false
        }
    }

    render () {
        return (
            <ButtonBase className="PageTypeTitle" onClick={(e) => {
                if (this.props.onChange)
                    this.props.onChange(!this.state.open);
                this.setState({open: !this.state.open});
            }}>
                    <span>
                        {this.props.title}
                    </span>

                    <div className="PageTypeTitleExpandIcon">
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
