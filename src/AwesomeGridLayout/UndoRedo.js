import throttle from 'lodash.throttle';

export default class UndoRedo {
    constructor(max, document, idMan) {
        this.undoQueue = [];
        this.redoQueue = [];
        this.max = max || 20;
        this.idMan = idMan;

        window.addEventListener('keydown', (e) => {
            let key = e.which || e.keyCode; // keyCode detection
            let ctrl = e.ctrlKey ? e.ctrlKey : (key === 17); // ctrl detection
            let shift = e.shiftKey ? e.shiftKey : (key === 16); // ctrl detection
            if (key === 90 && ctrl && !shift) {
                this.undo();
            }
            if (key === 90 && ctrl && shift) {
                this.redo();
            }
        });
    }

    getQueueObject = (func, undo, power) => {
        return {
            redo: func,
            undo: undo,
            power: (typeof power === 'number') ? power : undefined
        }
    };

    add = (func, undo, power) => {
        console.log("ADD")
        this.undoQueue.unshift(this.getQueueObject(func, undo, power));
        if (this.undoQueue.length > this.max)
            this.undoQueue.pop();
        this.redoQueue = [];
    };

    undo = throttle(() => {
        this.undoFunc();
    }, 200);

    undoFunc = () => {
        if (this.undoQueue.length === 0)
            return;

        let object = this.undoQueue.shift();
        let power = object.power || 1;

        power--;
        object.undo(this.idMan);
        this.redoQueue.unshift(object);

        while (power > 0) {
            power--;
            let backObject = this.undoFunc();
            if (backObject) {
                let tempPower = backObject.power;
                backObject.power = object.power;
                object.power = tempPower;
            }
        }

        if (this.undoQueue[0] && this.undoQueue[0].power === 0) {
            let backObject = this.undoFunc();
            if (backObject) {
                let tempPower = backObject.power;
                backObject.power = object.power;
                object.power = tempPower;
            }
        }

        return object;
    };

    hasUndo = () => {
        return this.undoQueue.length > 0;
    };

    redo = throttle(() => {
        this.redoFunc();
    }, 100);

    redoFunc = () => {
        if (this.redoQueue.length === 0)
            return;

        let object = this.redoQueue.shift();
        let power = object.power || 1;

        power--;
        object.redo(this.idMan);
        this.undoQueue.unshift(object);

        while (power > 0) {
            power--;
            let backObject = this.redoFunc();
            if (backObject) {
                let tempPower = backObject.power;
                backObject.power = object.power;
                object.power = tempPower;
            }
        }

        if (this.redoQueue[0] && this.redoQueue[0].power === 0) {
            let backObject = this.redoFunc();
            if (backObject) {
                let tempPower = backObject.power;
                backObject.power = object.power;
                object.power = tempPower;
            }
        }

        return object;
    }

    hasRedo = () => {
        return this.redoQueue.length > 0;
    };
};
