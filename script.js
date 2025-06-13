// Variables globales
let grimoire = JSON.parse(localStorage.getItem('grimoire')) || [];
let selectedCategoryIndex = null;
let editing = false;
let currentCategoryIndex = null;
let currentEntryIndex = null;

// --- DICCIONARIO DE TRADUCCIONES AMPLIADO ---
const translations = {
  es: {
    'Nueva categoría': 'Nueva categoría',
    'Borrar todo': 'Borrar todo',
    'Color tapa': 'Color tapa',
    'Bienvenido': 'Bienvenido',
    'Explora las páginas del grimorio.': 'Explora las páginas del grimorio.',
    'Índice': 'Índice',
    'Guardar': 'Guardar',
    'Cancelar': 'Cancelar',
    'Nueva Entrada': 'Nueva Entrada',
    'Nombre de la categoría...': 'Nombre de la categoría...',
    'Título del elemento...': 'Título del elemento...',
    'Añadir nueva entrada...': 'Añadir nueva entrada...',
    'Mostrar más...': 'Mostrar más...',
    'Añadir nueva entrada': 'Añadir nueva entrada',
    'Eliminar categoría': 'Eliminar categoría',
    'Editar nombre de categoría': 'Editar nombre de categoría',
    '¿Seguro que quieres eliminar esta categoría y todas sus entradas?': '¿Seguro que quieres eliminar esta categoría y todas sus entradas?',
    '¿Seguro que quieres eliminar esta entrada?': '¿Seguro que quieres eliminar esta entrada?',
    'El título no puede estar vacío.': 'El título no puede estar vacío.',
    'Página': 'Página',
    'Editar esta entrada': 'Editar esta entrada',
    'Eliminar página': 'Eliminar página',
    'Añadir página': 'Añadir página',
    'Texto de la página': 'Texto de la página',
    'Imagen:': 'Imagen:',
    'Arriba': 'Arriba',
    'Abajo': 'Abajo'
  },
  en: {
    'Nueva categoría': 'New category',
    'Borrar todo': 'Delete all',
    'Color tapa': 'Cover color',
    'Bienvenido': 'Welcome',
    'Explora las páginas del grimorio.': 'Explore the pages of the grimoire.',
    'Índice': 'Index',
    'Guardar': 'Save',
    'Cancelar': 'Cancel',
    'Nueva Entrada': 'New Entry',
    'Nombre de la categoría...': 'Category name...',
    'Título del elemento...': 'Item title...',
    'Añadir nueva entrada...': 'Add new entry...',
    'Mostrar más...': 'Show more...',
    'Añadir nueva entrada': 'Add new entry',
    'Eliminar categoría': 'Delete category',
    'Editar nombre de categoría': 'Edit category name',
    '¿Seguro que quieres eliminar esta categoría y todas sus entradas?': 'Are you sure you want to delete this category and all its entries?',
    '¿Seguro que quieres eliminar esta entrada?': 'Are you sure you want to delete this entry?',
    'El título no puede estar vacío.': 'The title cannot be empty.',
    'Página': 'Page',
    'Editar esta entrada': 'Edit this entry',
    'Eliminar página': 'Delete page',
    'Añadir página': 'Add page',
    'Texto de la página': 'Page text',
    'Imagen:': 'Image:',
    'Arriba': 'Top',
    'Abajo': 'Bottom'
  }
};

/**
 * Función auxiliar para obtener la traducción de una clave.
 * @param {string} key - La clave a traducir.
 * @returns {string} - El texto traducido.
 */
