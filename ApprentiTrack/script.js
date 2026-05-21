document.addEventListener('DOMContentLoaded', () => {
    // Initialize Mock Data
    // Migration: ensure all evaluations have IDs
    const evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
    let migrated = false;
    evaluations.forEach((e, index) => {
        if (!e.id) {
            e.id = Date.now() + index;
            migrated = true;
        }
    });
    if (migrated) localStorage.setItem('evaluations', JSON.stringify(evaluations));

    populateRecentEvaluations();
    populateApprentices();
    populateEmployers();
    populateAllVisits();
    updateEmployerSelect();

    // Set today's date in form
    const dateInput = document.getElementById('visit-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // Simple mock authentication
            if (user === 'admin' && pass === 'admin123') {
                localStorage.setItem('isLoggedIn', 'true');
                if (loginError) loginError.style.display = 'none';
                if (authOverlay) authOverlay.classList.add('hidden');
            } else {
                if (loginError) loginError.style.display = 'block';
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

// Modal logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.parentElement.classList.add('active');
    }
}

function closeModal() {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => overlay.classList.remove('active'));
}

// Close modal when clicking outside
const overlays = document.querySelectorAll('.modal-overlay');
overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
});

// Form submission mock
function submitForm(event, message = 'Action réalisée avec succès !') {
    event.preventDefault();

    // Extract data if it's the apprenti-form
    let newApprentice = null;
    let newEvaluation = null;
    let newEmployer = null;

    if (event.target.id === 'apprenti-form') {
        const nameInput = event.target.querySelector('input[type="text"]');
        const selects = event.target.querySelectorAll('select');
        newApprentice = {
            name: nameInput.value,
            spec: selects[0].value,
            semester: selects[1].value,
            company: selects[2].value,
            progress: 0
        };
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
        let statusClass = "status-warning";
        if (avgNote >= 8) { status = "Excellent"; statusClass = "status-success"; }
        else if (avgNote < 5) { status = "En difficulté"; statusClass = "status-danger"; }

        let apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
        let targetApp = apprentices.find(a => a.name === apprentiName);

        const textareas = event.target.querySelectorAll('textarea');
        const observations = textareas[0].value;
        const conclusions = textareas[1].value;

        newEvaluation = {
            id: Date.now(), // Unique ID
            name: apprentiName,
            spec: targetApp ? targetApp.spec : "Non spécifié",
            company: targetApp ? targetApp.company : "Non spécifiée",
            date: visitDate,
            semester: semesterValue,
            note: avgNote,
            status: status,
            statusClass: statusClass,
            observations: observations,
            conclusions: conclusions
        };
    } else if (event.target.id === 'employeur-form') {
        const inputs = event.target.querySelectorAll('input');
        newEmployer = {
            name: inputs[0].value,
            sector: inputs[1].value,
            responsible: inputs[2].value,
            phone: inputs[3].value,
            apprentices: 0
        };
    }

    // Simulate saving
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    btn.disabled = true;

    setTimeout(() => {
        if (newApprentice) {
            // Save to localStorage
            let apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
            apprentices.unshift(newApprentice);
            localStorage.setItem('apprentices', JSON.stringify(apprentices));

            appendApprenticeToDOM(newApprentice);
            updateApprenticeSelect();
            populateEmployers(); // Refresh employer list to update counts
        }

        if (newEvaluation) {
            let evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
            evaluations.unshift(newEvaluation);
            localStorage.setItem('evaluations', JSON.stringify(evaluations));

            appendEvaluationToDOM(newEvaluation, false);

            // Mettre à jour la progression de l'apprenti (+20% par visite)
            let apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
            let targetAppIndex = apprentices.findIndex(a => a.name === newEvaluation.name);
            if (targetAppIndex !== -1) {
                apprentices[targetAppIndex].progress = Math.min(100, apprentices[targetAppIndex].progress + 20);
                localStorage.setItem('apprentices', JSON.stringify(apprentices));
                populateApprentices();
            }
            populateAllVisits(); // Refresh history table
        }

        if (newEmployer) {
            let employers = JSON.parse(localStorage.getItem('employers')) || [];
            employers.unshift(newEmployer);
            localStorage.setItem('employers', JSON.stringify(employers));
            appendEmployerToDOM(newEmployer);
            updateEmployerSelect(); // Update the dropdowns when a new employer is added
        }

        closeModal();
        event.target.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;

        // Show a simple alert (could be replaced by a nice toast notification)
        alert(message);
    }, 1000);
}

