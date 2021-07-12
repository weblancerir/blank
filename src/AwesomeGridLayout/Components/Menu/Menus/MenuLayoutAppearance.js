import React from "react";
import '../../../Menus/Menu.css';
import Divider from "../../../Menus/CommonComponents/Divider";
import StaticFonts from "../../Text/Fonts/StaticFonts.json";
import {getFontDataByFamily, getFontDataByName} from "../../Text/TextHelper";
import DropDown from "../../../Menus/CommonComponents/DropDown";
import FontSizeSelector2 from "../../Button/Menus/FontSizeSelector2";
import IconButton from "../../../HelperComponents/IconButton";
import Switch from "@material-ui/core/Switch/Switch";
import {inputCopyPasteHandler} from "../../../AwesomwGridLayoutHelper";

export default class MenuLayoutAppearance extends React.Component {
    changeMoreText = () => {
        this.props.onDesignChange(this.props.designKey + '.moreText', this.tempMoreText);
    };

    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Text alignment</p>

                    <div className="ButtonTextLayoutAlignRoot">
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "flex-start");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "flex-start"}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-left.svg')}
                            />
                        </IconButton>
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "center");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "center" || !this.props.data.textAlign}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-center.svg')}
                            />
                        </IconButton>
                        <IconButton
                            buttonBaseStyle={{
                                marginRight: 4,
                                marginLeft: 4,
                            }}
                            imageContainerStyle={{
                                padding: 6
                            }}
                            onClick={(e) => {
                                this.props.onDesignChange(this.props.designKey + '.textAlign', "flex-end");
                            }}
                            className="InspectorAlignsButtons"
                            selected={this.props.data.textAlign === "flex-end"}
                        >
                            <img
                                draggable={false}
                                width={16}
                                height={16}
                                src={require('../../../icons/align-right.svg')}
                            />
                        </IconButton>
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <p
                            className="MenuOptionSectionTitle"
                            style={{marginBottom: 4}}
                        >
                            Items has same size?
                        </p>
                        <Switch
                            className="InspectorOverflowDirSwitch"
                            checked={this.props.data.sameSize}
                            onChange={(e) => {
                                this.props.onDesignChange(`${this.props.designKey}.sameSize`, e.target.checked);
                            }}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <p
                            className="MenuOptionSectionTitle"
                            style={{marginBottom: 4}}
                        >
                            Items fill whole menu width?
                        </p>
                        <Switch
                            className="InspectorOverflowDirSwitch"
                            checked={this.props.data.fillNav}
                            onChange={(e) => {
                                this.props.onDesignChange(`${this.props.designKey}.fillNav`, e.target.checked);
                            }}
                        />
                    </div>
                </div>

                <Divider/>

                {
                    !this.props.data.fillNav &&
                    <>
                        <div className="MenuOptionSection">
                            <p className="MenuOptionSectionTitle">How are items aligned?</p>

                            <div className="ButtonTextLayoutAlignRoot">
                                <IconButton
                                    buttonBaseStyle={{
                                        marginRight: 4,
                                        marginLeft: 4,
                                    }}
                                    imageContainerStyle={{
                                        padding: 6
                                    }}
                                    onClick={(e) => {
                                        this.props.onDesignChange(this.props.designKey + '.justifyContent', "flex-start");
                                    }}
                                    className="InspectorAlignsButtons"
                                    selected={this.props.data.justifyContent === "flex-start"}
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={require('../../../icons/align-left.svg')}
                                    />
                                </IconButton>
                                <IconButton
                                    buttonBaseStyle={{
                                        marginRight: 4,
                                        marginLeft: 4,
                                    }}
                                    imageContainerStyle={{
                                        padding: 6
                                    }}
                                    onClick={(e) => {
                                        this.props.onDesignChange(this.props.designKey + '.justifyContent', "center");
                                    }}
                                    className="InspectorAlignsButtons"
                                    selected={this.props.data.justifyContent === "center" || !this.props.data.justifyContent}
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={require('../../../icons/align-center.svg')}
                                    />
                                </IconButton>
                                <IconButton
                                    buttonBaseStyle={{
                                        marginRight: 4,
                                        marginLeft: 4,
                                    }}
                                    imageContainerStyle={{
                                        padding: 6
                                    }}
                                    onClick={(e) => {
                                        this.props.onDesignChange(this.props.designKey + '.justifyContent', "flex-end");
                                    }}
                                    className="InspectorAlignsButtons"
                                    selected={this.props.data.justifyContent === "flex-end"}
                                >
                                    <img
                                        draggable={false}
                                        width={16}
                                        height={16}
                                        src={require('../../../icons/align-right.svg')}
                                    />
                                </IconButton>
                            </div>
                        </div>

                        <Divider/>
                    </>
                }

                <div className="MenuOptionSection">
                    <div style={{display: "flex", alignItems: "center"}}>
                        <p
                            className="MenuOptionSectionTitle"
                            style={{marginBottom: 4}}
                        >
                            Display items reversed? (Right to left)
                        </p>
                        <Switch
                            className="InspectorOverflowDirSwitch"
                            checked={this.props.data.rtl}
                            onChange={(e) => {
                                this.props.onDesignChange(`${this.props.designKey}.rtl`, e.target.checked);
                            }}
                        />
                    </div>
                </div>

                <Divider/>

                <div className="MenuOptionSection"
                    style={{
                        marginBottom: 12
                    }}
                >
                    <p className="MenuOptionSectionTitle">Text for hide items menu</p>

                    <input
                        defaultValue={this.props.data.moreText || ""}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {this.tempMoreText = e.target.value;}}
                        onBlur={this.changeMoreText}
                        onKeyDown={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.changeMoreText()
                            }
                            inputCopyPasteHandler(e);
                        }}
                    >
                    </input>
                </div>
            </>
        )
    }
}
