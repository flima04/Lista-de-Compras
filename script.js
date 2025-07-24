const entrada = document.getElementById("entrada")
const itemInput = document.getElementById("item");
const qtdInput = document.getElementById("qtd");
const catgInput = document.getElementById("categoria");
const btnAdd = document.getElementById("btn-add");
const filterInput = document.getElementById("filtro");
const btnFilter = document.getElementById("btn-filter")
const listaCompras = document.getElementById("lista-compras");
const tituloListaCompras = document.getElementById("titulo-lista-compras");
const itensListaCompras = document.getElementById("itens-lista-compras");
const comprasConcluidas = document.getElementById("compras-concluidas");
const tituloComprasConcluidas = document.getElementById("titulo-compras-concluidas");
const itensComprasConcluidas = document.getElementById("itens-compras-concluidas");

let idEdicao = null;
let filtro = "todas";

// Carrega todos os items salvos no LS
document.addEventListener('DOMContentLoaded', loadItems); 
document.addEventListener('DOMContentLoaded', loadConcludedItems);

// Chama a função de add ou editar
btnAdd.addEventListener("click", () => {
    addOrEditItem();
})

//Muda o valor do filtro e chama as funções de carregamento
btnFilter.addEventListener("click", () => {
    const filter = filterInput.value;
    filtro = filter;
    loadItems();
    loadConcludedItems();
})

// Retorna um array com todos os items salvos no LS
function getItemsLocalStorage() {
    const items = localStorage.getItem('items');
    return items ? JSON.parse(items) : [];
}

// Retorna um array com todos os items concluídos salvos no LS
function getItemsConcludedLocalStorage() {
    const itemsConcluded = localStorage.getItem('concluded');
    return itemsConcluded ? JSON.parse(itemsConcluded) : [];
}

// Cria ou edita um item e passa um novo array para as fuções de salvar no LS
function addOrEditItem() {
    const item = itemInput.value;
    const qtd = qtdInput.value;
    const catg = catgInput.value;

    if (!item || !qtd || !catg) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (qtd < 1 || qtd % 1 !== 0) {
        alert("Digite uma quantidade válida.");
        return;
    }

    const items = getItemsLocalStorage();

    if (idEdicao) {
        const index = items.findIndex(i => i.id === idEdicao);
        items[index].name = item;
        items[index].amount = qtd;
        items[index].category = catg;

        idEdicao = null
    } else {
        const novoItem = {
            id: Date.now(),
            name: item,
            amount: qtd,
            category: catg,
        };

        items.push(novoItem);
        console.log(items)
    }

    saveItemsLocalStorage(items);
    loadItems();
    loadConcludedItems();

    itemInput.value = ""
    qtdInput.value = "";
    catgInput.value = "";
}

// Salva novo array de items NÃO concluídos no LS
function saveItemsLocalStorage(items) {
    localStorage.setItem("items", JSON.stringify(items));
}

// Salva novo array de items concluídos no LS
function saveItemsConcludedLocalStorage(concluded) {
    localStorage.setItem("concluded", JSON.stringify(concluded));
}

// Carrega os items do LS e passa para a função que add no DOM
function loadItems() {
    const items = getItemsLocalStorage();
    if (!items.length){
        tituloListaCompras.innerHTML = "";
        itensListaCompras.innerHTML = "";
        return;
    } else {
        tituloListaCompras.innerHTML = "<h2>Itens adicionados:</h2>"
        itensListaCompras.innerHTML = "";
        if (filtro !== "todas") {
            const itemsFiltered = items.filter(i => i.category === filtro);
            itemsFiltered.forEach(item => addItemNoDom(item));
        } else {
            tituloListaCompras.innerHTML = "<h2>Itens adicionados:</h2>"
            items.forEach(item => addItemNoDom(item));
        }
    }
}