function appendApprenticeToDOM(app) {
    const tbody = document.getElementById('apprentices-list');
    if (!tbody) return;

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
            <button class="btn-text" style="margin-right: 10px;" onclick="openModal('nouveau-suivi-modal')">Évaluer</button>
            <button class="btn-text" style="color: var(--text-muted); margin-right: 10px;">Profil</button>
            <button class="btn-text" style="color: #ef4444;" onclick="deleteApprentice('${app.name}')"><i class="fas fa-trash"></i></button>
        </td>
    `;
    // Insert at the top
    tbody.insertBefore(tr, tbody.firstChild);

    // Also increment total apprentices stat
    const totalApprentis = document.querySelectorAll('.stat-number')[0];
    if (totalApprentis) {
        totalApprentis.textContent = parseInt(totalApprentis.textContent) + 1;
    }
}

// Mock Data Generators
function populateRecentEvaluations() {
    let evaluations = JSON.parse(localStorage.getItem('evaluations'));

    if (!evaluations) {
        evaluations = [
            { id: 1, name: "Amina Benali", spec: "Développement Web", company: "TechSolutions DZ", date: "2026-04-29", note: 8.5, status: "Excellent", statusClass: "status-success", observations: "Très bonne progression.", conclusions: "Continuer sur cette lancée." },
            { id: 2, name: "Karim Zidane", spec: "Plomberie", company: "BatiPro", date: "2026-04-25", note: 6.0, status: "Moyen", statusClass: "status-warning", observations: "Doit être plus ponctuel.", conclusions: "Point à surveiller lors de la prochaine visite." },
            { id: 3, name: "Sarah Mansouri", spec: "Électricité Auto", company: "AutoDiag", date: "2026-04-22", note: 4.5, status: "En difficulté", statusClass: "status-danger", observations: "Difficultés techniques sur le diagnostic.", conclusions: "Besoin d'un renforcement pratique." },
            { id: 4, name: "Yacine Brahimi", spec: "Horticulture", company: "Pépinière Verte", date: "2026-04-18", note: 9.0, status: "Excellent", statusClass: "status-success", observations: "Excellent travail.", conclusions: "Rien à signaler." },
        ];
        localStorage.setItem('evaluations', JSON.stringify(evaluations));
    }

    const tbody = document.getElementById('recent-evaluations');
    if (!tbody) return;
    tbody.innerHTML = '';

    const totalVisits = document.querySelectorAll('.stat-number')[2];
    if (totalVisits) {
        totalVisits.textContent = evaluations.length;
    }

    evaluations.forEach(evalItem => {
        appendEvaluationToDOM(evalItem, true);
    });
}

function appendEvaluationToDOM(evalItem, appendToEnd = false) {
    const tbody = document.getElementById('recent-evaluations');
    if (!tbody) return;

    const tr = document.createElement('tr');
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
        <td><span class="status-badge ${evalItem.statusClass}">${evalItem.status}</span></td>
        <td>
            <button class="btn-text" onclick="showEvaluationDetails(${evalItem.id || Date.now()})">
                <i class="fas fa-eye"></i> Détails
            </button>
        </td>
    `;

    if (appendToEnd) {
        tbody.appendChild(tr);
    } else {
        tbody.insertBefore(tr, tbody.firstChild);

        const totalVisits = document.querySelectorAll('.stat-number')[2];
        if (totalVisits) {
            totalVisits.textContent = parseInt(totalVisits.textContent) + 1;
        }
    }
}

