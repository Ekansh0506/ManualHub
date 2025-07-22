
const API_BASE_URL = 'https://manualhub-1.onrender.com';

// Animate brand cards as they appear in viewport
function revealOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const windowHeight = window.innerHeight;
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < windowHeight - 40) {
            el.classList.add('visible');
        }
    });
}

// Add shadow to header on scroll
function toggleHeaderShadow() {
    const header = document.querySelector('header');
    if (window.scrollY > 10) {
        header.style.boxShadow = "0 4px 18px 0 rgba(56,239,125,0.09)";
    } else {
        header.style.boxShadow = "none";
    }
}

// Overlay navigation
function openOverlay(id) {
    document.body.style.overflow = 'hidden';
    document.getElementById(id).classList.add('active');
}
function closeOverlay(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

// Models data
const MODELS_DATA = {
    'Samsung': {
        'Mobiles': [
            "Galaxy S24 Ultra", "Galaxy S25 Ultra", "Galaxy S23 FE", "Galaxy A55", "Galaxy M55",
            "Galaxy Z Fold5", "Galaxy Z Flip5", "Galaxy A35", "Galaxy F55"
        ],
        'Appliances': [
            "WindFree AC", "Curd Maestro Refrigerator", "AddWash Washing Machine", "Smart Oven", "Ecobubble Washing Machine"
        ],
        'Watches': [
            "Galaxy Watch6", "Galaxy Watch6 Classic", "Galaxy Fit3", "Galaxy Watch5 Pro"
        ]
    },
    'Apple': {
        'iPhone': [
            "iPhone 16 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone SE (3rd Gen)"
        ],
        'Macbook': [
            "MacBook Pro M3", "MacBook Air M2", "MacBook Pro M2", "MacBook Air M1"
        ],
        'AirPods': [
            "AirPods Pro (2nd Gen)", "AirPods (3rd Gen)", "AirPods Max"
        ]
    },
    'boAt': {
        'Rockerz': [
            "Rockerz 255 Pro+", "Rockerz 518", "Rockerz 370"
        ],
        'Nirvana': [
            "Nirvana Ion", "Nirvana 751 ANC", "Nirvana 525 ANC"
        ],
        'Watches': [
            "Wave Lite", "Xtend", "Storm Pro"
        ]
    },
    'Xiaomi': {
        'Mobiles': [
            "Redmi Note 13 Pro+", "Redmi Note 13", "Xiaomi 13 Pro", "Redmi 12 5G", "Redmi 13C"
        ],
        'Appliances': [
            "Mi Smart Air Fryer", "Mi Water Purifier", "Robot Vacuum-Mop", "Air Purifier 4"
        ],
        'Watches': [
            "Redmi Watch 3", "Mi Watch Revolve", "Redmi Smart Band Pro"
        ]
    }
};

// Open models overlay (renders model cards with data attributes)
function openModelsOverlay(brand, category) {
    const models = (MODELS_DATA[brand] && MODELS_DATA[brand][category]) || [];
    let html = `
    <button class="close-btn" onclick="closeOverlay('models-page')"><i class="fas fa-times"></i></button>
    <h1>${brand} <span class="accent">${category}</span></h1>
    <p style="margin-bottom: 1.4em;">Explore the latest <b>${category}</b> models from <b>${brand}</b>:</p>
    <div class="models-list">
      ${models.map(model =>
        `<div class="model-card" data-brand="${brand}" data-category="${category}" data-model="${model}">${model}</div>`
    ).join('')}
    </div>
    <div id="manuals-list"></div>
  `;
    document.getElementById('models-content').innerHTML = html;
    openOverlay('models-page');
}

// Show all manuals in an overlay
async function openAllManualsOverlay() {
    let html = `
        <button class="close-btn" onclick="closeOverlay('manuals-page')"><i class="fas fa-times"></i></button>
        <h1><span class="accent">All Manuals</span></h1>
        <div id="all-manuals-list">Loading manuals...</div>
    `;
    document.getElementById('manuals-content').innerHTML = html;
    openOverlay('manuals-page');

    try {
        const res = await fetch(`${API_BASE_URL}/manuals-all`);
        const manuals = await res.json();
        const manualsDiv = document.getElementById('all-manuals-list');
        if (manuals.length === 0) {
            manualsDiv.innerHTML = "<p>No manuals uploaded yet.</p>";
        } else {
            manualsDiv.innerHTML = `<ul>${manuals.map(m =>
                `<li>
                        <b>${m.brand}</b> &raquo; <b>${m.category}</b> &raquo; <b>${m.model}</b> : 
                        <a href="${API_BASE_URL}${m.url}" target="_blank">${m.name}</a>
                    </li>`
            ).join('')}</ul>`;
        }
    } catch (err) {
        document.getElementById('all-manuals-list').innerHTML = `<p style="color:red;">Error loading manuals.</p>`;
    }
}

// MAIN LISTENERS
document.addEventListener('DOMContentLoaded', function () {
    revealOnScroll();
    toggleHeaderShadow();

    // Nav overlays
    document.getElementById('nav-about').addEventListener('click', function (e) {
        e.preventDefault();
        openOverlay('about-page');
    });
    document.getElementById('nav-contact').addEventListener('click', function (e) {
        e.preventDefault();
        openOverlay('contact-page');
    });
    document.getElementById('nav-manuals').addEventListener('click', function (e) {
        e.preventDefault();
        openAllManualsOverlay();
    });

    // Section buttons handler (event delegation)
    document.body.addEventListener('click', function (e) {
        if (e.target.matches('.brand-categories button')) {
            const brand = e.target.getAttribute('data-brand');
            const category = e.target.getAttribute('data-category');
            if (brand && category) {
                openModelsOverlay(brand, category);
            }
        }
    });

    // Model card click handler to fetch and display manuals for that model
    document.body.addEventListener('click', async function (e) {
        if (e.target.classList.contains('model-card')) {
            const brand = e.target.getAttribute('data-brand');
            const category = e.target.getAttribute('data-category');
            const model = e.target.getAttribute('data-model');
            if (brand && category && model) {
                const manualsDiv = document.getElementById('manuals-list');
                manualsDiv.innerHTML = "Loading manuals...";
                try {
                    const res = await fetch(`${API_BASE_URL}/manuals/${encodeURIComponent(brand)}/${encodeURIComponent(category)}/${encodeURIComponent(model)}`);
                    const manuals = await res.json();
                    if (manuals.length === 0) {
                        manualsDiv.innerHTML = "<p>No manuals uploaded for this model.</p>";
                    } else {
                        manualsDiv.innerHTML = "<h3>Available Manuals:</h3><ul>" +
                            manuals.map(m => `<li><a href="${API_BASE_URL}${m.url}" target="_blank">${m.name}</a></li>`).join('') +
                            "</ul>";
                    }
                } catch (err) {
                    manualsDiv.innerHTML = `<p style="color:red;">Error loading manuals.</p>`;
                }
            }
        }
    });

    // Close overlays on ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeOverlay('about-page');
            closeOverlay('contact-page');
            closeOverlay('models-page');
            closeOverlay('manuals-page');
        }
    });

    // Animate scroll
    window.addEventListener('scroll', () => {
        revealOnScroll();
        toggleHeaderShadow();
    });
});
