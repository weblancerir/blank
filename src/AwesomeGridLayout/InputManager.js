import React from "react";
import './AwesomwGridLayoutHelper.css';

export default class SelectManager {
    constructor() {
        window.addEventListener("keydown",(e) =>{
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            this.ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection
        });
        window.addEventListener("keyup",(e) =>{
            e = e || window.event;
            let key = e.which || e.keyCode; // keyCode detection
            if (key === 17) {
                this.ctrl = false;
            }
        });

        this.ctrl = false;
        this.shift = false;
        this.alt = false;
    }
}
