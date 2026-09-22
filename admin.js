// admin.js - TechYatri Admin Dashboard Logic
// Powered by Firebase Realtime Database (via firebase-config.js)

// Set Project ID in dashboard UI if element exists
document.addEventListener('DOMContentLoaded', () => {
    const projEl = document.getElementById('currentFirebaseProjectId');
    if (projEl && window.firebaseConfig) {
        projEl.textContent = window.firebaseConfig.projectId || 'Connected';
    }
});

var db = window.db;

// Global State
let allSkills = [];
let allProjects = [];
let allVideos = [];

// DOM Elements
const authOverlay = document.getElementById('authOverlay');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPasscode = document.getElementById('adminPasscode');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const toastContainer = document.getElementById('toastContainer');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');

// Init Lifecycle
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initModals();
    initYouTubeAutoDetect();
    initSeedButton();
    setupListeners();
});

// ================= AUTHENTICATION =================
function initAuth() {
    const isAuthed = sessionStorage.getItem('techyatri_admin_auth');
    if (isAuthed === 'true') {
        if (authOverlay) authOverlay.style.display = 'none';
    } else {
        if (authOverlay) authOverlay.style.display = 'flex';
    }

    function handleLoginSubmit(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const code = (adminPasscode ? adminPasscode.value : '').trim();
        const normalized = code.toLowerCase();
        
        // Accepted passcodes: admin123, admin, TechYatri2026
        if (normalized === 'admin123' || normalized === 'admin' || code === 'TechYatri2026') {
            sessionStorage.setItem('techyatri_admin_auth', 'true');
            if (authOverlay) authOverlay.style.display = 'none';
            if (loginError) loginError.style.display = 'none';
            if (adminPasscode) adminPasscode.value = '';
            showToast('Welcome to TechYatri Admin Portal!', 'success');
        } else {
            if (loginError) loginError.style.display = 'block';
            if (adminPasscode) adminPasscode.focus();
        }
        return false;
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleLoginSubmit);
    }
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLoginSubmit);
    }

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('techyatri_admin_auth');
        authOverlay.style.display = 'flex';
        showToast('Logged out of admin portal.', 'info');
    });
}