function t(key) {
  const lang = localStorage.getItem('grimorioLang') || 'es';
  return translations[lang][key] || key;
}

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

    const titleSpan = document.createElement('span');
    titleSpan.textContent = `${index + 1}. ${category.title}`;
    titleSpan.className = 'category-title-text';

    const editBtn = document.createElement('span');
    editBtn.className = 'category-edit';
    editBtn.innerHTML = '✏️';
    editBtn.title = t('Editar nombre de categoría');
    editBtn.onclick = (e) => {
        e.stopPropagation();
        editCategoryName(index, titleRow);
    };

    const addBtn = document.createElement('span');
    addBtn.className = 'category-add';
    addBtn.innerHTML = '+';
    addBtn.title = t('Añadir nueva entrada');
    addBtn.onclick = (e) => {
      e.stopPropagation();
      selectedCategoryIndex = index;
      showEntryForm();
    };

    const removeBtn = document.createElement('span');
    removeBtn.className = 'category-remove';
    removeBtn.innerHTML = '–';
    removeBtn.title = t('Eliminar categoría');
    removeBtn.onclick = (e) => removeCategory(index, e);

    const btnGroup = document.createElement('span');
    btnGroup.className = 'category-btn-group';
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(removeBtn);

    titleRow.appendChild(titleSpan);
    titleRow.appendChild(btnGroup);
    titleRow.onclick = () => toggleCategory(index);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'category-content';
    contentDiv.dataset.expanded = 'false';
    contentDiv.style.display = 'block';

    const visibleCount = 1;

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
      showMore.innerText = t('Mostrar más...');
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
    addEntryLink.innerText = `➕ ${t('Añadir nueva entrada...')}`;
    addEntryLink.setAttribute('data-i18n', 'Añadir nueva entrada...');
    addEntryLink.classList.add('add-entry-link');
    addEntryLink.style.display = 'none';
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

function editCategoryName(index, titleRow) {
    const titleSpan = titleRow.querySelector('.category-title-text');
    const btnGroup = titleRow.querySelector('.category-btn-group');
    const currentTitle = grimoire[index].title;

    btnGroup.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'category-title-input';
    input.onclick = (e) => e.stopPropagation();

    const save = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            grimoire[index].title = newTitle;
            saveGrimoire();
        }
        renderCategories();
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            save();
        } else if (e.key === 'Escape') {
            renderCategories();
        }
    });

    input.addEventListener('blur', save);
    titleSpan.replaceWith(input);
    input.focus();
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

  const addEntryLink = content.querySelector('.add-entry-link');
  if (addEntryLink) addEntryLink.style.display = '';
}

function toggleCategory(index) {
  const content = document.getElementsByClassName('category-content')[index];
  const isExpanded = content.dataset.expanded === 'true';
  const hidden = content.querySelectorAll('.hidden-when-collapsed');
  const showMore = content.querySelector('.show-more-wrapper');
  const addEntryLink = content.querySelector('.add-entry-link');

  if (isExpanded) {
    hidden.forEach(e => e.style.display = 'none');
    if (showMore) showMore.style.display = 'block';
    content.dataset.expanded = 'false';
    if (addEntryLink) addEntryLink.style.display = 'none';
  } else {
    hidden.forEach(e => e.style.display = 'block');
    if (showMore) showMore.style.display = 'none';
    content.dataset.expanded = 'true';
    if (addEntryLink) addEntryLink.style.display = '';
  }
}

function showCategoryForm() {
  const overlay = document.getElementById('formOverlayCategory');
  overlay.classList.remove('hidden');
  document.getElementById('categoryTitle').value = '';
}

function hideCategoryForm() {
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
  if (!confirm(t('¿Seguro que quieres eliminar esta categoría y todas sus entradas?'))) return;
  grimoire.splice(index, 1);
  saveGrimoire();
  renderCategories();
}

function showEntryForm(editingPages = null) {
  document.getElementById('formOverlayEntry').classList.remove('hidden');
  if (editingPages) {
    window.editingPages = JSON.parse(JSON.stringify(editingPages));
  } else {
    window.editingPages = [{ text: '', image: null, imagePosition: 'top' }];
    editing = false;
    currentCategoryIndex = null;
    currentEntryIndex = null;
  }
  renderPageEditors();
}

