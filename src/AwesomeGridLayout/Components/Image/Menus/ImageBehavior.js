import React from "react";
import '../../../Menus/Menu.css';
import Divider from "../../../Menus/CommonComponents/Divider";
import DropDown from "../../../Menus/CommonComponents/DropDown";

export default class ImageBehavior extends React.Component {
    changeAltText = () => {
        this.props.onDesignChange(this.props.designKey + '.altText', this.tempAltText);
    };

    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">What's in the image? (SEO)</p>

                    <input
                        defaultValue={this.props.data.altText || ""}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {this.tempAltText = e.target.value;}}
                        onBlur={this.changeAltText}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.changeAltText()
                            }
                        }}
                    >
                    </input>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Scroll Behavior</p>

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
                        options={["None", "Parallax", "Reveal"]}
                        onChange={(value) => {
                                this.props.onDesignChange(this.props.designKey + '.scrollType', value);
                        }}
                        value={this.props.data.scrollType || "None"}
                        spanStyle={{
                            width: 230,
                            fontSize: 14,
                            border: "0px solid #cfcfcf",
                        }}
                        renderer={(value) => {
                            return (
                                <div className="TextEditorThemeRendererRoot">
                                    <span style={{
                                    }}>
                                        {value}
                                    </span>
                                </div>
                            )
                        }}
                        valueRenderer={(value) => {
                            return (
                                <span>
                                    {value}
                                </span>
                            )
                        }}
                    />
                </div>
            </>
        )
    }
}
