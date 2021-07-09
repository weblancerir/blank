let DomainManager = {};

DomainManager.getStorageBaseUrl = (siteData) => {
    let {domainConfig} = siteData.metadata;

    if (window.location.hostname.includes("weblancer.ir")) {
        return domainConfig.tempDomain.storageBaseUrl;
    } else {
        for(let i = 0; i < domainConfig.domainData.length; i++) {
            if (domainConfig.domainData[i].domainName.replace(/^www\./,'') ===
                window.location.hostname.replace(/^www\./,''))
            {
                return domainConfig.domainData[i].storageBaseUrl;
            }
        }
    }

    return "https://weblancerstorage.s3.ir-thr-at1.arvanstorage.com/";
}

DomainManager.getWebsiteBaseUrl = (siteData) => {
    let {domainConfig} = siteData.metadata;

    if (window.location.hostname.includes("weblancer.ir")) {
        return domainConfig.tempDomain.targetUrl;
    } else {
        for(let i = 0; i < domainConfig.domainData.length; i++) {
            if (domainConfig.domainData[i].domainName.replace(/^www\./,'') ===
                window.location.hostname.replace(/^www\./,''))
            {
                return domainConfig.domainData[i].targetUrl;
            }
        }
    }

    return "https://weblancer.ir/";
}

DomainManager.getWebsiteName = (website, siteData) => {
    if (website)
        return website.name;

    return siteData ? siteData.websiteName : "";
}

export default DomainManager;
