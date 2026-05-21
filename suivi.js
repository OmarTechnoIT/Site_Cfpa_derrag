// suivi.js

// --- SYSTÈME DE TRADUCTION ---
let currentLang = localStorage.getItem('site_lang') || 'fr';

function setLanguage(lang) {
    if (typeof translations === 'undefined') return;
    if (!translations[lang]) return;
    
    currentLang = lang;
    localStorage.setItem('site_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = lang;

    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.innerHTML = translations[lang][key];
    });

    // Traduire tous les attributs avec data-i18n-attr
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const attrData = el.getAttribute('data-i18n-attr').split('|');
        const attrName = attrData[0];
        const key = attrData[1];
        if (translations[lang][key]) el.setAttribute(attrName, translations[lang][key]);
    });

    // Rafraîchir les éléments dynamiques qui dépendent de la langue
    refreshDynamicUI();
}

let dbData = {
    apprentices: [],
    employers: [],
    evaluations: [],
    specialties: []
};

async function syncWithDB() {
    try {
        const response = await fetch('api.php?action=get_all_data');
        const result = await response.json();
        if (result.status === 'success') {
            dbData.apprentices = result.data.apprentices.map(a => ({
                id: a.id,
                name: a.name,
                spec: a.spec_name,
                company: a.employer_name,
                progress: parseInt(a.progress),
                semester: a.current_semester
            }));
            dbData.employers = result.data.employers;
            dbData.evaluations = result.data.evaluations.map(e => ({
                id: e.id,
                name: e.apprentice_name,
                spec: e.spec_name,
                company: e.employer_name,
                date: e.visit_date,
                semester: e.semester,
                noteTech: e.note_tech,
                noteComp: e.note_comp,
                note: e.note_avg,
                status: e.status,
                statusKey: e.status === 'Excellent' ? 'status_excellent' : (e.status === 'Moyen' ? 'status_moyen' : 'status_difficulty'),
                statusClass: e.status === 'Excellent' ? 'status-success' : (e.status === 'Moyen' ? 'status-warning' : 'status-danger'),
                observations: e.observations,
                conclusions: e.conclusions
            }));
            refreshDynamicUI();
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
}

function refreshDynamicUI() {
    populateRecentEvaluations();
    populateApprentices();
    populateEmployers();
    populateAllVisits();
    updateApprenticeSelect();
    updateEmployerSelect();
}
    // Initialiser la langue
    setLanguage(currentLang);
    
    // Synchroniser avec la base de données MySQL
    syncWithDB();

    // Événement changement de langue
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }

    // Set today's date in form
    const dateInput = document.getElementById('visit-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Filter logic for visits
    const filterInput = document.getElementById('filter-visits');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            filterVisits(e.target.value);
        });
    }

    // Authentication Logic
    const authOverlay = document.getElementById('auth-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            if (authOverlay) authOverlay.classList.add('hidden');
        } else {
            if (authOverlay) authOverlay.classList.remove('hidden');
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            try {
                const response = await fetch('api.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user, password: pass })
                });
                const result = await response.json();

                if (result.status === 'success') {
                    localStorage.setItem('isLoggedIn', 'true');
                    if (loginError) loginError.style.display = 'none';
                    if (authOverlay) authOverlay.classList.add('hidden');
                } else {
                    if (loginError) {
                        loginError.textContent = result.message || "Identifiants incorrects.";
                        loginError.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("Erreur de connexion au serveur.");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            location.reload(); // Refresh to show login screen
        });
    }

    // Initial auth check
    checkAuth();

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('site_theme') || 'dark'; // Midnight is dark by default
    
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('light-theme');
        if(themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('site_theme', isLight ? 'light' : 'dark');
            themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
});

// Navigation logic - Using event delegation for better reliability
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        e.preventDefault();
        
        // Remove active class from all nav items and content areas
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.content-area').forEach(area => area.classList.remove('active-area'));
        
        // Add active class to clicked item and corresponding content
        navItem.classList.add('active');
        const targetId = navItem.getAttribute('data-target');
        const targetArea = document.getElementById(targetId);
        if (targetArea) {
            targetArea.classList.add('active-area');
        }
    }
});

// Geolocation logic
function captureGPS() {
    const gpsInput = document.getElementById('visit-gps');
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
    }
    
    gpsInput.value = "Captation en cours...";
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            gpsInput.value = `${lat}, ${lng}`;
        },
        (error) => {
            console.error("Erreur GPS:", error);
            gpsInput.value = "Erreur de captation";
            alert("Impossible de récupérer la position GPS. Veuillez vérifier les autorisations de votre navigateur.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Modal logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.parentElement.classList.add('active');
    }
}

