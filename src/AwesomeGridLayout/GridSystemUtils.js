export default class GridSystemUtils{
    static getDefaultGridSystem () {
        let result = {};
        result.colNumber = 1;
        result.rowNumber = 1;
        result.widths = ["100"];
        result.heights = ["100"];
        result.widthUnits = ["%"];
        result.heightUnits = ["%"];

        return result;
    }

    static addColumn = (gridSystem, index) => {
        gridSystem.colNumber++;
        gridSystem.widths.splice(index, 0, "1");
        gridSystem.widthUnits.splice(index, 0, "fr");
    };

    static addRow = (gridSystem, index) => {
        gridSystem.rowNumber++;
        gridSystem.heights.splice(index, 0, "1");
        gridSystem.heightUnits.splice(index, 0, "fr");
    };

    static changeWidth = (gridSystem, index, value) => {
        gridSystem.widths[index] = value;
    };

    static changeHeight = (gridSystem, index, value) => {
        gridSystem.heights[index] = value;
    };

    static changeWidthUnit = (gridSystem, index, value) => {
        gridSystem.widthUnits[index] = value;
    };

    static changeHeightUnit = (gridSystem, index, value) => {
        gridSystem.heightUnits[index] = value;
    };

    static calculate = (gridSystem, parentSize) => {
        // Col Calculations
        gridSystem.calculateionData = {};
        let weightColIndices = [];
        gridSystem.widthSum = 0;
        for(let i = 0; i < gridSystem.widths.length; i++) {
            gridSystem.calculateionData[i] = {};
            if (gridSystem.widthUnits[i] === 'w') {
                weightColIndices.push(i);
                continue;
            }
            gridSystem.calculateionData[i].w = GridSystemUtils.calculateCol(
                gridSystem, gridSystem.widths[i], i);
            gridSystem.widthSum += gridSystem.calculateionData[i].w;
        }
        weightColIndices.forEach(i => {

        });

        // Row Calculations
    };

    static calculateCol (gridSystem, width, index) {
        switch (gridSystem.widthUnits[index]) {
            case 'px':
                return parseFloat(width);
            case '%':
                return parseFloat(width) * gridSystem.parentSize.x / 100;
            case 'vh':
                return parseFloat(width) * gridSystem.windowWidth.h / 100;
            case 'vw':
                return parseFloat(width) * gridSystem.windowWidth.w / 100;
            case 'w':
                let allWeights = GridSystemUtils.getWeightCols(gridSystem);
                let sum = 0;
                allWeights.forEach(weight => {
                    sum += parseFloat(weight);
                });
                if (sum === 0) sum = 1;
                let w = parseFloat(width) * (gridSystem.parentSize.x - gridSystem.widthSum) / sum;
                return Math.max(w, 0);
        }
    }

    static getWeightCols = (gridSystem) => {
        return gridSystem.widths.map((width, i) => {
            return gridSystem.widthUnits[i] === 'w';
        });
    };

    static getWeightRows = (gridSystem) => {
        return gridSystem.heights.map((height, i) => {
            return gridSystem.heightUnits[i] === 'w';
        });
    };
}
