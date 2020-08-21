export default () => {
    let url = document.location.origin;
    const queryString = decodeURIComponent(decodeURIComponent(document.location.search));
    if (queryString.indexOf("/identity/signin") > -1 && queryString.indexOf("&redirect_uri=") > -1) {
        const startIndex = queryString.indexOf("&redirect_uri=") + "&redirect_uri=".length;
        const endIndex = queryString.indexOf("/identity/signin");
        url = queryString.substring(startIndex, endIndex);
    }
    return url;
}