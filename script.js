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

    const titleSpan = document.createElement('span');
    titleSpan.textContent = `${index + 1}. ${category.title}`;

    // Botón añadir
    const addBtn = document.createElement('span');
    addBtn.className = 'category-add';
    addBtn.innerHTML = '+';
    addBtn.title = 'Añadir nueva entrada';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      selectedCategoryIndex = index;
      showEntryForm();
    };

    // Botón eliminar
    const removeBtn = document.createElement('span');
    removeBtn.className = 'category-remove';
    removeBtn.innerHTML = '–';
    removeBtn.title = 'Eliminar categoría';
    removeBtn.onclick = (e) => removeCategory(index, e);

    // Contenedor para los botones a la derecha
    const btnGroup = document.createElement('span');
    btnGroup.className = 'category-btn-group';
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

    // SOLO se crea el enlace dentro del contenido y se oculta por defecto
    const addEntryLink = document.createElement('a');
    addEntryLink.href = '#';
    addEntryLink.innerText = '➕ Añadir nueva entrada...';
    addEntryLink.classList.add('add-entry-link');
    addEntryLink.style.display = 'none'; // Oculto por defecto
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

  // Mostrar el enlace de añadir entrada solo cuando está expandido
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
    // Ocultar el enlace al plegar
    if (addEntryLink) addEntryLink.style.display = 'none';
  } else {
    hidden.forEach(e => e.style.display = 'block');
    if (showMore) showMore.style.display = 'none';
    content.dataset.expanded = 'true';
    // Mostrar el enlace al desplegar
    if (addEntryLink) addEntryLink.style.display = '';
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
  if (!confirm('¿Seguro que quieres eliminar esta categoría y todas sus entradas?')) return;
  grimoire.splice(index, 1);
  saveGrimoire();
  renderCategories();
}

