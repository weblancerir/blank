import React from "react";
import './ThemeManager.css';

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
