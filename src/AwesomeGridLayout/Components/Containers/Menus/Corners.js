import React from "react";
import '../../../Menus/Menu.css';
import ColorPicker from "../../../Menus/CommonComponents/ColorPicker";
import NumberInput from "../../../Menus/CommonComponents/NumberInput";
import IconButton from "../../../HelperComponents/IconButton";
import {cloneObject} from "../../../AwesomeGridLayoutUtils";

export default class Corners extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            radius: cloneObject(props.radius),
            link: true
        }
    }

    onChange = (value, side) => {
        let radius = this.state.radius;
        let changeSide = [side];
        if (this.state.link)
            changeSide = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
        changeSide.forEach(_side => {
            radius[_side] = value;
            this.props.onDesignChange(`${this.props.designKey}.${_side}`, value);
        });
        this.setState({radius});
    };

    onLinkClick = () => {
        this.setState({link: !this.state.link});
    };

    render () {
        return (
            <div className="MenuOptionSection">
                <p className="MenuOptionSectionTitle">Radius (px)</p>

                <div className="CornersRow">
                    <div className="CornersRowInput">
                        <NumberInput
                            min={0}
                            max={999}
                            value={this.state.radius["topLeft"]}
                            onChange={(v) => this.onChange(v, "topLeft")}
                        />
                    </div>
                    <div className="CornersRowInput" style={{direction: "rtl"}}>
                        <NumberInput
                            min={0}
                            max={999}
                            value={this.state.radius["topRight"]}
                            onChange={(v) => this.onChange(v, "topRight")}
                        />
                    </div>
                </div>

                <div style={{position: "relative"}}>
                    <div className="CornersRow">
                        <div className="CornersRowShowTopLeft"
                             style={{
                                 borderTopLeftRadius: this.state.radius["topLeft"]
                             }}
                        />
                        <div className="CornersRowShowTopRight"
                             style={{
                                 borderTopRightRadius: this.state.radius["topRight"]
                             }}
                        />
                    </div>

                    <div className="CornersRow">
                        <div className="CornersRowShowBottomLeft"
                             style={{
                                 borderBottomLeftRadius: this.state.radius["bottomLeft"]
                             }}
                        />
                        <div className="CornersRowShowBottomRight"
                             style={{
                                 borderBottomRightRadius: this.state.radius["bottomRight"]
                             }}
                        />
                    </div>

                    <div className="CornersLink">
                        <IconButton
                            buttonBaseStyle={{
                                marginLeft: 0
                            }}
                            onClick={this.onLinkClick}
                        >
                            {
                                this.state.link &&
                                <img draggable={false} width={24} height={24}
                                     src={require('../../../icons/chain.svg')} />
                            }
                            {
                                !this.state.link &&
                                <img draggable={false} width={24} height={24}
                                     src={require('../../../icons/unlink.svg')} />
                            }
                        </IconButton>
                    </div>
                </div>

                <div className="CornersRow">
                    <div className="CornersRowInput">
                        <NumberInput
                            min={0}
                            max={999}
                            value={this.state.radius["bottomLeft"]}
                            onChange={(v) => this.onChange(v, "bottomLeft")}
                        />
                    </div>
                    <div className="CornersRowInput" style={{direction: "rtl"}}>
                        <NumberInput
                            min={0}
                            max={999}
                            value={this.state.radius["bottomRight"]}
                            onChange={(v) => this.onChange(v, "bottomRight")}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
