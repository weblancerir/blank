import throttle from 'lodash.throttle';

export default class UndoRedo {
    constructor(max, document, idMan) {
        this.undoQueue = [];
        this.redoQueue = [];
        this.max = max || 20;
        this.idMan = idMan;

        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'z') {
                this.undo();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'Z') {
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
            this.undoFunc();
        }
    };

    hasUndo = () => {
        return this.undoQueue.length > 0;
    };

    redo = throttle(() => {
        if (this.redoQueue.length === 0)
            return;

        let object = this.redoQueue.shift();
        object.redo(this.idMan);
        this.undoQueue.unshift(object);
    }, 100);

    hasRedo = () => {
        return this.redoQueue.length > 0;
    };
};
