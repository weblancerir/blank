import {getRandomLinkId} from "../Components/Text/TextHelper";
import {cloneObject} from "../AwesomeGridLayoutUtils";

export function resolveDefaultMenu (siteData) {
    if (!siteData.menus)
        siteData.menus = [];

    let defaultMenu = siteData.menus.find(m => m.isDefault === true);

    if (!defaultMenu) {
        defaultMenu = {
            isDefault: true,
            name: "Default Menu",
            id: "default",
            isMenu: true,
            menuItems: Object.values(siteData.allPages).map((page, index) => {
                return {
                    name: page.props.pageName,
                    id: page.props.pageId,
                    order: index,
                    linkData: {
                        type: "Page",
                        data: {
                            window: "current",
                            pageId: page.props.pageId,
                            inputs: []
                        }
                    },
                    isParent: false,
                    menuItems: undefined // this is for parent menu items
                }
            })
        };

        siteData.menus.push(defaultMenu);
    }

    Object.values(siteData.allPages).forEach((page, index) => {
        let pageMenuItem = defaultMenu.menuItems.find(mi => {
            return mi.id === page.props.pageId;
        });

        if (!pageMenuItem) {
            defaultMenu.menuItems.push({
                name: page.props.pageName,
                id: page.props.pageId,
                order: index,
                linkData: {
                    type: "Page",
                    data: {
                        window: "current",
                        pageId: page.props.pageId,
                        inputs: []
                    }
                },
                isParent: false,
                menuItems: undefined // this is for parent menu items
            });
        } else if (pageMenuItem.name !== page.props.pageName) {
            pageMenuItem.name = page.props.pageName;
        }
    })
}

export function getMenuById (siteData, id) {
    return siteData.menus.find(m => m.id === id);
}

export function addNewMenu (siteData, menuName, copyFromId) {
    let newMenu;
    let id = getRandomLinkId(6);
    let homePage = getHomePage(siteData);
    if (!copyFromId) {
        newMenu = {
            name: menuName,
            id,
            isMenu: true,
            menuItems: [{
                name: homePage.props.pageName,
                id: homePage.props.pageId,
                order: 0,
                linkData: {
                    type: "Page",
                    data: {
                        window: "current",
                        pageId: homePage.props.pageId,
                        inputs: []
                    }
                },
                isParent: false,
                menuItems: undefined // this is for parent menu items
            }]
        }
    }
    else {
        let copyFromMenu = siteData.menus.find(m => m.id === copyFromId);
        newMenu = cloneObject(copyFromMenu);
        newMenu.id = id;
        newMenu.name = menuName;
        newMenu.isDefault = false;
    }

    siteData.menus.push(newMenu);

    return newMenu;
}

export function addNewMenuItem (menu, menuItemName, isParent) {
    let id = getRandomLinkId(6);
    let newMenuItem = {
        name: menuItemName,
        id,
        order: menu.menuItems.length,
        linkData: undefined,
        isParent,
        menuItems: undefined // this is for parent menu items
    };
    menu.menuItems.push(newMenuItem);

    return newMenuItem;
}

export function deleteMenu (siteData, menuId) {
    let menuIndex = siteData.menus.findIndex(m => {
        return m.id === menuId;
    });

    siteData.menus.splice(menuIndex, 1);
}

export function deleteMenuItem (menu, menuItemId) {
    let deleteItemById = (parent, id) => {
        if (!parent.menuItems)
            return;

        let index = parent.menuItems.findIndex(mi => {
            return mi.id === id;
        });

        if (index >= 0) {
            parent.menuItems.splice(index, 1);
            return;
        }

        parent.menuItems.forEach(mi => {
            deleteItemById(mi, id);
        });
    };
    deleteItemById(menu, menuItemId);
}

export function toggleMenuItemAsParent (menuItem, isParent) {
    menuItem.isParent = isParent;
    if (isParent) menuItem.menuItems = [];
}

export function setMenuItemLinkData (menuItem, linkData) {
    menuItem.linkData = linkData;
}

export function renameMenuItem (menuItem, newName) {
    menuItem.name = newName;
}

export function changeMenuItemParent (menu, menuItem, newParentId, order) {
    let newParentMenuItem = getMenuItemById(menu, newParentId);

    deleteMenuItem(menu, menuItem.id);

    menuItem.order = newParentMenuItem.menuItems.length;

    if (order !== undefined)
        newParentMenuItem.menuItems.splice(order, 0, menuItem);
    else
        newParentMenuItem.menuItems.push(menuItem);
}

export function moveBackParent (menu, menuItem, currentParentId) {
    let newParentMenuItem = findParent(menu, currentParentId);

    deleteMenuItem(menu, menuItem.id);

    menuItem.order = newParentMenuItem.menuItems.length;

    newParentMenuItem.menuItems.push(menuItem);
}

export function reorderMenuItem (menu, menuItem, newIndex) {
    let parentMenuItem = findParent(menu, menuItem.id);

    deleteMenuItem(menu, menuItem.id);

    parentMenuItem.menuItems.splice(newIndex, 0 , menuItem);
}

export function getIndexInParent (menu, menuItem) {
    let parentMenuItem = findParent(menu, menuItem.id);

    let index = parentMenuItem.menuItems.findIndex(mi => {
        return mi.id === menuItem.id;
    });

    return index;
}

export function findParent (menu, menuItemId) {
    if (!menu.menuItems)
        return;

    let menuItem = menu.menuItems.find(mi => mi.id === menuItemId);

    if (menuItem)
        return menu;

    let parentMenu;
    menu.menuItems.forEach(mi => {
        let foundParentMenuItem = findParent(mi, menuItemId);
        if (foundParentMenuItem)
            parentMenu = foundParentMenuItem;
    })

    return parentMenu;
}

function getMenuItemById (menu, id) {
    if (menu.id === id)
        return menu;

    if (menu.menuItems){
        let menuItem = menu.menuItems.find(mi => {
            return mi.id === id;
        });

        if (menuItem)
            return menuItem;

        menu.menuItems.forEach(mi => {
            let foundMenuItem = getMenuItemById(mi, id);
            if (foundMenuItem)
                menuItem = foundMenuItem;
        });

        return menuItem;
    }
}

export function getHomePage (siteData) {
    let homePage = Object.values(siteData.allPages).find(pageData => {
        return pageData.props.isHome;
    });

    if (!homePage)
        homePage = Object.values(siteData.allPages)[0];

    return homePage;
}
