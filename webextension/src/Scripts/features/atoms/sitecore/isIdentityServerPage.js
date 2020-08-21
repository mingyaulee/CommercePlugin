export default () => {
    return document.querySelectorAll(".login-page, .logo-wrap > img[alt='Sitecore logo'], input[id='ReturnUrl'][value*='/connect/authorize/callback?client_id=Sitecore']").length === 3;
}