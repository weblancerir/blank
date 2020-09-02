import React from "react";
import './ThemeManager.css';
import Image from "../../Menus/CommonComponents/Image";
import chroma from 'chroma-js';

export default class ThemeTextEditMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div></div>
        )
    }
}
