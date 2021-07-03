import React from "react";
import AwesomeGridLayout from "./AwesomeGridLayout";
import CustomElement2 from "./CostumElement2";

export default class CustomElement3 extends AwesomeGridLayout{
    onElementResize = (newSize) => {
    };

    getChilds = () => {
        let cs = [];
        for (let i = 0; i < 2; i++){
            for (let j = 0; j < 2; j++){
                cs.push(
                        <CustomElement2
                            id={"CustomElement2_" + i + "_" + j}
                            griddata={{
                                w: "50%",
                                h: "50%",
                                constraints: {
                                    left: (i * 50) + "%",
                                    top: (j * 50) + "%"
                                },
                                draggable: false,
                                resizable: false,
                                scrollType: "hide",
                            }}
                        />
                );
            }
        }

        return cs;
    };

    renderChild () {
        return (
            this.getChilds()
        )
    }
}
