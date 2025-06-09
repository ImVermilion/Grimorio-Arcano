// Variables globales
let grimoire = JSON.parse(localStorage.getItem('grimoire')) || [];
let selectedCategoryIndex = null;
let editing = false;
let currentCategoryIndex = null;
let currentEntryIndex = null;

function saveGrimoire() {
  localStorage.setItem('grimoire', JSON.stringify(grimoire));
}

function renderCategories() {
  const categoryList = document.getElementById('categoryList');
  categoryList.innerHTML = '';

  grimoire.forEach((category, index) => {
    const categoryBlock = document.createElement('div');
    categoryBlock.className = 'category-block';

    const titleRow = document.createElement('div');
    titleRow.className = 'category-title';
    titleRow.innerHTML = `<span>${index + 1}. ${category.title}</span><span class="category-remove" onclick="removeCategory(${index}, event)">–</span>`;
    titleRow.onclick = () => toggleCategory(index);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'category-content';
    contentDiv.dataset.expanded = 'false';
    contentDiv.style.display = 'block';

    const visibleCount = 2;

    category.entries.forEach((entry, entryIndex) => {
      const entryItem = createEntryItem(entry, index, entryIndex);
      if (entryIndex >= visibleCount) {
        entryItem.classList.add('hidden-when-collapsed');
        entryItem.style.display = 'none';
      }
      contentDiv.appendChild(entryItem);
    });

    if (category.entries.length > visibleCount) {
      const showMore = document.createElement('a');
      showMore.href = '#';
      showMore.innerText = 'Mostrar más...';
      showMore.className = 'show-more';
      showMore.onclick = (e) => {
        e.preventDefault();
        expandCategory(index);
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'show-more-wrapper';
      wrapper.appendChild(showMore);
      contentDiv.appendChild(wrapper);
    }

    const addEntryLink = document.createElement('a');
addEntryLink.href = '#';
addEntryLink.innerText = '➕ Añadir nueva entrada...';
addEntryLink.classList.add('add-entry-link');
addEntryLink.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  selectedCategoryIndex = index;
  showEntryForm();
};
contentDiv.appendChild(addEntryLink);

    categoryBlock.appendChild(titleRow);
    categoryBlock.appendChild(contentDiv);
    categoryList.appendChild(categoryBlock);
  });
}

function createEntryItem(entry, categoryIndex, entryIndex) {
  const entryLink = document.createElement('a');
  entryLink.href = '#';
  entryLink.innerHTML = `${categoryIndex + 1}.${entryIndex + 1} ${entry.title}`;
  entryLink.onclick = () => showEntryContent(categoryIndex, entryIndex);

  const removeBtn = document.createElement('span');
  removeBtn.className = 'entry-remove';
  removeBtn.innerHTML = '–';
  removeBtn.onclick = (e) => {
    e.stopPropagation();
    removeEntry(categoryIndex, entryIndex);
  };

  const entryItem = document.createElement('div');
  entryItem.appendChild(entryLink);
  entryItem.appendChild(removeBtn);
  return entryItem;
}

function expandCategory(index) {
  const content = document.getElementsByClassName('category-content')[index];
  const hidden = content.querySelectorAll('.hidden-when-collapsed');
  hidden.forEach(e => e.style.display = 'block');
  const showMore = content.querySelector('.show-more-wrapper');
  if (showMore) showMore.style.display = 'none';
  content.dataset.expanded = 'true';
}

function toggleCategory(index) {
  const content = document.getElementsByClassName('category-content')[index];
  const isExpanded = content.dataset.expanded === 'true';
  const hidden = content.querySelectorAll('.hidden-when-collapsed');
  const showMore = content.querySelector('.show-more-wrapper');

  if (isExpanded) {
    hidden.forEach(e => e.style.display = 'none');
    if (showMore) showMore.style.display = 'block';
    content.dataset.expanded = 'false';
  } else {
    hidden.forEach(e => e.style.display = 'block');
    if (showMore) showMore.style.display = 'none';
    content.dataset.expanded = 'true';
  }
}

function showCategoryForm() {
  const overlay = document.getElementById('formOverlayCategory');
  overlay.classList.remove('hidden');
  overlay.classList.add('overlay-visible');
  document.getElementById('formOverlayCategory').classList.remove('hidden');
  document.getElementById('categoryTitle').value = '';
}

function hideCategoryForm() {
  const overlay = document.getElementById('formOverlayCategory');
  overlay.classList.add('hidden');
  overlay.classList.remove('overlay-visible');
  document.getElementById('formOverlayCategory').classList.add('hidden');
}

