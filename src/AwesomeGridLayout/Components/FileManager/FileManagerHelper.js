let FileManagerHelper = {};

FileManagerHelper.list = (editorContext, prefix, continuationToken, onSuccess, onError) => {
    editorContext.postMessageToHolder(
    {
        type: "Server",
        route: "/file/list",
        input: {websiteId: editorContext.website.id, prefix, continuationToken},
        method: "post"
    },
    ({result}) => {
        console.log("FileManagerHelper.list callback", result);
        if (result.success)
            onSuccess(result.data, prefix);
        else
            onError(result.error);
    });
}

FileManagerHelper.upload = (editorContext, objectPath, file, onSuccess, onError) => {
    console.log("FileManagerHelper.upload 1" , file.size / 1024 / 1024)
    editorContext.postMessageToHolder(
        {
            type: "Server",
            route: "/file/upload",
            input: {websiteId: editorContext.website.id, objectPath, objectSizeInMb: file.size / 1024 / 1024},
            method: "post"
        },
        ({result}) => {
            console.log("FileManagerHelper.list callback", result);
            if (result.success)
                onSuccess(result.data);
            else
                onError(result.error);
        });
}

FileManagerHelper.folder = (editorContext, folderPath, onSuccess, onError) => {
    editorContext.postMessageToHolder(
        {
            type: "Server",
            route: "/file/folder",
            input: {websiteId: editorContext.website.id, folderPath},
            method: "post"
        },
        ({result}) => {
            console.log("FileManagerHelper.list callback", result);
            if (result.success)
                onSuccess(result.data);
            else
                onError(result.error);
        });
}

FileManagerHelper.usage = (editorContext, onSuccess, onError) => {
    editorContext.postMessageToHolder(
        {
            type: "Server",
            route: "/file/usage",
            input: {websiteId: editorContext.website.id},
            method: "post"
        },
        ({result}) => {
            console.log("FileManagerHelper.list callback", result);
            if (result.success)
                onSuccess(result.data);
            else
                onError(result.error);
        });
}

// deleteObjects must have this structure:
// [ /* required */
//   {
//      Key: 'STRING_VALUE', /* required */
//   },
//   /* more items */
// ]
FileManagerHelper.delete = (editorContext, deleteObjects, onSuccess, onError) => {
    editorContext.postMessageToHolder(
        {
            type: "Server",
            route: "/file/delete",
            input: {websiteId: editorContext.website.id, deleteObjects},
            method: "post"
        },
        ({result}) => {
            console.log("FileManagerHelper.list callback", result);
            if (result.success)
                onSuccess(result.data);
            else
                onError(result.error);
        });
}

FileManagerHelper.storage = (editorContext, onSuccess, onError) => {
    editorContext.postMessageToHolder(
        {
            type: "Server",
            route: "/file/storage",
            input: {websiteId: editorContext.website.id},
            method: "get"
        },
        ({result}) => {
            console.log("FileManagerHelper.list callback", result);
            if (result.success)
                onSuccess(result.data);
            else
                onError(result.error);
        });
}

export default FileManagerHelper;