function renderPageEditors() {
  const container = document.getElementById('entryPagesContainer');
  container.innerHTML = '';
  window.editingPages.forEach((page, i) => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'entry-page-editor';

    const posLabel = document.createElement('label');
    posLabel.innerText = t('Imagen:');
    const posSelect = document.createElement('select');
    posSelect.innerHTML = `<option value="top">${t('Arriba')}</option><option value="bottom">${t('Abajo')}</option>`;
    posSelect.value = page.imagePosition || 'top';
    posSelect.onchange = e => { page.imagePosition = e.target.value; };

    const imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => { page.image = ev.target.result; };
        reader.readAsDataURL(file);
      }
    };

    const textarea = document.createElement('textarea');
    textarea.value = page.text;
    textarea.placeholder = `${t('Texto de la página')} ${i + 1}`;
    textarea.oninput = e => { page.text = e.target.value; };

    const delBtn = document.createElement('button');
    delBtn.innerText = t('Eliminar página');
    delBtn.onclick = () => {
      window.editingPages.splice(i, 1);
      renderPageEditors();
    };

    pageDiv.appendChild(textarea);
    pageDiv.appendChild(document.createElement('br'));
    pageDiv.appendChild(posLabel);
    pageDiv.appendChild(posSelect);
    pageDiv.appendChild(imgInput);
    if (page.image) {
      const imgPreview = document.createElement('img');
      imgPreview.src = page.image;
      imgPreview.style.maxWidth = '100px';
      pageDiv.appendChild(imgPreview);
    }
    if (window.editingPages.length > 1) pageDiv.appendChild(delBtn);

    container.appendChild(pageDiv);
  });

  const addBtn = document.createElement('button');
  addBtn.innerText = t('Añadir página');
  addBtn.onclick = () => {
    window.editingPages.push({ text: '', image: null, imagePosition: 'top' });
    renderPageEditors();
  };
  container.appendChild(addBtn);
}

function saveEntry() {
  const title = document.getElementById('entryTitle').value.trim();
  const size = document.getElementById('imageSize')?.value || 'medium';

  if (!title) {
    alert(t('El título no puede estar vacío.'));
    return;
  }

  const pages = window.editingPages.map(page => {
    const content = page.text || '';
    const position = page.imagePosition || 'top';
    const imageTop = position === 'top' ? page.image || '' : '';
    const imageBottom = position === 'bottom' ? page.image || '' : '';
    return { content, imageTop, imageBottom, size };
  });

  if (editing && currentCategoryIndex !== null && currentEntryIndex !== null) {
    const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
    entry.title = title;
    entry.pages = pages;
  } else {
    grimoire[selectedCategoryIndex].entries.push({ title, pages });
    currentCategoryIndex = selectedCategoryIndex;
    currentEntryIndex = grimoire[selectedCategoryIndex].entries.length - 1;
  }

  saveGrimoire();
  renderCategories();
  editing = false;
  hideEntryForm();
  showEntryContent(currentCategoryIndex, currentEntryIndex);
}



function removeEntry(categoryIndex, entryIndex) {
  if (!confirm(t('¿Seguro que quieres eliminar esta entrada?'))) return;
  grimoire[categoryIndex].entries.splice(entryIndex, 1);
  saveGrimoire();
  renderCategories();
  const rightPage = document.getElementById('rightPage');
  rightPage.innerHTML = `<h2 data-i18n="Bienvenido">${t('Bienvenido')}</h2><p data-i18n="Explora las páginas del grimorio.">${t('Explora las páginas del grimorio.')}</p>`;
}

