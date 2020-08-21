export default (str, locationPart) => {
    locationPart = locationPart || "href";
    return document.location[locationPart].toLowerCase().indexOf(str) > -1;
}