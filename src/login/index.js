function seralizeFormData(form) {
    let data = new FormData(form);
    let obj = {};
    for (let [key, value] of data) {
        obj[key] = value;
    }
    return obj;
}

window.addEventListener('load', () => {
    const loginForm = document.getElementById('login');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { username, password } = seralizeFormData(loginForm);
        if (username.length == 0 || password.length == 0) return; //TODO: deal with this
        let response = await life360.login(username, password);
        if (response.error) return console.log('failed to log in', error); //TODO: deal with this
        await app.changePage('app');
    });
});