function showEntryContent(categoryIndex, entryIndex) {
  const entry = grimoire[categoryIndex].entries[entryIndex];
  currentCategoryIndex = categoryIndex;
  currentEntryIndex = entryIndex;

  const rightPage = document.getElementById('rightPage');
  rightPage.innerHTML = `<h2>${entry.title}</h2>`;

  const container = document.createElement('div');
  container.className = 'paged-content';
  rightPage.appendChild(container);

  const navigation = document.createElement('div');
  navigation.className = 'page-navigation';
  rightPage.appendChild(navigation);

  const editBtn = document.createElement('button');
  editBtn.innerHTML = '✏️';
  editBtn.className = 'edit-icon-button';
  editBtn.title = t('Editar esta entrada');
  editBtn.onclick = editCurrentEntry;

  function renderPage(index) {
    container.innerHTML = '';
    const page = entry.pages[index];
    const block = document.createElement('div');
    block.className = 'page-content-block';

    if (page.imageTop) {
      const imgTop = document.createElement('img');
      imgTop.src = page.imageTop;
      imgTop.className = 'entry-image ' + (page.size || 'medium');
      block.appendChild(imgTop);
    }

    const paragraph = document.createElement('p');
    paragraph.innerHTML = (page.content || '').replace(/\n/g, '<br>');
    block.appendChild(paragraph);

    if (page.imageBottom) {
      const imgBottom = document.createElement('img');
      imgBottom.src = page.imageBottom;
      imgBottom.className = 'entry-image ' + (page.size || 'medium');
      block.appendChild(imgBottom);
    }

    container.appendChild(block);

    if (!editBtn.parentElement) rightPage.appendChild(editBtn);

    navigation.innerHTML = '';
    if (index > 0) {
      const prev = document.createElement('button');
      prev.textContent = '←';
      prev.onclick = () => renderPage(index - 1);
      navigation.appendChild(prev);
    }

    const label = document.createElement('span');
    label.textContent = `${t('Página')} ${index + 1} / ${entry.pages.length}`;
    navigation.appendChild(label);

    if (index < entry.pages.length - 1) {
      const next = document.createElement('button');
      next.textContent = '→';
      next.onclick = () => renderPage(index + 1);
      navigation.appendChild(next);
    }
  }

  renderPage(0);
}


function editCurrentEntry() {
  if (currentCategoryIndex === null || currentEntryIndex === null) return;

  const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
  document.getElementById('entryTitle').value = entry.title;
  editing = true;

  const convertedPages = entry.pages.map(p => {
    let text = p.content || p.text || '';
    let image = p.imageTop || p.imageBottom || null;
    let imagePosition = p.imageTop ? 'top' : (p.imageBottom ? 'bottom' : 'top');
    let size = p.size || 'medium';

    return { text, image, imagePosition, size };
  });

  showEntryForm(convertedPages);

  // Establecer el tamaño actual en el selector
  const imageSizeField = document.getElementById('imageSize');
  if (imageSizeField && entry.pages[0]?.size) {
    imageSizeField.value = entry.pages[0].size;
  }
}


function resetGrimoire() {
  if (confirm(t('¿Seguro que quieres borrar todo el grimorio?'))) {
    localStorage.removeItem('grimoire');
    grimoire = [];
    renderCategories();
    const rightPage = document.getElementById('rightPage');
    rightPage.innerHTML = `<h2 data-i18n="Bienvenido">${t('Bienvenido')}</h2><p data-i18n="Explora las páginas del grimorio.">${t('Explora las páginas del grimorio.')}</p>`;
  }
}

