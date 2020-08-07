let windowCache = {
    boundingRects: {},
    clientsWidth: {},
    clientsHeight: {},
    scrollsTop: {},
    scrollsLeft: {},
    scrollsWidth: {},
    scrollsHeight: {}
};

let clearCache = () => {
    windowCache.boundingRects = {};
    windowCache.clientsWidth = {};
    windowCache.clientsHeight = {};
    windowCache.scrollsTop = {};
    windowCache.scrollsLeft = {};
    windowCache.scrollsWidth = {};
    windowCache.scrollsHeight = {};
    delete windowCache.clearCacheTimeuot;
};

export let getCachedBoundingRect = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.boundingRects[id])
        windowCache.boundingRects[id] = node.getBoundingClientRect();

    return windowCache.boundingRects[id];
};

export let getCachedClientWidth = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.clientsWidth[id])
        windowCache.clientsWidth[id] = node.clientWidth;

    return windowCache.clientsWidth[id];
};

export let getCachedClientHeight = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.clientsHeight[id])
        windowCache.clientsHeight[id] = node.clientHeight;

    return windowCache.clientsHeight[id];
};

export let getCachedScrollTop = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.scrollsTop[id])
        windowCache.scrollsTop[id] = node.scrollTop;

    return windowCache.scrollsTop[id];
};

export let getCachedScrollLeft = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.scrollsLeft[id])
        windowCache.scrollsLeft[id] = node.scrollLeft;

    return windowCache.scrollsLeft[id];
};

export let getCachedScrollWidth = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.scrollsWidth[id])
        windowCache.scrollsWidth[id] = node.scrollWidth;

    return windowCache.scrollsWidth[id];
};

export let getCachedScrollHeight = (id, node) => {
    if (!windowCache.clearCacheTimeuot) {
        windowCache.clearCacheTimeuot = true;
        window.requestAnimationFrame(clearCache);
    }

    if (!windowCache.scrollsHeight[id])
        windowCache.scrollsHeight[id] = node.scrollHeight;

    return windowCache.scrollsHeight[id];
};

export let addToCache = (id, rect, propName) => {
    windowCache[propName][id] = rect;
};
