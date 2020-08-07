import React from "react";
import './Inspector.css';
import {alignItem} from "../../AwesomwGridLayoutHelper";
import IconButton from "../../HelperComponents/IconButton";

export default class InspectorAligns extends React.Component {
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

    getButtonsData = () => {
        return [
            {
                name: "Align to left",
                horizontal: "start",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-left.svg')}
                />
            },
            {
                name: "Align to center",
                horizontal: "center",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-center.svg')}
                />
            },
            {
                name: "Align to right",
                horizontal: "end",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-right.svg')}
                />
            },
            {
                name: "Align to top",
                vertical: "start",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-top.svg')}
                />
            },
            {
                name: "Align to middle",
                vertical: "center",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-middle.svg')}
                />
            },
            {
                name: "Align to bottom",
                vertical: "end",
                img: <img
                    draggable={false}
                    width={16}
                    height={16}
                    src={require('../../icons/align-bottom.svg')}
                />
            },
        ]
    };

    render () {
        let {item} = this.props;
        return (
            <div className="InspectorOptionRoot">
                <span className="InspectorOptionTextTitle">
                    Alignment
                </span>
                <div
                    className="InspectorAlignsRoot"
                >
                    {
                        this.getButtonsData().map((data, i) => {
                            return (
                                <IconButton
                                    key={data.name}
                                    buttonBaseStyle={{
                                        marginLeft: 0,
                                    }}
                                    imageContainerStyle={{
                                        padding: 6
                                    }}
                                    onClick={(e) => {
                                        alignItem(item, data.vertical, data.horizontal)
                                    }}
                                    className="InspectorAlignsButtons"
                                >
                                    {data.img}
                                </IconButton>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