function hideEntryForm() {
  const overlay = document.getElementById('formOverlayEntry');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

function toggleColorPalette() {
  document.getElementById('colorPalette').classList.toggle('hidden');
  const menuPalette = document.getElementById('colorPaletteMenu');
  if (menuPalette && !menuPalette.classList.contains('hidden')) {
    menuPalette.classList.add('hidden');
  }
}

function toggleColorPaletteMenu() {
  document.getElementById('colorPaletteMenu').classList.toggle('hidden');
  const mainPalette = document.getElementById('colorPalette');
  if (mainPalette && !mainPalette.classList.contains('hidden')) {
    mainPalette.classList.add('hidden');
  }
}

function setBookColor(color) {
  document.querySelector('.book').style.borderColor = color;
  localStorage.setItem('bookBorderColor', color);
  const palette = document.getElementById('colorPalette');
  const menuPalette = document.getElementById('colorPaletteMenu');
  if (palette) palette.classList.add('hidden');
  if (menuPalette) menuPalette.classList.add('hidden');
}

function setLang(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('grimorioLang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) el.textContent = translations[lang][key];
  });

  document.querySelectorAll('[placeholder][data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) el.placeholder = translations[lang][key];
  });

  renderCategories();
  if (currentCategoryIndex !== null && currentEntryIndex !== null) {
      showEntryContent(currentCategoryIndex, currentEntryIndex);
  } else {
      const rightPage = document.getElementById('rightPage');
      rightPage.innerHTML = `<h2 data-i18n="Bienvenido">${t('Bienvenido')}</h2><p data-i18n="Explora las páginas del grimorio.">${t('Explora las páginas del grimorio.')}</p>`;
  }
}

// --- EFECTOS DE TINTA (REINTEGRADOS) ---

const inkCanvas = document.createElement('canvas');
inkCanvas.id = 'inkCanvas';
inkCanvas.style.position = 'fixed';
inkCanvas.style.left = '0';
inkCanvas.style.top = '0';
inkCanvas.style.pointerEvents = 'none';
inkCanvas.style.zIndex = '9998';
document.body.appendChild(inkCanvas);

function resizeInkCanvas() {
  inkCanvas.width = window.innerWidth;
  inkCanvas.height = window.innerHeight;
}
resizeInkCanvas();
window.addEventListener('resize', resizeInkCanvas);

let drawing = false;
let lastX = 0;
let lastY = 0;

document.addEventListener('mousedown', function(e) {
  drawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

document.addEventListener('mouseup', function() {
  drawing = false;
  setTimeout(() => {
    const ctx = inkCanvas.getContext('2d');
    ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
  }, 1000);
});

document.addEventListener('mousemove', function(e) {
  if (!drawing) return;

  const book = document.querySelector('.book');
  const rect = book.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  if (
    x < rect.left || x > rect.right ||
    y < rect.top || y > rect.bottom
  ) {
    return;
  }

  const ctx = inkCanvas.getContext('2d');
  ctx.strokeStyle = '#2d0a0a';
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const dx = x - lastX;
  const dy = y - lastY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.floor(distance / 2));

  for (let i = 1; i <= steps; i++) {
    const x1 = lastX + ((dx * (i - 1)) / steps);
    const y1 = lastY + ((dy * (i - 1)) / steps);
    const x2 = lastX + ((dx * i) / steps);
    const y2 = lastY + ((dy * i) / steps);

    if (
      x1 >= rect.left && x1 <= rect.right &&
      y1 >= rect.top && y1 <= rect.bottom &&
      x2 >= rect.left && x2 <= rect.right &&
      y2 >= rect.top && y2 <= rect.bottom
    ) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  lastX = x;
  lastY = y;
});

document.addEventListener('click', function(e) {
  if (drawing) return;
  createInkBlot(e.clientX, e.clientY);
});

function createInkBlot(x, y) {
  const ink = document.createElement('span');
  ink.className = 'ink-blot';
  const w = 10 + Math.random() * 10;
  const h = 8 + Math.random() * 12;
  ink.style.width = w + 'px';
  ink.style.height = h + 'px';
  ink.style.left = (x - w / 2) + 'px';
  ink.style.top = (y - h / 2) + 'px';
  ink.style.transform = `rotate(${Math.random() * 60 - 30}deg) scale(${0.8 + Math.random() * 0.4})`;
  document.body.appendChild(ink);
  setTimeout(() => ink.remove(), 700);
}

// --- Carga inicial al final ---
window.addEventListener('DOMContentLoaded', () => {
  const color = localStorage.getItem('bookBorderColor');
  if (color) document.querySelector('.book').style.borderColor = color;
  
  const lang = localStorage.getItem('grimorioLang') || 'es';
  setLang(lang);
});