function populateApprentices() {
    let apprentices = JSON.parse(localStorage.getItem('apprentices'));

    if (!apprentices) {
        apprentices = [
            { name: "Amina Benali", spec: "Développement Web", company: "TechSolutions DZ", progress: 75 },
            { name: "Karim Zidane", spec: "Plomberie", company: "BatiPro", progress: 40 },
            { name: "Sarah Mansouri", spec: "Électricité Auto", company: "AutoDiag", progress: 20 },
            { name: "Yacine Brahimi", spec: "Horticulture", company: "Pépinière Verte", progress: 90 },
            { name: "Lyes Mahrez", spec: "Menuiserie", company: "Bois d'Or", progress: 60 }
        ];
        localStorage.setItem('apprentices', JSON.stringify(apprentices));
    }

    const tbody = document.getElementById('apprentices-list');
    if (!tbody) return;
    tbody.innerHTML = ''; // Clear before populating

    const totalApprentis = document.querySelectorAll('.stat-number')[0];
    if (totalApprentis) {
        totalApprentis.textContent = apprentices.length;
    }

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
            <td><strong>${(typeof translations !== 'undefined' && translations['fr'] && translations['fr'][app.semester]) || app.semester || 'N/A'}</strong></td>
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
                <button class="btn-text" style="margin-right: 10px;" onclick="openModal('nouveau-suivi-modal')">Évaluer</button>
                <button class="btn-text" style="color: var(--text-muted); margin-right: 10px;">Profil</button>
                <button class="btn-text" style="color: #ef4444;" onclick="deleteApprentice('${app.name}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    updateApprenticeSelect(); // Initial population of the select dropdown
}

function updateApprenticeSelect() {
    const select = document.getElementById('select-apprenti-visite');
    if (!select) return;

    // Clear existing options except the first placeholder
    select.innerHTML = '<option value="" disabled selected>Sélectionner un apprenti...</option>';

    let apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
    apprentices.forEach(app => {
        const option = document.createElement('option');
        option.value = app.name;
        option.textContent = `${app.name} - ${app.spec}`;
        select.appendChild(option);
    });
}

function deleteApprentice(name) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'apprenti ${name} ?`)) {
        // 1. Supprimer l'apprenti de la liste
        let apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
        apprentices = apprentices.filter(app => app.name !== name);
        localStorage.setItem('apprentices', JSON.stringify(apprentices));

        // 2. Supprimer toutes les visites associées à cet apprenti
        let evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
        evaluations = evaluations.filter(evalItem => evalItem.name !== name);
        localStorage.setItem('evaluations', JSON.stringify(evaluations));

        // 3. Rafraîchir l'interface complète
        populateApprentices();
        populateRecentEvaluations(); // Mettre à jour le tableau des visites
        updateApprenticeSelect(); // Mettre à jour les listes déroulantes
    }
}

function populateEmployers() {
    let employers = JSON.parse(localStorage.getItem('employers'));

    if (!employers) {
        employers = [
            { name: "TechSolutions DZ", sector: "Informatique", responsible: "M. Ahmed", phone: "0550 11 22 33", apprentices: 12 },
            { name: "BatiPro", sector: "Construction", responsible: "M. Karim", phone: "0550 44 55 66", apprentices: 8 },
            { name: "AutoDiag", sector: "Automobile", responsible: "M. Lyes", phone: "0550 77 88 99", apprentices: 5 },
            { name: "Pépinière Verte", sector: "Agriculture", responsible: "Mme. Sarah", phone: "0550 22 33 44", apprentices: 4 },
            { name: "Bois d'Or", sector: "Menuiserie", responsible: "M. Yacine", phone: "0550 55 66 77", apprentices: 2 }
        ];
        localStorage.setItem('employers', JSON.stringify(employers));
    }

    const tbody = document.getElementById('employers-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    const totalEmployers = document.querySelectorAll('.stat-number')[1];
    if (totalEmployers) {
        totalEmployers.textContent = employers.length;
    }

    employers.forEach(emp => {
        appendEmployerToDOM(emp, true);
    });
}

function appendEmployerToDOM(emp, appendToEnd = false) {
    const tbody = document.getElementById('employers-list');
    if (!tbody) return;

    // Calculer dynamiquement le nombre d'apprentis pour cet employeur
    const apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
    const count = apprentices.filter(a => a.company === emp.name).length;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><strong>${emp.name}</strong></td>
        <td>${emp.sector}</td>
        <td>
            <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 500;">${emp.responsible}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${emp.phone}</span>
            </div>
        </td>
        <td><span class="status-badge status-success">${count} Apprentis</span></td>
        <td>
            <button class="btn-text" style="color: #ef4444;" onclick="deleteEmployer('${emp.name}')"><i class="fas fa-trash"></i></button>
        </td>
    `;

    if (appendToEnd) {
        tbody.appendChild(tr);
    } else {
        tbody.insertBefore(tr, tbody.firstChild);
        const totalEmployers = document.querySelectorAll('.stat-number')[1];
        if (totalEmployers) {
            totalEmployers.textContent = parseInt(totalEmployers.textContent) + 1;
        }
    }
}

function deleteEmployer(name) {
    if (confirm(`Supprimer l'entreprise ${name} ?`)) {
        let employers = JSON.parse(localStorage.getItem('employers')) || [];
        employers = employers.filter(e => e.name !== name);
        localStorage.setItem('employers', JSON.stringify(employers));
        populateEmployers();
        updateEmployerSelect(); // Update the dropdowns when an employer is deleted
    }
}

