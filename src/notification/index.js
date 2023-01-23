let notification;

window.addEventListener('click', () => {
    window.close();
});

window.addEventListener('load', () => {
    let titleElement = document.querySelector('h2');
    let descriptionElement = document.querySelector('p');
    const params = new URLSearchParams(window.location.search);
    let title = params.get('title');
    let description = params.get('description');
    titleElement.innerText = title;
    descriptionElement.innerText = description == 'undefined' ? '' : description;
    setTimeout(() => {
        window.close();
    }, 10000);
});
