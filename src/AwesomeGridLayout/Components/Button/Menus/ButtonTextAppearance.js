import React from "react";
import '../../../Menus/Menu.css';
import Divider from "../../../Menus/CommonComponents/Divider";
import StaticFonts from "../../Text/Fonts/StaticFonts.json";
import {getFontDataByFamily, getFontDataByName} from "../../Text/TextHelper";
import DropDown from "../../../Menus/CommonComponents/DropDown";
import FontSizeSelector2 from "./FontSizeSelector2";

export default class ButtonTextAppearance extends React.Component {
    changeText = () => {
        this.props.onDesignChange(this.props.designKey + '.text', this.tempText);
    };

    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Text in button</p>

                    <input
                        defaultValue={this.props.data.text}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {this.tempText = e.target.value;}}
                        onBlur={this.changeText}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.changeText()
                            }
                        }}
                    >
                    </input>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Font</p>

                    <DropDown
                        rootStyle={{
                            paddingLeft: 4,
                            border: "1px solid rgb(198, 198, 198)",
                            height: 36,
                            borderRadius: 4
                        }}
                        menuItemStyle={{
                            padding: 0
                        }}
                        options={Object.values(StaticFonts)}
                        onChange={(fontData) => {
                                this.props.onDesignChange(this.props.designKey + '.fontFamily', fontData.fontFamily);
                        }}
                        value={this.props.data.fontFamily? getFontDataByFamily(StaticFonts, this.props.data.fontFamily):
                            getFontDataByName(StaticFonts, 'Yekan')}
                        spanStyle={{
                            width: 230,
                            fontSize: 14,
                            border: "0px solid #cfcfcf",
                        }}
                        renderer={(fontData) => {
                            let isRtlStyle = fontData.isRtl ? {justifyContent: "flex-end"}: {}
                            return (
                                <div className="TextEditorThemeRendererRoot" style={isRtlStyle} >
                                            <span style={{
                                                fontFamily: fontData.fontFamily
                                            }}>
                                                {fontData.display}
                                            </span>
                                </div>
                            )
                        }}
                        valueRenderer={(fontData) => {
                            return (
                                <span style={{
                                    fontFamily: fontData.fontFamily
                                }}>
                                            {fontData.display}
                                        </span>
                            )
                        }}
                    />
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Font size</p>
                    <FontSizeSelector2
                        ref={this.fontSizeSelectorRef}
                        style={{
                            paddingLeft: 4,
                            border: "1px solid rgb(198, 198, 198)",
                            height: 36,
                            borderRadius: 4
                        }}
                        fontSize={this.props.data.fontSize || "14"}
                        onChange={(value) => {
                            this.props.onDesignChange(this.props.designKey + '.fontSize', value);
                        }}
                    />
                </div>
            </>
        )
    }
}