function updateEmployerSelect() {
    const select = document.getElementById('select-employeur-apprenti');
    if (!select) return;

    // Clear except first option
    select.innerHTML = '<option value="" disabled selected>Sélectionner un employeur...</option>';

    const employers = JSON.parse(localStorage.getItem('employers')) || [];
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
    const apprentices = JSON.parse(localStorage.getItem('apprentices')) || [];
    if (apprentices.length === 0) return;
    
    const data = apprentices.map(a => ({
        "Nom & Prénom": a.name,
        "Spécialité": a.spec,
        "Semestre": (typeof translations !== 'undefined' && translations['fr'] && translations['fr'][a.semester]) || a.semester || 'N/A',
        "Employeur Actuel": a.company,
        "Progression (%)": a.progress + "%"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Apprentis");
}

function exportVisitsSheet(wb) {
    const evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
    if (evaluations.length === 0) return;
    
    const data = evaluations.map(v => ({
        "Date": v.date,
        "Apprenti": v.name,
        "Semestre": (typeof translations !== 'undefined' && translations['fr'] && translations['fr'][v.semester]) || v.semester || 'N/A',
        "Entreprise": v.company,
        "Note (/10)": v.note,
        "Observations": v.observations || '',
        "Conclusions": v.conclusions || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Visites");
}

function exportEmployersSheet(wb) {
    const employers = JSON.parse(localStorage.getItem('employers')) || [];
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

function populateAllVisits() {
    const evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
    const tbody = document.getElementById('all-visits-list');
    if (!tbody) return;

    tbody.innerHTML = '';
    evaluations.forEach(evalItem => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${evalItem.date}</td>
            <td><strong>${evalItem.name}</strong></td>
            <td>${(typeof translations !== 'undefined' && translations['fr'] && translations['fr'][evalItem.semester]) || evalItem.semester || 'N/A'}</td>
            <td>${evalItem.company}</td>
            <td><strong>${evalItem.note}/10</strong></td>
            <td><span class="status-badge ${evalItem.statusClass}">${evalItem.status}</span></td>
            <td>
                <button class="btn-text" style="margin-right: 10px;" onclick="showEvaluationDetails(${evalItem.id})"><i class="fas fa-eye"></i> Détails</button>
                <button class="btn-text" style="color: #ef4444;" onclick="deleteVisit(${evalItem.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showEvaluationDetails(id) {
    const evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
    const evalItem = evaluations.find(e => e.id === id);

    if (evalItem) {
        document.getElementById('detail-obs').textContent = evalItem.observations || "Aucune observation enregistrée.";
        document.getElementById('detail-concl').textContent = evalItem.conclusions || "Aucune conclusion enregistrée.";
        openModal('details-evaluation-modal');
    }
}

function deleteVisit(id) {
    if (confirm("Voulez-vous vraiment supprimer cette évaluation ?")) {
        let evaluations = JSON.parse(localStorage.getItem('evaluations')) || [];
        evaluations = evaluations.filter(e => e.id !== id);
        localStorage.setItem('evaluations', JSON.stringify(evaluations));

        populateAllVisits();
        populateRecentEvaluations(); // Sync dashboard table
    }
}
