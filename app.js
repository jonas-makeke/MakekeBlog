// MakekeBlog Application Logic

// DOM Elements
const articlesContainer = document.getElementById('articles-container');
const articleView = document.getElementById('article-view');
const backBtn = document.getElementById('back-btn');

// Detail View Elements
const viewImage = document.getElementById('view-image');
const viewDate = document.getElementById('view-date');
const viewTitle = document.getElementById('view-title');
const viewBody = document.getElementById('view-body');

const createBtn = document.getElementById('create-btn');
const closeBtn = document.getElementById('close-modal');
const modalOverlay = document.getElementById('modal-overlay');
const postForm = document.getElementById('post-form');
const postTitleInput = document.getElementById('post-title');
const postImageInput = document.getElementById('post-image');
const postContentInput = document.getElementById('post-content');

// State
// We combine static articles (from data.js) and local drafts (localStorage)
// Note: staticArticles is defined in data.js
let localArticles = JSON.parse(localStorage.getItem('makekeblog_articles')) || [];
let allArticles = [];

// Functions

/**
 * Merge and Sort Articles
 */
function refreshArticles() {
    // Combine static and local
    // Map to ensure no duplicates if user added formatting to data.js already
    // We assume staticArticles exists (loaded from data.js)
    const staticList = (typeof staticArticles !== 'undefined') ? staticArticles : [];

    const staticIds = new Set(staticList.map(a => a.id));
    const uniqueLocal = localArticles.filter(a => !staticIds.has(a.id));

    allArticles = [...uniqueLocal, ...staticList];

    // Sort by Date (Descdending - Newest first)
    allArticles.sort((a, b) => b.id - a.id);
}

/**
 * Save local drafts to LocalStorage
 */
function saveLocalArticles() {
    localStorage.setItem('makekeblog_articles', JSON.stringify(localArticles));
}

/**
 * Create HTML for a single article card
 */
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'card';

    const imageUrl = article.image || `https://source.unsplash.com/random/800x600?abstract&sig=${article.id}`;

    // Check if it's a local draft (not in staticArticles)
    const staticList = (typeof staticArticles !== 'undefined') ? staticArticles : [];
    const isDraft = !staticList.find(a => a.id === article.id);
    const draftBadge = isDraft ? '<span style="background:var(--accent); color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; margin-left:8px;">Brouillon (Local)</span>' : '';

    card.innerHTML = `
        <img src="${imageUrl}" alt="${article.title}" class="card-image" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
        <div class="card-content">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="article-date">${article.date}</span>
                ${draftBadge}
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.content.substring(0, 100)}...</p>
            <a href="#" class="read-more" onclick="readArticle(${article.id}); return false;">Lire la suite →</a>
        </div>
    `;
    return card;
}

/**
 * Render all articles to the UI
 */
function renderArticles() {
    refreshArticles();
    articlesContainer.innerHTML = '';
    allArticles.forEach(article => {
        articlesContainer.appendChild(createArticleCard(article));
    });
}

/**
 * Handle new post submission
 */
function handleSubmit(e) {
    e.preventDefault();

    const newArticle = {
        id: Date.now(),
        title: postTitleInput.value,
        image: postImageInput.value || "",
        content: postContentInput.value,
        date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    localArticles.push(newArticle);
    saveLocalArticles();
    renderArticles();
    closeModal();
    postForm.reset();

    // Show the "Export" prompt so user knows how to make it public
    showExportPrompt(newArticle);
}

function showExportPrompt(article) {
    // Generate the code snippet to add to data.js
    const codeSnippet = `
    {
        id: ${article.id},
        title: "${article.title.replace(/"/g, '\\"')}",
        date: "${article.date}",
        image: "${article.image}",
        content: \`${article.content.replace(/`/g, '\\`')}\`
    },`;

    const message = `
    ✅ Article créé en Mode Brouillon !
    
    POUR LE PUBLIER SUR INTERNET (Vercel) :
    1. Copiez le code ci-dessous.
    2. Ouvrez le fichier 'data.js' sur votre ordinateur.
    3. Collez ce code dans la liste 'staticArticles'.
    
    --- CODE À COPIER ---
    ${codeSnippet}
    ---------------------
    `;

    // Using a timeout to allow the modal to close first if needed, or just alert
    setTimeout(() => {
        // Use a simple prompt which allows copying easily
        // Or just log it to console and alert instructions
        console.log("--------------- COPIER CE CODE POUR DATA.JS ---------------");
        console.log(codeSnippet);
        console.log("-----------------------------------------------------------");
        alert("Article ajouté ! Vérifiez la CONSOLE (F12) pour copier le code, ou regardez le fichier 'DEPLOY_VERCEL.md' pour les instructions.");
    }, 500);
}

/**
 * Read article - Navigation Logic
 */
window.readArticle = function (id) {
    const article = allArticles.find(a => a.id === id);
    if (article) {
        // Populate view
        viewTitle.textContent = article.title;
        viewDate.textContent = article.date;
        viewBody.textContent = article.content;

        const imageUrl = article.image || `https://source.unsplash.com/random/800x600?abstract&sig=${article.id}`;
        viewImage.src = imageUrl;

        // Switch views
        articlesContainer.classList.add('hidden');
        document.querySelector('.hero').classList.add('hidden');
        articleView.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
};

/**
 * Back to Home
 */
function showHome() {
    articleView.classList.add('hidden');
    articlesContainer.classList.remove('hidden');
    document.querySelector('.hero').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Event Listeners
createBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    closeModal();
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

backBtn.addEventListener('click', showHome);

function closeModal() {
    modalOverlay.classList.remove('active');
}

postForm.addEventListener('submit', handleSubmit);

// Initial Render
renderArticles();
