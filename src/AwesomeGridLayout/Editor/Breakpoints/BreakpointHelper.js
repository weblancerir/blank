import React from "react";

export const getBreakpointIcon = (bpData) => {
    if (bpData.start >= 1255)
        return <img draggable={false} width={24} height={24} src={process.env.PUBLIC_URL + '/static/icon/computer.svg'} />
    if (bpData.start >= 1001)
        return <img draggable={false} width={24} height={24} src={process.env.PUBLIC_URL + '/static/icon/laptop.svg'} />
    if (bpData.start >= 751)
        return <img draggable={false} width={18} height={18} src={process.env.PUBLIC_URL + '/static/icon/ipad.svg'} />

    return <img draggable={false} width={16} height={16} src={process.env.PUBLIC_URL + '/static/icon/phone.svg'} />
};

export const getBreakpointName = (bpData) => {
    if (bpData.start >= 1255)
        return 'Desktop'
    if (bpData.start >= 1001)
        return 'Laptop'
    if (bpData.start >= 751)
        return 'Tablet'

    return 'Mobile'
};

export const getCommonDevices = () => {
    return [
        {
            name: "Galaxy S7",
            start: 360
        },
        {
            name: "Galaxy S8/S9",
            start: 360
        },
        {
            name: "iPad",
            start: 768
        },
        {
            name: "iPad Pro",
            start: 1024
        },
        {
            name: "iPhone 6/7/8",
            start: 375
        },
        {
            name: "iPhone 6/7/8 Plus",
            start: 414
        },
        {
            name: "iPhone X",
            start: 375
        },
        {
            name: "Pixel 2",
            start: 411
        },
        {
            name: "Pixel 2 XL",
            start: 411
        }
    ];
};
