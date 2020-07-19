export default class GridLineManager {
    constructor(gridContainerRef) {
        this.gridContainerRef = gridContainerRef;
    }

    addGrid = (id, x, y, gridType, gridTemplateRows, gridTemplateColumns, positions, callback) => {
        this.gridContainerRef.current.addGrid(id, x, y, gridType, gridTemplateRows, gridTemplateColumns, positions, callback);
    };

    getIdCache = (gridType) => {
        return this.gridContainerRef.current.getIdCache(gridType);
    };

    getXlineRef = (id) => {
        return this.gridContainerRef.current.getXlineRef(id);
    };

    getYlineRef = (id) => {
        return this.gridContainerRef.current.getYlineRef(id);
    };

    removeGridLine = (id) => {
        this.gridContainerRef.current.removeGridLine(id);
    };

    removeGridLineByType = (type) => {
        this.gridContainerRef.current.removeGridLineByType(type);
    };

    prepareRects = (id) => {
        this.gridContainerRef.current.prepareRects(id);
    };

    hasGridLine = (id, gridType) => {
        return this.gridContainerRef.current.hasGridLine(id, gridType);
    };

    isPrepared = (id) => {
        return this.gridContainerRef.current.isPrepared(id);
    };
}
