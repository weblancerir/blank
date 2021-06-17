import React from "react";
import '../../../Menus/Menu.css';
import Divider from "../../../Menus/CommonComponents/Divider";
import DropDown from "../../../Menus/CommonComponents/DropDown";

export default class VideoSource extends React.Component {
    changeUrl = () => {
        this.props.onDesignChange(this.props.designKey + '.data.embedUrl', this.tempEmbedUrl);
    };
    changeAltText = () => {
        this.props.onDesignChange(this.props.designKey + '.data.altText', this.tempAltText);
    };

    render () {
        return (
            <>
                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">Embed URL (from aparat.com)</p>

                    <input
                        defaultValue={(this.props.data.data && this.props.data.data.embedUrl) || ""}
                        className="NumberInput PageManagerRenameInput PageInfoNameInput"
                        type="text"
                        onChange={(e) => {this.tempEmbedUrl = e.target.value;}}
                        onBlur={this.changeUrl}
                        onKeyPress={(e) => {
                            if((e.keyCode || e.which) === 13) {
                                this.changeUrl()
                            }
                        }}
                    >
                    </input>
                </div>

                <Divider/>

                <div className="MenuOptionSection">
                    <p className="MenuOptionSectionTitle">What's this video about? (SEO)</p>

                    <input
                        defaultValue={(this.props.data.data && this.props.data.data.altText) || ""}
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
            </>
        )
    }
}
