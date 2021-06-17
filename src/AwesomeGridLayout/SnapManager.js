export default class SnapManager {
    constructor (snapThreshold, snapSvgRef) {
        this.snaps = {};
        this.snapThreshold = snapThreshold || 10;
        this.snapSvgRef = snapSvgRef;
    }

    addSnap = (id, horizontals = [], verticals = [], parentsId) => {
        this.snaps[id] = {
            horizontals, verticals, id, parentsId
        };
    };

    clearSnaps = () => {
        this.snaps = {};
    }

    removeSnap = (id) => {
        delete this.snaps[id];
    };

    checkSnap = (top, left, ignoreId, additionalSnaps = []) => {
        let snapH, snapV;
        let topUp = top + this.snapThreshold;
        let topDown = top - this.snapThreshold;
        let leftUp = left + this.snapThreshold;
        let leftDown = left - this.snapThreshold;

        let snaps = Object.values(this.snaps);
        snaps = snaps.concat(additionalSnaps);

        for (let i = 0; i < snaps.length; i++) {
            let snap = snaps[i];
            if (!snap)
                continue;

            if (snap.id === ignoreId)
                continue;
            if (snap.parentsId && snap.parentsId.includes(ignoreId))
                continue;

            if (!snapH){
                for (let h = 0; h < snap.horizontals.length; h++) {
                    let horizontal = snap.horizontals[h];
                    if (!horizontal)
                        continue;
                    if (horizontal.value <= topUp && horizontal.value >= topDown) {
                        snapH = horizontal;
                        break;
                    }
                }
            }

            if (!snapV) {
                for (let v = 0; v < snap.verticals.length; v++) {
                    let vertical = snap.verticals[v];
                    if (!vertical)
                        continue;
                    if (vertical.value <= leftUp && vertical.value >= leftDown) {
                        snapV = vertical;
                        break;
                    }
                }
            }

            if (snapH && snapV)
                break;
        }

        return {snapH, snapV};
    }

    drawSnap = (snapH, snapV, pointOfSnapH, pointOfSnapV) => {
        this.snapSvgRef.current.update(snapH, snapV, pointOfSnapH, pointOfSnapV)
    }
}
