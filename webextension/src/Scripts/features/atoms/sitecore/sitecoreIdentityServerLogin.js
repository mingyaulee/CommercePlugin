export default (username, password) => {
    /** @type {HTMLInputElement} */
    const usernameInput = document.querySelector("input[name='Username']");
    /** @type {HTMLInputElement} */
    const passwordInput = document.querySelector("input[name='Password']");
    /** @type {HTMLButtonElement} */
    const loginButton = document.querySelector("button[value='login']");
    if (usernameInput && passwordInput && loginButton) {
        usernameInput.value = username;
        passwordInput.value = password;
        loginButton.click();
        return true;
    }
    return false;
}