const URL_BOOKS = 'https://potterapi-fedeperin.vercel.app/es/books';

async function getBooks() {
    const response = await fetch(URL_BOOKS);
    const data = await response.json();
    return data;
}

function setLocalStorage(key, quantity) {
    localStorage.setItem(key, quantity);
}

function getLocalStorage(key) {
    return localStorage.getItem(key);
}

document.addEventListener('DOMContentLoaded', async function () {
    const URL_BOOKS = 'https://potterapi-fedeperin.vercel.app/es/books';
    const ICON_SHOPPING = document.getElementById('shopping_cart');
    const PAGE_CONTENT = document.querySelector('.page-content');
    let LIST_BOOKS = JSON.parse(getLocalStorage('app_books_details')) || [];

    async function getBooks() {
        try {
            const response = await fetch(URL_BOOKS);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener los libros:', error);
            return [];
        }
    }

    function setLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    function getLocalStorage(key) {
        return localStorage.getItem(key);
    }

    function updateShoppingCartBadge() {
        ICON_SHOPPING.setAttribute('data-badge', LIST_BOOKS.length);
    }

    function renderBooks(books) {
        let htmlString = '';
        books.forEach(book => {
            if (!LIST_BOOKS.some(item => item.title === book.title)) {
                htmlString += `
                    <div class="demo-card-wide mdl-card mdl-shadow--2dp">
                        <div class="mdl-card__title" style="background: url('${book.cover}') center / cover">
                            <h2 class="mdl-card__title-text" data-title="${book.title}" data-description="${book.description}">${book.title}</h2>
                        </div>
                        <div class="mdl-card__supporting-text">
                            ${book.description.substring(0, 100)}...
                        </div>
                        <div class="mdl-card__actions mdl-card--border">
                            <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect buy-button">
                                Comprar este libro ${book.releaseDate}
                            </button>
                        </div>
                        <div class="mdl-card__menu">
                            <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect share-button">
                                <i class="material-icons">share</i>
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        PAGE_CONTENT.innerHTML = htmlString;
    }

    async function init() {
        PAGE_CONTENT.innerHTML = 'Cargando libros...';
        const books = await getBooks();
        renderBooks(books);
    }

    init();

    PAGE_CONTENT.addEventListener('click', async function (event) {
        const target = event.target;
        if (target.classList.contains('buy-button')) {
            const title = target.parentElement.parentElement.querySelector('.mdl-card__title-text').getAttribute('data-title');
            const description = target.parentElement.parentElement.querySelector('.mdl-card__title-text').getAttribute('data-description');
            
            // Verificar si el libro ya está en el carrito
            const existingBook = LIST_BOOKS.find(book => book.title === title);
            if (existingBook) {
                // Si el libro ya está en el carrito, incrementar la cantidad
                existingBook.quantity = (existingBook.quantity || 1) + 1;
            } else {
                // Si el libro no está en el carrito, agregarlo
                LIST_BOOKS.push({ title, description, quantity: 1 });
            }
            
            // Actualizar el carrito en el almacenamiento local y el contador del carrito
            setLocalStorage('app_books_details', JSON.stringify(LIST_BOOKS));
            updateShoppingCartBadge();
        } else if (target.classList.contains('share-button')) {
            const title = target.parentElement.parentElement.querySelector('.mdl-card__title-text').getAttribute('data-title');
            const description = target.parentElement.parentElement.querySelector('.mdl-card__title-text').getAttribute('data-description');
            const url = window.location.href;

            if (navigator.share) {
                try {
                    await navigator.share({ title, text: description, url });
                    console.log('Contenido compartido exitosamente');
                } catch (error) {
                    console.error('Error al compartir:', error);
                }
            } else {
                // Si la API de Web Share no está disponible, mostrar un mensaje de error
                alert('Lo siento, la función de compartir no está disponible en este navegador.');
            }
        }
    });
});
