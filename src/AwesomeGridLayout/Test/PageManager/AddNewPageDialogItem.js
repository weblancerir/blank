import React from "react";
import './AddNewPageDialogItem.css';

export default class AddNewPageDialogItem extends React.Component {
    render () {
        return (
            <div className="AddNewPageDialogItemRoot">
                <span className="AddNewPageDialogItemTitle">
                    {this.props.title}
                </span>

                <span className="AddNewPageDialogItemDesc">
                    {this.props.description}
                </span>

                <span className="AddNewPageDialogItemAdd">
                    Add
                </span>
            </div>
        )
    }
}
