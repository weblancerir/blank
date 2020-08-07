import MiniMenu from "./MiniMenu/MiniMenu";
import React from "react";

export function createMiniMenu(item) {
    if (!item)
        return;

    return <MiniMenu
        key={`miniMenu_${item.props.id}`}
        primary={item.getPrimaryOptions() || []}
        shortcut={item.getShortcutOptions() || []}
        itemId={item.props.id}
    />
}
