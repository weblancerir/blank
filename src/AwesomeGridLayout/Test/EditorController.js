import {createItem, setDataInBreakpoint} from "../AwesomwGridLayoutHelper";
import BreakpointController from "./BreakpointController";

let EditorController = {};
let AllowFunctions = {};

EditorController.onMessage = (data, res, editor) => {
    if (AllowFunctions[data.func]) {
        res(AllowFunctions[data.func](...data.inputs, editor));
    }
};

// TODO GET functions
AllowFunctions.getItemGridData = (itemId, editor) => {
    return editor.idMan.getItem(itemId).props.griddata;
};
AllowFunctions.getLayout = (editor) => {
    let layout = {
        id: editor.rootLayoutRef.current.props.id,
        griddata: editor.rootLayoutRef.current.props.griddata,
        children: []
    };
    let fillData = (item, parent) => {
        parent[item.props.id] = {
            id: item.props.id,
            griddata: item.props.griddata,
            children: []
        };

        Object.values(item.allChildRefs).forEach(child => {
            if (child && child.current)
                fillData(child.current, parent[item.props.id].children);
        });
    };

    fillData(editor.rootLayoutRef.current, layout.children);

    return layout;
};
AllowFunctions.getBreakpointsData = (itemId, editor) => {
    let item = editor.idMan.getItem(itemId);
    return {
        breakpoints: item.props.breakpointmanager.breakpoints,
        currentWidth: item.props.breakpointmanager.lastWidth
    }
};

// TODO POST functions
AllowFunctions.changePage = (pageId, editor) => {
    editor.onPageChange(pageId);
    return true;
};
AllowFunctions.addItem = (parentId, childData, gridItemStyle, style, editor) => {
    createItem(editor.idMan.getItem(parentId), childData, false, gridItemStyle, style);
    return true;
};
AllowFunctions.breakpointManagerMethod = (method, inputs, editor) => {
    let bpController = new BreakpointController(editor.breakpointmanager, editor.editorData, editor.rootLayoutRef);
    bpController[method](inputs);

    return editor.breakpointmanager.breakpoints;
};
AllowFunctions.undoRedoMethod = (method, inputs, editor) => {
    editor.undoredo[method](inputs);
    return true;
};
AllowFunctions.togglePreview = (preview, editor) => {
    editor.togglePreview(preview);
    return true;
};
AllowFunctions.setZoomLevel = (zoomLevel, editor) => {
    editor.setZoomLevel(zoomLevel);
    return true;
};

// TODO Edit functions
AllowFunctions.setDataInBackground = (itemId, prop, value, editor) => {
    let item = editor.idMan.getItem(itemId);
    setDataInBreakpoint(prop, value, item, true);
    return item.props.griddata;
};

export default EditorController;