function saveCategory() {
  const title = document.getElementById('categoryTitle').value;
  if (title.trim() === '') return;
  grimoire.push({ title, entries: [] });
  saveGrimoire();
  renderCategories();
  hideCategoryForm();
}

function removeCategory(index, event) {
  event.stopPropagation();
  grimoire.splice(index, 1);
  saveGrimoire();
  renderCategories();
}

function showEntryForm() {
  editing = false;
  document.getElementById('entryTitle').value = '';
  document.getElementById('entryContent').value = '';
  document.getElementById('entryImage').value = '';
  document.getElementById('formOverlayEntry').classList.remove('hidden');
}

function hideEntryForm() {
  document.getElementById('formOverlayEntry').classList.add('hidden');
}

function saveEntry() {
  const title = document.getElementById('entryTitle').value;
  const content = document.getElementById('entryContent').value;
  const imageInput = document.getElementById('entryImage');

  const reader = new FileReader();
  reader.onload = function () {
    const imageData = imageInput.files.length ? reader.result : null;

    if (editing && currentCategoryIndex !== null && currentEntryIndex !== null) {
      const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
      entry.title = title;
      entry.content = content;
      if (imageData) entry.image = imageData;
    } else {
      grimoire[selectedCategoryIndex].entries.push({ title, content, image: imageData });
    }

    saveGrimoire();
    renderCategories();
    hideEntryForm();
    editing = false;

    const catIndex = editing ? currentCategoryIndex : selectedCategoryIndex;
    const entIndex = editing ? currentEntryIndex : grimoire[catIndex].entries.length - 1;
    showEntryContent(catIndex, entIndex);

    currentCategoryIndex = null;
    currentEntryIndex = null;
  };

  if (imageInput.files.length) {
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    reader.onload();
  }
}

function removeEntry(categoryIndex, entryIndex) {
  grimoire[categoryIndex].entries.splice(entryIndex, 1);
  saveGrimoire();
  renderCategories();
  const rightPage = document.getElementById('rightPage');
  rightPage.innerHTML = '<h2>Bienvenido</h2><p>Explora las páginas del grimorio.</p>';
}

function showEntryContent(categoryIndex, entryIndex) {
  const entry = grimoire[categoryIndex].entries[entryIndex];
  currentCategoryIndex = categoryIndex;
  currentEntryIndex = entryIndex;

  const wordsPerPage = 300; // ajustable
  const contentWords = entry.content.split(/\s+/);
  const totalPages = Math.ceil(contentWords.length / wordsPerPage);

  let currentPage = 0;

  function renderPage(pageIndex) {
  const start = pageIndex * wordsPerPage;
  const end = start + wordsPerPage;
  const pageWords = contentWords.slice(start, end).join(" ");
  let pageHTML = pageWords.replace(/\n/g, "<br>");

  if (entry.image && pageHTML.includes("[imagen]")) {
    pageHTML = pageHTML.replace("[imagen]", `<img src="${entry.image}" class="entry-image" />`);
  }

  const rightPage = document.getElementById('rightPage');
  rightPage.innerHTML = `
    <h2>${entry.title}</h2>
    <div class="paged-content">
      <p>${pageHTML}</p>
    </div>
    <div class="page-navigation">
      ${pageIndex > 0 ? `<button id="prevPage">←</button>` : ''}
      <span>Página ${pageIndex + 1} / ${totalPages}</span>
      ${pageIndex < totalPages - 1 ? `<button id="nextPage">→</button>` : ''}
    </div>
    ${pageIndex === totalPages - 1 ? `<button class="edit-button" onclick="editCurrentEntry()">Editar esta entrada</button>` : ''}
  `;


    if (pageIndex > 0) {
      document.getElementById("prevPage").onclick = () => renderPage(pageIndex - 1);
    }
    if (pageIndex < totalPages - 1) {
      document.getElementById("nextPage").onclick = () => renderPage(pageIndex + 1);
    }
  }

  renderPage(currentPage);
}


function editCurrentEntry() {
  if (currentCategoryIndex === null || currentEntryIndex === null) return;

  const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
  document.getElementById('entryTitle').value = entry.title;
  document.getElementById('entryContent').value = entry.content;
  document.getElementById('entryImage').value = '';

  document.getElementById('formOverlayEntry').classList.remove('hidden');
  editing = true;
}

function resetGrimoire() {
  if (confirm('¿Seguro que quieres borrar todo el grimorio?')) {
    localStorage.removeItem('grimoire');
    grimoire = [];
    renderCategories();
    const rightPage = document.getElementById('rightPage');
    rightPage.innerHTML = '<h2>Bienvenido</h2><p>Explora las páginas del grimorio.</p>';
  }
}

renderCategories();