// ================= NAVIGATION & TABS =================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const sections = document.querySelectorAll('.admin-section');
    const pageHeading = document.getElementById('pageHeading');

    function switchTab(tabId) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabId);
        });

        sections.forEach(sec => {
            sec.classList.remove('active');
        });

        const targetSection = document.getElementById(`${tabId}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const titles = {
            overview: 'Dashboard Overview',
            skills: 'Manage Skills & Tech Stack',
            projects: 'Manage Projects Portfolio',
            videos: 'Manage Videos & Tutorials'
        };
        pageHeading.textContent = titles[tabId] || 'Admin Dashboard';

        // Close sidebar on mobile after click
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.dataset.tab;
            switchTab(tabId);
        });
    });

    document.querySelectorAll('.nav-link-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(trigger.dataset.tab);
        });
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Quick Action shortcuts on Overview
    document.getElementById('quickAddSkillBtn').addEventListener('click', () => openModal('skillModal'));
    document.getElementById('quickAddProjectBtn').addEventListener('click', () => openModal('projectModal'));
    document.getElementById('quickAddVideoBtn').addEventListener('click', () => openModal('videoModal'));
    document.getElementById('openAddSkillModal').addEventListener('click', () => openModal('skillModal'));
    document.getElementById('openAddProjectModal').addEventListener('click', () => openModal('projectModal'));
    document.getElementById('openAddVideoModal').addEventListener('click', () => openModal('videoModal'));

    // Range slider progress feedback
    const skillProgress = document.getElementById('skillProgress');
    const skillProgressValue = document.getElementById('skillProgressValue');
    if (skillProgress && skillProgressValue) {
        skillProgress.addEventListener('input', () => {
            skillProgressValue.textContent = skillProgress.value;
        });
    }
}

// ================= MODALS SYSTEM =================
function initModals() {
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.close;
            closeModal(modalId);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function openModal(modalId, isEdit = false) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (!isEdit) {
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
        const hiddenId = modal.querySelector('input[type="hidden"]');
        if (hiddenId) hiddenId.value = '';

        if (modalId === 'skillModal') {
            document.getElementById('skillModalTitle').textContent = 'Add New Skill';
            document.getElementById('skillProgressValue').textContent = '85';
            document.getElementById('skillProgress').value = 85;
        } else if (modalId === 'projectModal') {
            document.getElementById('projectModalTitle').textContent = 'Add New Project';
        } else if (modalId === 'videoModal') {
            document.getElementById('videoModalTitle').textContent = 'Add New Video Link';
            document.getElementById('videoPreviewContainer').style.display = 'none';
        }
    }
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ================= REALTIME DATABASE LISTENERS =================
function setupListeners() {
    if (!db) {
        console.error("Database adapter not initialized.");
        return;
    }

    // 1. Skills / Tech Stack Listener
    db.collection('techStack').onSnapshot(snapshot => {
        allSkills = [];
        snapshot.forEach(doc => {
            allSkills.push({ id: doc.id, ...doc.data() });
        });
        document.getElementById('statsSkillsCount').textContent = allSkills.length;
        renderSkillsTable(allSkills);
    }, err => {
        console.error("Realtime Database skills error:", err);
        showToast('Database sync error: ' + (err.message || 'Permission denied. Check Realtime Database rules.'), 'error');
    });

    // 2. Projects Listener
    db.collection('projects').onSnapshot(snapshot => {
        allProjects = [];
        snapshot.forEach(doc => {
            allProjects.push({ id: doc.id, ...doc.data() });
        });
        document.getElementById('statsProjectsCount').textContent = allProjects.length;
        renderProjectsTable(allProjects);
    }, err => {
        console.error("Realtime Database projects error:", err);
        showToast('Database sync error: ' + (err.message || 'Permission denied. Check Realtime Database rules.'), 'error');
    });

    // 3. Videos Listener
    db.collection('videos').onSnapshot(snapshot => {
        allVideos = [];
        snapshot.forEach(doc => {
            allVideos.push({ id: doc.id, ...doc.data() });
        });
        document.getElementById('statsVideosCount').textContent = allVideos.length;
        renderVideosTable(allVideos);
    }, err => {
        console.error("Realtime Database videos error:", err);
        showToast('Database sync error: ' + (err.message || 'Permission denied. Check Realtime Database rules.'), 'error');
    });

    // Search filters
    document.getElementById('skillsSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allSkills.filter(s => (s.name || '').toLowerCase().includes(query));
        renderSkillsTable(filtered);
    });

    document.getElementById('projectsSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allProjects.filter(p => 
            (p.title || '').toLowerCase().includes(query) || 
            (typeof p.techStack === 'string' ? p.techStack : (p.techStack || []).join(', ')).toLowerCase().includes(query)
        );
        renderProjectsTable(filtered);
    });

    document.getElementById('videosSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allVideos.filter(v => 
            (v.title || '').toLowerCase().includes(query) || 
            (v.category || '').toLowerCase().includes(query)
        );
        renderVideosTable(filtered);
    });

    // Form Submissions
    document.getElementById('skillForm').addEventListener('submit', handleSkillSubmit);
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    document.getElementById('videoForm').addEventListener('submit', handleVideoSubmit);
}

// ================= SKILLS CRUD =================
function renderSkillsTable(skills) {
    const tbody = document.getElementById('skillsTableBody');
    if (!skills.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><i class="fas fa-laptop-code"></i><p>No skills found. Click "Add Skill" or "Seed Default Data" above.</p></td></tr>`;
        return;
    }

    tbody.innerHTML = skills.map(skill => `
        <tr>
            <td>
                <div class="icon-preview-box">
                    <img src="${skill.icon || 'icons/python.svg'}" alt="${skill.name}" onerror="this.src='icons/python.svg'">
                </div>
            </td>
            <td>
                <strong style="color: var(--gray-900);">${skill.name || 'Untitled'}</strong>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="flex: 1; height: 8px; background: var(--gray-200); border-radius: 999px; overflow: hidden;">
                        <div style="width: ${skill.progress || 80}%; height: 100%; background: var(--primary);"></div>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 600; min-width: 38px;">${skill.progress || 80}%</span>
                </div>
            </td>
            <td>
                <button class="action-btn action-edit" onclick="editSkill('${skill.id}')" title="Edit">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn action-delete" onclick="deleteSkill('${skill.id}', '${encodeURIComponent(skill.name || 'Skill')}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleSkillSubmit(e) {
    e.preventDefault();
    const docId = document.getElementById('skillDocId').value;
    const name = document.getElementById('skillName').value.trim();
    const icon = document.getElementById('skillIcon').value.trim() || 'icons/python.svg';
    const progress = parseInt(document.getElementById('skillProgress').value, 10) || 85;

    const data = {
        name,
        icon,
        progress,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (docId) {
            await db.collection('techStack').doc(docId).update(data);
            showToast(`Skill "${name}" updated successfully!`, 'success');
        } else {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('techStack').add(data);
            showToast(`Skill "${name}" added successfully!`, 'success');
        }
        closeModal('skillModal');
    } catch (err) {
        console.error('Error saving skill:', err);
        showToast('Error saving skill: ' + err.message, 'error');
    }
}

window.editSkill = function(id) {
    const skill = allSkills.find(s => s.id === id);
    if (!skill) return;

    document.getElementById('skillDocId').value = skill.id;
    document.getElementById('skillName').value = skill.name || '';
    document.getElementById('skillIcon').value = skill.icon || '';
    document.getElementById('skillProgress').value = skill.progress || 85;
    document.getElementById('skillProgressValue').textContent = skill.progress || 85;
    document.getElementById('skillModalTitle').textContent = 'Edit Skill';

    openModal('skillModal', true);
};

window.deleteSkill = async function(id, encodedName) {
    const name = decodeURIComponent(encodedName);
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
        await db.collection('techStack').doc(id).delete();
        showToast(`Skill "${name}" deleted.`, 'info');
    } catch (err) {
        console.error('Error deleting skill:', err);
        showToast('Error deleting skill: ' + err.message, 'error');
    }
};

// ================= PROJECTS CRUD =================
function renderProjectsTable(projects) {
    const tbody = document.getElementById('projectsTableBody');
    if (!projects.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><i class="fas fa-folder-open"></i><p>No projects found. Click "Add Project" or "Seed Default Data" above.</p></td></tr>`;
        return;
    }

    tbody.innerHTML = projects.map(project => {
        let tags = [];
        if (Array.isArray(project.techStack)) {
            tags = project.techStack;
        } else if (typeof project.techStack === 'string') {
            tags = project.techStack.split(',').map(s => s.trim()).filter(Boolean);
        }

        const imgUrl = project.image || 'images/password_manager.jpeg';

        return `
        <tr>
            <td>
                <img src="${imgUrl}" alt="${project.title}" class="table-img" onerror="this.src='images/password_manager.jpeg'">
            </td>
            <td>
                <strong style="color: var(--gray-900); display: block;">${project.title || 'Untitled'}</strong>
                <span style="font-size: 0.8rem; color: var(--gray-500); display: block; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${project.description || ''}
                </span>
            </td>
            <td>
                <div>
                    ${tags.map(t => `<span class="tech-tag-chip">${t}</span>`).join('')}
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    ${project.tutorialLink ? `<a href="${project.tutorialLink}" target="_blank" class="action-btn" style="background:#fee2e2; color:#dc2626;" title="Tutorial"><i class="fas fa-video"></i></a>` : ''}
                    ${project.codeLink ? `<a href="${project.codeLink}" target="_blank" class="action-btn" style="background:var(--gray-200); color:var(--gray-800);" title="GitHub Code"><i class="fab fa-github"></i></a>` : ''}
                </div>
            </td>
            <td>
                <button class="action-btn action-edit" onclick="editProject('${project.id}')" title="Edit">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn action-delete" onclick="deleteProject('${project.id}', '${encodeURIComponent(project.title || 'Project')}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const docId = document.getElementById('projectDocId').value;
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const image = document.getElementById('projectImage').value.trim() || 'images/password_manager.jpeg';
    const techStackInput = document.getElementById('projectTechStack').value.trim();
    const tutorialLink = document.getElementById('projectTutorialLink').value.trim();
    const codeLink = document.getElementById('projectCodeLink').value.trim();

    const techStack = techStackInput.split(',').map(s => s.trim()).filter(Boolean);

    const data = {
        title,
        description,
        image,
        techStack,
        tutorialLink,
        codeLink,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (docId) {
            await db.collection('projects').doc(docId).update(data);
            showToast(`Project "${title}" updated successfully!`, 'success');
        } else {
            data.date = firebase.firestore.FieldValue.serverTimestamp();
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('projects').add(data);
            showToast(`Project "${title}" added successfully!`, 'success');
        }
        closeModal('projectModal');
    } catch (err) {
        console.error('Error saving project:', err);
        showToast('Error saving project: ' + err.message, 'error');
    }
}

window.editProject = function(id) {
    const project = allProjects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('projectDocId').value = project.id;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectImage').value = project.image || '';
    
    let tags = '';
    if (Array.isArray(project.techStack)) {
        tags = project.techStack.join(', ');
    } else {
        tags = project.techStack || '';
    }
    document.getElementById('projectTechStack').value = tags;
    document.getElementById('projectTutorialLink').value = project.tutorialLink || '';
    document.getElementById('projectCodeLink').value = project.codeLink || '';
    document.getElementById('projectModalTitle').textContent = 'Edit Project';

    openModal('projectModal', true);
};

window.deleteProject = async function(id, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
        await db.collection('projects').doc(id).delete();
        showToast(`Project "${title}" deleted.`, 'info');
    } catch (err) {
        console.error('Error deleting project:', err);
        showToast('Error deleting project: ' + err.message, 'error');
    }
};

// ================= VIDEOS CRUD =================
function renderVideosTable(videos) {
    const tbody = document.getElementById('videosTableBody');
    if (!videos.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><i class="fas fa-video"></i><p>No videos found. Click "Add Video Link" or "Seed Default Data" above.</p></td></tr>`;
        return;
    }

    tbody.innerHTML = videos.map(video => `
        <tr>
            <td>
                <img src="${video.thumbnail || 'https://picsum.photos/seed/vid/200/120'}" alt="${video.title}" class="video-table-thumb" onerror="this.src='images/Made with insMind-ChatGPT Image May 17, 2025, 02_01_53 PM.png'">
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.35rem;">
                    <strong style="color: var(--gray-900);">${video.title || 'Untitled Video'}</strong>
                    ${video.isNew ? '<span class="badge badge-primary">New</span>' : ''}
                </div>
                <span style="font-size: 0.75rem; color: var(--gray-400);">Duration: ${video.duration || '0:59'}</span>
            </td>
            <td>
                <span class="badge badge-info">${video.category || 'shorts'}</span>
            </td>
            <td>
                <span style="font-size: 0.85rem; color: var(--gray-600);"><i class="fas fa-eye"></i> ${video.views || '1K'}</span>
            </td>
            <td>
                <a href="${video.url}" target="_blank" class="action-btn" style="background:#fee2e2; color:#dc2626;" title="Open on YouTube">
                    <i class="fab fa-youtube"></i> Watch
                </a>
            </td>
            <td>
                <button class="action-btn action-edit" onclick="editVideo('${video.id}')" title="Edit">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="action-btn action-delete" onclick="deleteVideo('${video.id}', '${encodeURIComponent(video.title || 'Video')}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function handleVideoSubmit(e) {
    e.preventDefault();
    const docId = document.getElementById('videoDocId').value;
    const url = document.getElementById('videoUrl').value.trim();
    const title = document.getElementById('videoTitle').value.trim();
    const category = document.getElementById('videoCategory').value;
    const duration = document.getElementById('videoDuration').value.trim() || '0:59';
    const views = document.getElementById('videoViews').value.trim() || '1.2K';
    let thumbnail = document.getElementById('videoThumbnail').value.trim();
    const isNew = document.getElementById('videoIsNew').checked;

    // If thumbnail is empty, try to auto-extract from YouTube URL
    if (!thumbnail) {
        const ytId = extractYouTubeId(url);
        if (ytId) {
            thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        } else {
            thumbnail = 'images/all_images_from_a_webpage.jpeg';
        }
    }

    const data = {
        url,
        title,
        category,
        duration,
        views,
        thumbnail,
        isNew,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (docId) {
            await db.collection('videos').doc(docId).update(data);
            showToast(`Video "${title}" updated successfully!`, 'success');
        } else {
            data.date = firebase.firestore.FieldValue.serverTimestamp();
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('videos').add(data);
            showToast(`Video "${title}" added successfully!`, 'success');
        }
        closeModal('videoModal');
    } catch (err) {
        console.error('Error saving video:', err);
        showToast('Error saving video: ' + err.message, 'error');
    }
}

window.editVideo = function(id) {
    const video = allVideos.find(v => v.id === id);
    if (!video) return;

    document.getElementById('videoDocId').value = video.id;
    document.getElementById('videoUrl').value = video.url || '';
    document.getElementById('videoTitle').value = video.title || '';
    document.getElementById('videoCategory').value = video.category || 'shorts';
    document.getElementById('videoDuration').value = video.duration || '0:59';
    document.getElementById('videoViews').value = video.views || '1K';
    document.getElementById('videoThumbnail').value = video.thumbnail || '';
    document.getElementById('videoIsNew').checked = !!video.isNew;
    document.getElementById('videoModalTitle').textContent = 'Edit Video';

    // Show preview if valid youtube link
    const ytId = extractYouTubeId(video.url);
    if (ytId) {
        document.getElementById('videoPreviewContainer').style.display = 'flex';
        document.getElementById('videoPreviewThumb').src = video.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        document.getElementById('videoPreviewId').textContent = `Video ID: ${ytId}`;
    } else {
        document.getElementById('videoPreviewContainer').style.display = 'none';
    }

    openModal('videoModal', true);
};

window.deleteVideo = async function(id, encodedTitle) {
    const title = decodeURIComponent(encodedTitle);
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
        await db.collection('videos').doc(id).delete();
        showToast(`Video "${title}" deleted.`, 'info');
    } catch (err) {
        console.error('Error deleting video:', err);
        showToast('Error deleting video: ' + err.message, 'error');
    }
};

// ================= YOUTUBE AUTO DETECT HELPER =================
function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

function initYouTubeAutoDetect() {
    const videoUrlInput = document.getElementById('videoUrl');
    const autoBtn = document.getElementById('autoFetchVideoBtn');
    const previewContainer = document.getElementById('videoPreviewContainer');
    const previewThumb = document.getElementById('videoPreviewThumb');
    const previewId = document.getElementById('videoPreviewId');
    const thumbInput = document.getElementById('videoThumbnail');

    function checkAndPreview() {
        const val = videoUrlInput.value.trim();
        const id = extractYouTubeId(val);
        if (id) {
            const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            previewThumb.src = thumb;
            previewId.textContent = `Detected YouTube ID: ${id}`;
            previewContainer.style.display = 'flex';
            if (!thumbInput.value.trim()) {
                thumbInput.value = thumb;
            }
            // Auto categorize shorts
            if (val.includes('/shorts/')) {
                document.getElementById('videoCategory').value = 'shorts';
                document.getElementById('videoDuration').value = '0:59';
            }
        } else {
            previewContainer.style.display = 'none';
        }
    }

    videoUrlInput.addEventListener('blur', checkAndPreview);
    videoUrlInput.addEventListener('input', () => {
        const id = extractYouTubeId(videoUrlInput.value.trim());
        if (id) checkAndPreview();
    });

    autoBtn.addEventListener('click', () => {
        checkAndPreview();
        showToast('YouTube link parsed and thumbnail fetched!', 'success');
    });
}

// ================= SEED INITIAL DATA =================
function initSeedButton() {
    const seedBtn = document.getElementById('quickSeedBtn');
    if (!seedBtn) return;

    seedBtn.addEventListener('click', async () => {
        if (!confirm('Would you like to seed default website skills, projects, and videos to your Firebase Realtime Database? This will populate the initial items into your database.')) {
            return;
        }

        seedBtn.disabled = true;
        seedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Seeding Data...';

        try {
            // Default Skills
            const defaultSkills = [
                { name: 'Python', progress: 90, icon: 'icons/python.svg' },
                { name: 'JavaScript', progress: 85, icon: 'icons/javascript.svg' },
                { name: 'React', progress: 85, icon: 'icons/physics.png' },
                { name: 'AI & ML', progress: 80, icon: 'icons/python.svg' },
                { name: 'Docker & DevOps', progress: 75, icon: 'icons/javascript.svg' }
            ];

            // Default Projects
            const defaultProjects = [
                {
                    title: '🔐 Secure Password Manager in Python',
                    description: 'Complete guide to build a secure password manager app with encryption.',
                    image: 'images/password_manager.jpeg',
                    techStack: ['Python', 'Selenium', 'Pandas'],
                    tutorialLink: 'https://youtube.com/shorts/tydOVBhDdGw?feature=share',
                    codeLink: 'https://github.com/kumarmohit24011/Password-Manager'
                },
                {
                    title: 'React Firebase Authentication App',
                    description: 'Step-by-step implementation of login/signup with Firebase Auth & Firestore.',
                    image: 'https://picsum.photos/seed/project2/400/250',
                    techStack: ['React', 'JavaScript', 'Firebase'],
                    tutorialLink: 'https://youtube.com/@thetechyatri',
                    codeLink: 'https://github.com/kumarmohit24011'
                },
                {
                    title: 'Machine Learning Model Deployment',
                    description: 'Deploy trained ML classification and prediction models as web apps.',
                    image: 'https://picsum.photos/seed/project3/400/250',
                    techStack: ['Python', 'Machine Learning', 'scikit-learn'],
                    tutorialLink: 'https://youtube.com/@thetechyatri',
                    codeLink: 'https://github.com/kumarmohit24011'
                }
            ];

            // Default Videos
            const defaultVideos = [
                {
                    title: 'Voice Se Note Likho! No Typing Needed 😍 | Day 27 Python App',
                    category: 'shorts',
                    thumbnail: 'https://img.youtube.com/vi/sickTFokwOE/hqdefault.jpg',
                    url: 'https://youtube.com/shorts/sickTFokwOE',
                    duration: '0:59',
                    views: '1K',
                    isNew: true
                },
                {
                    title: 'Apna QR Code Banao Python Se 😎 | 3 Line Trick 🔥 | Day 26',
                    category: 'shorts',
                    thumbnail: 'https://img.youtube.com/vi/f8-zK3q4hGU/hqdefault.jpg',
                    url: 'https://youtube.com/shorts/f8-zK3q4hGU',
                    duration: '0:50',
                    views: '1.2K',
                    isNew: false
                },
                {
                    title: 'Ek Prompt = Puri Website!? 🤯 | Replit AI Agent Magic',
                    category: 'ai',
                    thumbnail: 'https://img.youtube.com/vi/LjWkCuibrps/hqdefault.jpg',
                    url: 'https://youtube.com/shorts/LjWkCuibrps',
                    duration: '0:58',
                    views: '1.5K',
                    isNew: false
                }
            ];

            // Seed if empty
            if (allSkills.length === 0) {
                for (const s of defaultSkills) {
                    await db.collection('techStack').add({
                        ...s,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            if (allProjects.length === 0) {
                for (const p of defaultProjects) {
                    await db.collection('projects').add({
                        ...p,
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            if (allVideos.length === 0) {
                for (const v of defaultVideos) {
                    await db.collection('videos').add({
                        ...v,
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            showToast('Default data seeded successfully!', 'success');
        } catch (err) {
            console.error('Error seeding data:', err);
            showToast('Error seeding: ' + err.message, 'error');
        } finally {
            seedBtn.disabled = false;
            seedBtn.innerHTML = '<i class="fas fa-database"></i> Seed Default Data';
        }
    });
}

// ================= TOAST NOTIFICATIONS =================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}" style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4f46e5'};"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