// Carrega os items concluídos do LS e passa para a função que add no DOM
function loadConcludedItems() {
    const concludeItems = getItemsConcludedLocalStorage();
    if (!concludeItems.length) {
        tituloComprasConcluidas.innerHTML = "";
        itensComprasConcluidas.innerHTML = "";
        return;
    } else {
        tituloComprasConcluidas.innerHTML = "<h2>Itens concluídos:</h2>";
        itensComprasConcluidas.innerHTML = "";

        if (filtro != "todas") {
            const itemsConcludedFiltered = concludeItems.filter(i => i.category === filtro);
            itemsConcludedFiltered.forEach(item => addItemNoDom(item));
        } else {
            concludeItems.forEach(item => addItemNoDom(item));
        }
        filtro = "todas";
    }
}

// Adiciona items no DOM
function addItemNoDom(item) {
    const card = document.createElement("div");
    const title = document.createElement("h3");
    const amount = document.createElement("p");
    const category = document.createElement("p");
    const btnContainer = document.createElement("div");
    const btnConclude = document.createElement("button");
    const btnEdit = document.createElement("button");
    const btnDelete = document.createElement("button");
    
    title.textContent = item.name;
    amount.innerHTML = `<strong>Qtd:</strong> ${item.amount}`;
    category.innerHTML = `<strong>Catg:</strong> ${item.category}`;
    btnConclude.textContent = "✅";
    btnEdit.textContent = "Editar";
    btnDelete.textContent = "❌";

    card.classList.add("card", item.category);
    card.id = item.id;
    btnContainer.id = "btn-container"

    if (item.status === "concluded") {
        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(category);
        card.appendChild(btnDelete);
        itensComprasConcluidas.appendChild(card);
    } else {
        card.appendChild(title);
        card.appendChild(amount);
        card.appendChild(category);
        btnContainer.appendChild(btnConclude);
        btnContainer.appendChild(btnEdit);
        btnContainer.appendChild(btnDelete);
        card.appendChild(btnContainer);
        itensListaCompras.appendChild(card);
    }

    btnConclude.addEventListener("click", () => {
        concludeItem(item.id);
    })

    btnEdit.addEventListener("click", () => {
        editItem(item.id);
    });

    btnDelete.addEventListener("click", () => {
        if (confirm("Deseja excluir este item?")){
            deleteItem(item);
        }
        
    })
}

// Move itens que estão sendo concluídos, chama as funções salvar no LS e carregar no DOM
function concludeItem(id) {
    if (id === idEdicao) {
        idEdicao = null;
    }
    const itemsConcluded = getItemsConcludedLocalStorage();
    const items = getItemsLocalStorage();
    const itemToConclude = items.find(i => i.id === id);
    const newItems = items.filter(i => i.id !== id);
    itemsConcluded.push(itemToConclude);
    itemToConclude["status"] = "concluded";

    saveItemsLocalStorage(newItems);
    saveItemsConcludedLocalStorage(itemsConcluded);
    loadConcludedItems();
    loadItems();
}

// Edita um item
function editItem(id) {
    const items = getItemsLocalStorage();
    const item = items.find(i => i.id === id);

    window.scrollTo(0, 0)

    
    setTimeout(() => {
        entrada.style.backgroundColor = "rgb(214, 142, 118)";
        setTimeout(() => {
            entrada.style.backgroundColor = "";
        }, 300);
    }, 130);

    const previousEditing = document.querySelector(".editing");
    if (previousEditing) {
        previousEditing.classList.remove("editing");
    }

    itemInput.value = item.name;
    qtdInput.value = item.amount;
    catgInput.value = item.category;

    const cardEditing = document.getElementById(id);
    cardEditing.classList.add("editing");

    idEdicao = id;
}

// Remove um item
function deleteItem(item) {
    if (item.status === "concluded") {
        const concludeItems = getItemsConcludedLocalStorage();
        const newConcludedItems = concludeItems.filter(i => i.id !== item.id);
        saveItemsConcludedLocalStorage(newConcludedItems);
    } else {
        if (item.id === idEdicao) {
            idEdicao = null;
        }
        const items = getItemsLocalStorage();
        const newItems = items.filter(i => i.id !== item.id);
        saveItemsLocalStorage(newItems);
    }
    

    loadItems();
    loadConcludedItems();
}