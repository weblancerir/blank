import React from "react";
import './Adjustment.css'
import AdjustmentSnapLines from "./AdjustmentSnapLines";
import GridChildContainerChildren from "../GridChildContainerChildren";
import GridChildContainerGridLine from "../GridChildContainerGridLine";
import AdjustmentGridLinesWrapper from "./AdjustmentGridLinesWrapper";
import AdjustmentGridRoot from "./AdjustmentGridRoot";
import AdjustmentGridRow from "./AdjustmentGridRow";

export default class AdjustmentGrid extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            item: undefined,
            grid: undefined,
            gridLineManager: undefined
        };
    }

    editing = (item) => {
        let grid = item.getFromData("grid");
        let gridLineManager = item.props.gridLine;
        this.setState({item, grid, gridLineManager});
    };

    update = (item) => {
        if (item === item)
            this.forceUpdate();
    };

    addRow = (index) => {
        if (!this.state.item)
            return;

        if (grid.x === 100)
            return;

        let {grid, item} = this.state;

        grid.x++;
        let rowsHeight = grid.gridTemplateRows.split(' ');

        rowsHeight.splice(index, 0, "minmax(100px,max-content)");
        grid.gridTemplateRows = rowsHeight.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    addColumn = (index) => {
        if (!this.state.item)
            return;

        let {grid, item} = this.state;

        if (grid.y === 100)
            return;

        grid.y++;
        let columnsWidth = grid.gridTemplateColumns.split(' ');

        columnsWidth.splice(index, 0, "1fr");
        grid.gridTemplateColumns = columnsWidth.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    changeColumnWidth = (index, newValue) => {
        if (!this.state.item)
            return;

        let {grid, item} = this.state;

        let columnsWidth = grid.gridTemplateColumns.split(' ');

        columnsWidth.splice(index, 1, newValue);
        grid.gridTemplateColumns = columnsWidth.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    changeRowHeight = (index, newValue) => {
        if (!this.state.item)
            return;

        let {grid, item} = this.state;

        let rowsHeight = grid.gridTemplateRows.split(' ');

        rowsHeight.splice(index, 1, newValue);
        grid.gridTemplateRows = rowsHeight.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    deleteRow = (index) => {
        if (!this.state.item)
            return;

        let {grid, item} = this.state;

        if (grid.x === 1)
            return;

        grid.x--;
        let rowsHeight = grid.gridTemplateRows.split(' ');

        rowsHeight.splice(index, 1);
        grid.gridTemplateRows = rowsHeight.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    deleteColumn = (index) => {
        if (!this.state.item)
            return;

        let {grid, item} = this.state;

        if (grid.y === 1)
            return;

        grid.y--;
        let columnsWidth = grid.gridTemplateColumns.split(' ');

        columnsWidth.splice(index, 1);
        grid.gridTemplateColumns = columnsWidth.join(' ');

        item.setGrid(grid);
        this.setState({grid});
    };

    render () {
        let {gridLineManager, item, grid} = this.state;
        if (!item)
            return null;

        let positions = gridLineManager.getIdCache("A").positions;
        return (
            <AdjustmentGridRoot
                top={positions.top}
                left={positions.left}
                bottom={positions.bottom}
                right={positions.right}
            >
                <AdjustmentGridRow
                    gridLineManager={gridLineManager}
                    itemId={item.props.id}
                    grid={grid}
                />
            </AdjustmentGridRoot>
        )
    }
}