function closeModal() {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => overlay.classList.remove('active'));
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Form submission - Connected to PHP API
async function submitForm(event, message = 'Action réalisée avec succès !') {
    event.preventDefault();
    
    let endpoint = '';
    let payload = null;
    let action = '';
    
    if (event.target.id === 'apprenti-form') {
        const nameInput = event.target.querySelector('input[type="text"]');
        const selects = event.target.querySelectorAll('select');
        payload = {
            name: nameInput.value,
            spec: selects[0].value,
            semester: selects[1].value,
            company: selects[2].value,
            progress: 0
        };
        action = 'save_apprentice';
    } else if (event.target.id === 'suivi-form') {
        const selects = event.target.querySelectorAll('select');
        const apprentiName = selects[0].value;
        const semesterValue = selects[1].value;
        const inputs = event.target.querySelectorAll('input');
        const visitDate = inputs[0].value;
        const noteTech = parseFloat(inputs[1].value);
        const noteComp = parseFloat(inputs[2].value);
        const avgNote = ((noteTech + noteComp) / 2).toFixed(1);
        
        let status = "Moyen";
        if (avgNote >= 8) status = "Excellent";
        else if (avgNote < 5) status = "En difficulté";

        const textareas = event.target.querySelectorAll('textarea');
        const observations = textareas[0].value;
        const conclusions = textareas[1].value;

        payload = {
            name: apprentiName,
            date: visitDate,
            semester: semesterValue,
            noteTech: noteTech,
            noteComp: noteComp,
            note: avgNote,
            status: status,
            observations: observations,
            conclusions: conclusions
        };
        action = 'save_evaluation';
    } else if (event.target.id === 'employeur-form') {
        const inputs = event.target.querySelectorAll('input');
        payload = {
            name: inputs[0].value,
            sector: inputs[1].value,
            responsible: inputs[2].value,
            phone: inputs[3].value
        };
        action = 'save_employer';
    }

    if (!payload) return;

    // UI Feedback
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const response = await fetch(`api.php?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            await syncWithDB();
            closeModal();
            event.target.reset();
            const successMsg = currentLang === 'fr' ? "Succès !" : (currentLang === 'ar' ? "تم بنجاح !" : "Success!");
            alert(successMsg);
        } else {
            alert("Erreur: " + result.message);
        }
    } catch (error) {
        console.error("Submission error:", error);
        alert("Erreur lors de la sauvegarde.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function populateRecentEvaluations() {
    const evaluations = dbData.evaluations;

    const tbody = document.getElementById('recent-evaluations');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const statsNumbers = document.querySelectorAll('.stat-number');
    if (statsNumbers.length >= 3) {
        statsNumbers[2].textContent = evaluations.length;
    }

    // Show only the 4 most recent on dashboard
    evaluations.slice(0, 4).forEach(evalItem => {
        const tr = document.createElement('tr');
        const statusText = (translations[currentLang] && translations[currentLang][evalItem.statusKey]) || evalItem.status;
        tr.innerHTML = `
            <td>
                <div class="student-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(evalItem.name)}&background=random" alt="${evalItem.name}">
                    <div>
                        <span class="name">${evalItem.name}</span>
                        <span class="spec">${evalItem.spec}</span>
                    </div>
                </div>
            </td>
            <td><i class="fas fa-building" style="color: #9CA3AF; margin-right: 8px;"></i> ${evalItem.company}</td>
            <td>${evalItem.date}</td>
            <td><strong>${evalItem.note}/10</strong></td>
            <td><span class="status-badge ${evalItem.statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-text" onclick="showEvaluationDetails(${evalItem.id})"><i class="fas fa-eye"></i> Détails</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateAllVisits() {
    const evaluations = dbData.evaluations;
    const tbody = document.getElementById('all-visits-list');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Update stats
    const totalVisitsCount = document.getElementById('total-visits-count');
    const averageScore = document.getElementById('average-score');
    const evaluatedApprenticesCount = document.getElementById('evaluated-apprentices-count');

    if (totalVisitsCount) totalVisitsCount.textContent = evaluations.length;
    
    if (evaluations.length > 0) {
        const sum = evaluations.reduce((acc, curr) => acc + parseFloat(curr.note), 0);
        if (averageScore) averageScore.textContent = `${(sum / evaluations.length).toFixed(1)}/10`;
        
        const uniqueApprentices = new Set(evaluations.map(e => e.name));
        if (evaluatedApprenticesCount) evaluatedApprenticesCount.textContent = uniqueApprentices.size;
    }

        evaluations.forEach(evalItem => {
            const tr = document.createElement('tr');
            const statusText = (translations[currentLang] && translations[currentLang][evalItem.statusKey]) || evalItem.status;
            const semesterText = (translations[currentLang] && translations[currentLang][evalItem.semester]) || evalItem.semester || 'N/A';
            tr.innerHTML = `
                <td>${evalItem.date}</td>
                <td>
                    <div class="student-info">
                        <span class="name">${evalItem.name}</span>
                    </div>
                </td>
                <td><strong>${semesterText}</strong></td>
                <td>${evalItem.company}</td>
                <td><span class="status-badge" style="background: rgba(79, 70, 229, 0.1); color: var(--primary-color);">${evalItem.noteTech || 'N/A'}/10</span></td>
                <td><span class="status-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--secondary-color);">${evalItem.noteComp || 'N/A'}/10</span></td>
                <td><span class="status-badge ${evalItem.statusClass}">${evalItem.note}/10</span></td>
                <td>
                    <button class="btn-text" style="margin-right: 10px;" onclick="showEvaluationDetails(${evalItem.id})"><i class="fas fa-eye"></i> Détails</button>
                    <button class="btn-text" style="color: #ef4444;" onclick="deleteVisit(${evalItem.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

function filterVisits(query) {
    const rows = document.querySelectorAll('#all-visits-list tr');
    const lowerQuery = query.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(lowerQuery) ? '' : 'none';
    });
}

async function deleteVisit(id) {
    const confirmMsg = currentLang === 'fr' ? "Supprimer cette évaluation ?" : (currentLang === 'ar' ? "حذف هذا التقييم؟" : "Delete this evaluation?");
    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`api.php?action=delete_visit&id=${id}`);
            const result = await response.json();
            if (result.status === 'success') {
                await syncWithDB();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    }
}

function populateApprentices() {
    const apprentices = dbData.apprentices;

    const tbody = document.getElementById('apprentices-list');
    if(!tbody) return;
    tbody.innerHTML = '';

    const statsNumbers = document.querySelectorAll('.stat-number');
    if (statsNumbers.length >= 1) {
        statsNumbers[0].textContent = apprentices.length;
    }

    const evalBtnText = (translations[currentLang] && translations[currentLang].btn_new_visit) || "Évaluer";

    apprentices.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="student-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=random" alt="${app.name}">
                    <div>
                        <span class="name">${app.name}</span>
                        <span class="spec">${app.spec}</span>
                    </div>
                </div>
            </td>
            <td>${app.spec}</td>
            <td><strong>${(translations[currentLang] && translations[currentLang][app.semester]) || app.semester || 'N/A'}</strong></td>
            <td>${app.company}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="flex: 1; height: 8px; background: #E5E7EB; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${app.progress}%; height: 100%; background: var(--primary-color);"></div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 600;">${app.progress}%</span>
                </div>
            </td>
            <td>
                <button class="btn-text" style="margin-right: 10px;" onclick="openModal('nouveau-suivi-modal')">${evalBtnText}</button>
                <button class="btn-text" style="color: #ef4444;" onclick="deleteApprentice('${app.name}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateApprenticeSelect() {
    const select = document.getElementById('select-apprenti-visite');
    if (!select) return;
    
    const placeholderText = (translations[currentLang] && translations[currentLang].label_evaluated_app) || "Sélectionner un apprenti...";
    select.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;
    
    const apprentices = dbData.apprentices;
    apprentices.forEach(app => {
        const option = document.createElement('option');
        option.value = app.name;
        option.textContent = `${app.name} - ${app.spec}`;
        select.appendChild(option);
    });
}

async function deleteApprentice(name) {
    const confirmMsg = currentLang === 'fr' ? `Supprimer l'apprenti ${name} ?` : `حذف المتدرب ${name}؟`;
    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`api.php?action=delete_apprentice&name=${encodeURIComponent(name)}`);
            const result = await response.json();
            if (result.status === 'success') {
                await syncWithDB();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    }
}

function populateEmployers() {
    const employers = dbData.employers;

    const tbody = document.getElementById('employers-list');
    if(!tbody) return;
    tbody.innerHTML = '';

    const statsNumbers = document.querySelectorAll('.stat-number');
    if (statsNumbers.length >= 2) {
        statsNumbers[1].textContent = employers.length;
    }

    const appText = currentLang === 'fr' ? "Apprentis" : (currentLang === 'ar' ? "متدربين" : "Apprentices");

    employers.forEach(emp => {
        const tr = document.createElement('tr');
        
        // Calculer dynamiquement le nombre d'apprentis
        const apprentices = dbData.apprentices;
        const count = apprentices.filter(a => a.company === emp.name).length;

        tr.innerHTML = `
            <td><strong>${emp.name}</strong></td>
            <td>${emp.sector}</td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 500;">${emp.responsible}</span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${emp.phone}</span>
                </div>
            </td>
            <td><span class="status-badge status-success">${count} ${appText}</span></td>
            <td>
                <button class="btn-text" style="color: #ef4444;" onclick="deleteEmployer('${emp.name}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function deleteEmployer(name) {
    const confirmMsg = currentLang === 'fr' ? `Supprimer l'entreprise ${name} ?` : `حذف الشركة ${name}؟`;
    if (confirm(confirmMsg)) {
        try {
            const response = await fetch(`api.php?action=delete_employer&name=${encodeURIComponent(name)}`);
            const result = await response.json();
            if (result.status === 'success') {
                await syncWithDB();
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    }
}

function updateEmployerSelect() {
    const select = document.getElementById('select-employeur-apprenti');
    if (!select) return;
    
    const placeholderText = (translations[currentLang] && translations[currentLang].label_employer) || "Sélectionner un employeur...";
    select.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;
    
    const employers = dbData.employers;
    employers.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.name;
        option.textContent = emp.name;
        select.appendChild(option);
    });
}

function exportToExcel() {
    console.log("Contextual export started...");
    
    if (typeof XLSX === 'undefined') {
        alert("Erreur: La bibliothèque d'exportation Excel n'est pas chargée. Veuillez vérifier votre connexion internet.");
        return;
    }

    try {
        const activeArea = document.querySelector('.content-area.active-area');
        const areaId = activeArea ? activeArea.id : 'dashboard';
        
        const wb = XLSX.utils.book_new();
        let fileName = "Export";
        const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');

        if (areaId === 'dashboard') {
            // Vue d'ensemble: On exporte tout dans un seul fichier avec plusieurs onglets
            fileName = `Rapport_General_${dateStr}`;
            exportAllSheets(wb);
        } 
        else if (areaId === 'apprentis') {
            fileName = `Liste_Apprentis_${dateStr}`;
            exportApprenticesSheet(wb);
        } 
        else if (areaId === 'employeurs') {
            fileName = `Liste_Employeurs_${dateStr}`;
            exportEmployersSheet(wb);
        } 
        else if (areaId === 'visites') {
            fileName = `Historique_Visites_${dateStr}`;
            exportVisitsSheet(wb);
        }

        if (wb.SheetNames.length === 0) {
            alert("Aucune donnée à exporter dans cette section.");
            return;
        }

        XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
        console.error("Export error:", error);
        alert("Une erreur est survenue lors de l'exportation: " + error.message);
    }
}

function exportAllSheets(wb) {
    exportApprenticesSheet(wb);
    exportVisitsSheet(wb);
    exportEmployersSheet(wb);
}

function exportApprenticesSheet(wb) {
    const apprentices = dbData.apprentices;
    if (apprentices.length === 0) return;
    
    const data = apprentices.map(a => ({
        "Nom & Prénom": a.name,
        "Spécialité": a.spec,
        "Semestre": (translations[currentLang] && translations[currentLang][a.semester]) || a.semester || 'N/A',
        "Employeur Actuel": a.company,
        "Progression (%)": a.progress + "%"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Apprentis");
}

function exportVisitsSheet(wb) {
    const evaluations = dbData.evaluations;
    if (evaluations.length === 0) return;
    
    const data = evaluations.map(v => ({
        "Date": v.date,
        "Apprenti": v.name,
        "Semestre": (translations[currentLang] && translations[currentLang][v.semester]) || v.semester || 'N/A',
        "Entreprise": v.company,
        "Note Technique (/10)": v.noteTech,
        "Comportement (/10)": v.noteComp,
        "Moyenne (/10)": v.note,
        "Observations": v.observations || '',
        "Conclusions": v.conclusions || '',
        "Coordonnées GPS": v.gps || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Visites");
}

function exportEmployersSheet(wb) {
    const employers = dbData.employers;
    if (employers.length === 0) return;
    
    const data = employers.map(e => ({
        "Entreprise": e.name,
        "Secteur": e.sector,
        "Responsable / Tuteur": e.responsible,
        "Téléphone": e.phone,
        "Adresse": e.address
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Employeurs");
}

function showEvaluationDetails(id) {
    const evaluations = dbData.evaluations;
    const evalItem = evaluations.find(e => e.id == id);
    
    if (evalItem) {
        document.getElementById('detail-obs').textContent = evalItem.observations || "Aucune observation enregistrée.";
        document.getElementById('detail-concl').textContent = evalItem.conclusions || "Aucune conclusion enregistrée.";
        
        const gpsEl = document.getElementById('detail-gps');
        if (gpsEl) {
            if (evalItem.gps && evalItem.gps.includes(',')) {
                const coords = evalItem.gps.split(',');
                const lat = parseFloat(coords[0].trim());
                const lng = parseFloat(coords[1].trim());
                gpsEl.innerHTML = `${evalItem.gps} <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="margin-left: 10px; color: #10b981; text-decoration: underline; font-weight: bold;"><i class="fas fa-external-link-alt"></i> Voir sur la carte</a>`;
            } else {
                gpsEl.textContent = "Aucune coordonnée GPS enregistrée pour cette visite.";
            }
        }
        
        openModal('details-evaluation-modal');
    }
}
