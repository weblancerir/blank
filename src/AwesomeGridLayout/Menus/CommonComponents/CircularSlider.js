import React from "react";
import './CommonMenu.css';
import RCSlider from 'rc-slider';

export default class CircularSlider extends React.Component {
    constructor(props) {
        super(props);
        this.rootDivRef = React.createRef();
    }

    onMouseDown = (e) => {
        this.rect = this.rootDivRef.current.getBoundingClientRect();
        window.addEventListener("pointermove", this.onMouseMove);
        window.addEventListener("pointerup", this.onMouseUp);

        let x = e.clientX;
        let y = e.clientY;

        let vx = x - (this.rect.left + this.rect.width / 2);
        let vy = y - (this.rect.top + this.rect.height / 2);

        let angle = - Math.atan2(vx, vy) * 180 / Math.PI;
        if (angle < 0) {
            angle = angle + 360;
        }
        this.props.onChange(angle);
    };

    onMouseMove = (e) => {
        let x = e.clientX;
        let y = e.clientY;

        let vx = x - (this.rect.left + this.rect.width / 2);
        let vy = y - (this.rect.top + this.rect.height / 2);

        let angle = - Math.atan2(vx, vy) * 180 / Math.PI;
        if (angle < 0) {
            angle = angle + 360;
        }
        this.props.onChange(angle);
    };

    onMouseUp = (e) => {
        window.removeEventListener("pointermove", this.onMouseMove);
        window.removeEventListener("pointerup", this.onMouseUp);
    };

    render () {
        return (
            <div
                className={`CircularSliderRoot ${this.props.className}`}
                style={{
                    transform: `rotate(${this.props.value}deg)`
                }}
                onMouseDown={this.onMouseDown}
                ref={this.rootDivRef}
            >
                <div
                    className="CircularSliderBg"
                    style={{
                        width: this.props.width || 90,
                        height: this.props.width || 90
                    }}
                >
                    <div
                        className="CircularSliderLine"
                    />
                    <div
                        className="CircularSliderCenter"
                    />
                    <div
                        className="CircularSliderKnob"
                    />
                </div>


            </div>
        )
    }
}