function showEntryForm(editingPages = null) {
  document.getElementById('formOverlayEntry').classList.remove('hidden');
  // Si es edición, carga las páginas existentes
  if (editingPages) {
    window.editingPages = JSON.parse(JSON.stringify(editingPages));
  } else {
    window.editingPages = [{ text: '', image: null, imagePosition: 'top' }];
    // Si es nueva entrada, asegúrate de que editing sea false y los índices de edición sean null
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

    // Selector de posición de imagen
    const posLabel = document.createElement('label');
    posLabel.innerText = 'Imagen: ';
    const posSelect = document.createElement('select');
    posSelect.innerHTML = `<option value="top">Arriba</option><option value="bottom">Abajo</option>`;
    posSelect.value = page.imagePosition || 'top';
    posSelect.onchange = e => { page.imagePosition = e.target.value; };

    // Imagen
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

    // Texto
    const textarea = document.createElement('textarea');
    textarea.value = page.text;
    textarea.placeholder = `Texto de la página ${i + 1}`;
    textarea.oninput = e => { page.text = e.target.value; };

    // Botón eliminar página
    const delBtn = document.createElement('button');
    delBtn.innerText = 'Eliminar página';
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

  // Botón añadir página
  const addBtn = document.createElement('button');
  addBtn.innerText = 'Añadir página';
  addBtn.onclick = () => {
    window.editingPages.push({ text: '', image: null, imagePosition: 'top' });
    renderPageEditors();
  };
  container.appendChild(addBtn);
}

// Cambia tu formulario HTML para incluir <div id="entryPagesContainer"></div>
// y elimina los campos antiguos de texto e imagen únicos

function saveEntry() {
  const title = document.getElementById('entryTitle').value.trim();
  const pages = window.editingPages;

  if (!title) {
    alert('El título no puede estar vacío.');
    return;
  }

  if (editing && currentCategoryIndex !== null && currentEntryIndex !== null) {
    // Editar entrada existente
    const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
    entry.title = title;
    entry.pages = pages;
  } else {
    // Nueva entrada
    grimoire[selectedCategoryIndex].entries.push({ title, pages });
    // Actualiza los índices para mostrar la nueva entrada
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
  if (!confirm('¿Seguro que quieres eliminar esta entrada?')) return;
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

  const rightPage = document.getElementById('rightPage');
  rightPage.innerHTML = `<h2>${entry.title}</h2>`;

  let currentPage = 0;

  const container = document.createElement('div');
  container.className = 'paged-content';
  rightPage.appendChild(container);

  const navigation = document.createElement('div');
  navigation.className = 'page-navigation';
  rightPage.appendChild(navigation);

  const editBtn = document.createElement('button');
  editBtn.innerHTML = '✏️';
  editBtn.className = 'edit-icon-button';
  editBtn.title = 'Editar esta entrada';
  editBtn.onclick = editCurrentEntry;

  function renderPage(index) {
    container.innerHTML = '';
    const page = entry.pages[index];

    let contenido = '';
    if (page.image && page.imagePosition === 'top') {
      contenido += `<img src="${page.image}" class="entry-image">`;
    }
    contenido += `<p>${page.text.replace(/\n/g, '<br>')}</p>`;
    if (page.image && page.imagePosition === 'bottom') {
      contenido += `<img src="${page.image}" class="entry-image">`;
    }
    container.innerHTML = `<div class="page-content-block">${contenido}</div>`;

    // Muestra SIEMPRE el botón de editar debajo del contenido
    if (!editBtn.parentElement) rightPage.appendChild(editBtn);

    navigation.innerHTML = '';
    if (index > 0) {
      const prev = document.createElement('button');
      prev.textContent = '←';
      prev.onclick = () => renderPage(index - 1);
      navigation.appendChild(prev);
    }

    const label = document.createElement('span');
    label.textContent = `Página ${index + 1} / ${entry.pages.length}`;
    navigation.appendChild(label);

    if (index < entry.pages.length - 1) {
      const next = document.createElement('button');
      next.textContent = '→';
      next.onclick = () => renderPage(index + 1);
      navigation.appendChild(next);
    }
  }

  renderPage(currentPage);
}

function editCurrentEntry() {
  if (currentCategoryIndex === null || currentEntryIndex === null) return;
  const entry = grimoire[currentCategoryIndex].entries[currentEntryIndex];
  document.getElementById('entryTitle').value = entry.title;
  editing = true; // Pon esto ANTES de llamar a showEntryForm
  showEntryForm(entry.pages);
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

function paginateText(text, containerHeight, lineHeight = 20, fontSize = 16) {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.width = '30%';
  tempDiv.style.lineHeight = lineHeight + 'px';
  tempDiv.style.fontSize = fontSize + 'px';
  tempDiv.style.whiteSpace = 'normal';
  tempDiv.style.padding = '10px';
  tempDiv.style.fontFamily = 'MedievalSharp, cursive';
  tempDiv.style.textAlign = 'justify';
  document.body.appendChild(tempDiv);

  const lines = text.split('\n');
  let currentPage = '';
  const pages = [];

  for (let i = 0; i < lines.length; i++) {
    const testPage = currentPage + lines[i] + '\n';
    tempDiv.innerText = testPage;

    if (tempDiv.scrollHeight > containerHeight) {
      pages.push(currentPage.trim());
      currentPage = lines[i] + '\n';
    } else {
      currentPage = testPage;
    }
  }

  if (currentPage.trim() !== '') {
    pages.push(currentPage.trim());
  }

  document.body.removeChild(tempDiv);
  return pages;
}
renderCategories();

function hideEntryForm() {
  const overlay = document.getElementById('formOverlayEntry');
  if (overlay) {
    overlay.classList.add('hidden');
    // NO pongas overlay.style.display = 'none';
    console.log('Formulario de entrada ocultado');
  }
}

// --- TRAZO CONTINUO DE TINTA CON CANVAS ---
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
  // Borra la línea tras un segundo
  setTimeout(() => {
    const ctx = inkCanvas.getContext('2d');
    ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);
  }, 1000);
});

document.addEventListener('mousemove', function(e) {
  if (!drawing) return;

  // Limitar el trazo al área del libro
  const book = document.querySelector('.book');
  const rect = book.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  if (
    x < rect.left || x > rect.right ||
    y < rect.top || y > rect.bottom
  ) {
    return; // No dibujar fuera del libro
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

    // Solo dibuja si ambos puntos están dentro del libro
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

// Evita que la gota salga al soltar el trazo (mouseup)
document.addEventListener('click', function(e) {
  // Evita la mancha al soltar el trazo
  if (drawing) return;
  createInkBlot(e.clientX, e.clientY);
});

function createInkBlot(x, y) {
  const ink = document.createElement('span');
  ink.className = 'ink-blot';
  // Tamaño y forma aleatoria
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