import React from "react";
import './ThemeManager.css';
import './ThemeColorPicker.css';
import Image from "../../Menus/CommonComponents/Image";
import Draggable from "react-draggable";
import Portal from "../../Portal";
import IconButton from "../../HelperComponents/IconButton";
import chroma from "chroma-js";
import HexColorPicker from "./HexColorPicker";
import {parseColor} from "../../AwesomwGridLayoutHelper";
import {EditorContext} from "../../Editor/EditorContext";

const colorKeys = [
    "1","2","3","4","5",
];

export default class ThemeColorPicker extends React.Component {
    static contextType = EditorContext;

    constructor(props) {
        super(props);
        this.state = {
            color: props.color
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getDefaultPos = (defaultPosition) => {
        return {
            y: Math.min(defaultPosition.y, window.innerHeight - 398),
            x: Math.min(defaultPosition.x, window.innerWidth - 300),
        }
    };

    onSelectColor = (color) => {
        this.setState({color});
        this.props.onChangeComplete && this.props.onChangeComplete(color);
    };

    onAddColor = (color) => {
        let siteData = this.context.siteData;
        if (!siteData.myColors.find(c => c === color))
            siteData.myColors.unshift(color);

        siteData.myColors = siteData.myColors.slice(0, 17);

        this.onSelectColor(color);
        this.context.update();
    };

    onAddColorClick = () => {
        this.setState({addColor: true});
    };

    render() {
        let {editor} = this.context;
        let siteData = this.context.siteData;
        let themeColorCategoryItems = siteData.theme.Colors.items;
        return (
            <Portal node={document.body}>
                <div style={{
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                    zIndex: 999999999999999
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '0px',
                        right: '0px',
                        bottom: '0px',
                        left: '0px',
                    }} onClick={ (e) => this.props.onClose && this.props.onClose() }/>

                    <Draggable
                        handle=".ThemeColorPickerHeaderTitle"
                        bounds="parent"
                        defaultPosition={this.getDefaultPos(this.props.defaultPosition)}
                    >
                        <div className="ThemeColorPickerRoot"
                             style={{
                                 zIndex: 99999999999999999,
                             }}>
                            <div className="ThemeColorPickerHeaderRoot">
                                <div className="ThemeColorPickerHeaderTitle">
                                    Color Picker
                                </div>

                                <IconButton
                                    onClick={(e) => this.props.onClose && this.props.onClose()}
                                    className="ThemeColorPickerHeaderClose"
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={require('../../icons/close.svg')}
                                    />
                                </IconButton>
                            </div>

                            <div className="ThemeColorPickerSiteColorTitle">
                                Site Colors
                                <div className="ThemeColorPickerSiteColorEdit">
                                    Edit
                                </div>
                            </div>

                            <div className="ThemeColorPickerSiteColorGrid">
                                {
                                    colorKeys.map(key => {
                                        return (
                                            Object.values(themeColorCategoryItems).map(item => {
                                                console.log("themeColorCategoryItems", this.state.color);
                                               return (
                                                   <div
                                                       key={item.name + key}
                                                       className={`ThemeColorPickerSiteColorItem ${
                                                           parseColor(this.state.color, undefined, this.context) ===
                                                           this.context.getColor(item.name, key) ?
                                                               "ThemeColorPickerSiteColorItemSelected": ''
                                                           }`}
                                                       style={{
                                                           backgroundColor:
                                                               this.context.getColor(item.name, key)
                                                       }}
                                                       onClick={(e) => {
                                                           this.onSelectColor(
                                                               {
                                                                   paletteName: item.name,
                                                                   key: key
                                                               }
                                                           )
                                                       }}
                                                   >

                                                   </div>
                                               )
                                            })
                                        )
                                    })
                                }
                            </div>

                            <div className="ThemeColorPickerSiteColorTitle">
                                My Colors
                            </div>

                            <div className="ThemeColorPickerMyColorGrid">
                                <div className="ThemeColorPickerMyColorItemAdd" onClick={this.onAddColorClick}>
                                    <Image
                                        width={10}
                                        height={10}
                                        src={process.env.PUBLIC_URL + '/static/icon/add.svg'}
                                    />
                                </div>

                                {
                                    Object.values(siteData.myColors).map(color => {
                                        return (
                                            <div className={`ThemeColorPickerMyColorItem ${
                                                    this.state.color === color ?
                                                        "ThemeColorPickerMyColorItemSelected": ''
                                                    }`}
                                                 key={color}
                                                 style={{
                                                backgroundColor: color
                                            }}
                                                 onClick={(e) => {
                                                     this.onSelectColor(
                                                         color
                                                     )
                                                 }}
                                            />
                                        )
                                    })
                                }
                            </div>



                            <div className="ThemeColorPickerSiteColorTitle">
                                <div className="ThemeColorPickerSiteColorHexTitle">
                                    <div className="ThemeColorPickerSiteColorHexAddColor" onClick={this.onAddColorClick}>
                                        Add Color
                                    </div>
                                </div>

                                <div className="ThemeColorPickerSiteColorHex">
                                    {chroma(parseColor(this.state.color, 1, this.context)).hex()}
                                </div>
                            </div>
                        </div>
                    </Draggable>

                    {/*{
                        this.state.addColor &&
                        <>
                            <div style={ {
                                position: 'fixed',
                                top: '0px',
                                right: '0px',
                                bottom: '0px',
                                left: '0px',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)'
                            }} onClick={ () => this.setState({addColor: undefined}) }/>
                            <div style={{
                                position: 'absolute',
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: '2',
                            }}>
                                <SketchPicker
                                    color={this.state.color}
                                    onChangeComplete={ this.onAddColor }
                                    disableAlpha={this.props.disableAlpha}
                                    width={224}
                                />
                            </div>
                        </>
                    }*/}
                    {
                        this.state.addColor &&
                        <HexColorPicker
                            onClose={() => this.setState({addColor: undefined})}
                            color={this.state.color}
                            onChangeComplete={ this.onAddColor }
                            disableAlpha={this.props.disableAlpha}
                            width={224}
                        />
                    }
                </div>
            </Portal>
        )
    }
}
