// ============================================
// JOBPORTAL - INDIA & TN FOCUSED (Load from JSON)
// ============================================

let currentUser = null;
let allJobs = [];
let currentStep = 1;
let uploadedResume = null;
let uploadedCoverLetter = null;

// Pre-defined Admin
const ADMIN_USER = {
    id: 1,
    username: 'admin',
    fullName: 'System Admin',
    email: 'admin@jobportal.com',
    role: 'admin',
    password: 'admin123'
};

// Store registered users
let registeredUsers = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRegisteredUsers();
    checkAuthStatus();
    loadCompanies();
    setupFileUploads();
});

// Load registered users from localStorage
function loadRegisteredUsers() {
    const saved = localStorage.getItem('jobportal_users');
    if (saved) {
        registeredUsers = JSON.parse(saved);
    } else {
        registeredUsers = [];
        localStorage.setItem('jobportal_users', JSON.stringify(registeredUsers));
    }
}

// Save registered users
function saveRegisteredUsers() {
    localStorage.setItem('jobportal_users', JSON.stringify(registeredUsers));
}

// ============================================
// LOAD JOBS FROM STORAGE (Admin posted jobs)
// ============================================
function loadJobs() {
    // Load jobs from localStorage (admin posted jobs)
    const savedJobs = localStorage.getItem('jobportal_jobs');
    
    if (savedJobs) {
        allJobs = JSON.parse(savedJobs);
        // Only show active jobs to users
        const activeJobs = allJobs.filter(job => job.active !== false);
        displayJobs(activeJobs);
        updateLiveJobsCount(activeJobs.length);
        console.log('Jobs loaded from localStorage:', activeJobs.length, 'active out of', allJobs.length);
    } else {
        // Fallback to default India/TN jobs
        loadIndiaTNJobs();
    }
}

function updateLiveJobsCount(count) {
    const liveJobsElem = document.getElementById('liveJobs');
    if (liveJobsElem) liveJobsElem.textContent = count || allJobs.filter(job => job.active !== false).length;
}

// INDIA & TAMIL NADU FOCUSED JOBS (Fallback)
function loadIndiaTNJobs() {
    const indiaTNJobs = [
        { id: 1, title: "Senior Full Stack Developer", company: "Zoho Corporation", type: "Full-time", location: "Chennai, Tamil Nadu", salary: "₹18L - ₹28L per annum", tags: "React,Java,Node.js", active: true },
        { id: 2, title: "Frontend Engineer", company: "Freshworks", type: "Hybrid", location: "Chennai, Tamil Nadu", salary: "₹12L - ₹20L per annum", tags: "React,Angular,Vue", active: true },
        { id: 3, title: "Backend Developer - Java", company: "Cognizant", type: "Full-time", location: "Chennai, Tamil Nadu", salary: "₹10L - ₹18L per annum", tags: "Java,Spring Boot,Microservices", active: true },
        { id: 4, title: "DevOps Engineer", company: "PayPal", type: "Full-time", location: "Chennai, Tamil Nadu", salary: "₹15L - ₹25L per annum", tags: "Kubernetes,Docker,AWS", active: true },
        { id: 5, title: "AI/ML Engineer", company: "iOPEX Technologies", type: "Full-time", location: "Chennai, Tamil Nadu", salary: "₹12L - ₹22L per annum", tags: "Python,TensorFlow,ML", active: true }
    ];
    
    allJobs = indiaTNJobs;
    localStorage.setItem('jobportal_jobs', JSON.stringify(allJobs));
    displayJobs(allJobs);
    updateLiveJobsCount(allJobs.length);
    showToast('Jobs loaded successfully!', 'success');
}

function displayJobs(jobs) {
    const container = document.getElementById('jobsContainer');
    if (!container) return;
    
    const activeJobs = jobs.filter(job => job.active !== false);
    
    if (!activeJobs.length) {
        container.innerHTML = '<p style="text-align:center; padding:2rem;">No jobs found</p>';
        return;
    }

    container.innerHTML = activeJobs.map(job => `
        <div class="job-card" onclick="openApplyModal(${job.id})">
            <div class="job-header">
                <h3 class="job-title">${escapeHtml(job.title)}</h3>
                <span class="job-type">${job.type}</span>
            </div>
            <div class="company-info">
                <i class="fas fa-building"></i> ${job.company}
                <i class="fas fa-map-marker-alt"></i> ${job.location}
            </div>
            <div class="salary-info">💰 ${job.salary}</div>
            <div class="tags">
                ${(job.tags || '').split(',').map(t => `<span class="tag">#${t.trim()}</span>`).join('')}
            </div>
            <button class="apply-btn" onclick="event.stopPropagation(); openApplyModal(${job.id})">Apply Now →</button>
        </div>
    `).join('');
}

function searchJobs() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value;
    
    let filtered = allJobs.filter(job => job.active !== false);
    
    if (keyword) {
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(keyword) || 
            job.company.toLowerCase().includes(keyword) ||
            (job.tags && job.tags.toLowerCase().includes(keyword)) ||
            job.location.toLowerCase().includes(keyword)
        );
    }
    if (type !== 'all') {
        filtered = filtered.filter(job => job.type === type);
    }
    displayJobs(filtered);
    showToast(`Found ${filtered.length} jobs`, 'success');
}

// ============================================
// MY APPLICATIONS FUNCTION
// ============================================

function viewMyApplications() {
    if (!currentUser) {
        showToast('Please login to view your applications', 'error');
        return;
    }
    
    const allApplications = JSON.parse(localStorage.getItem('jobportal_applications') || '[]');
    const myApplications = allApplications.filter(app => app.userId === currentUser.id || app.email === currentUser.email);
    
    if (myApplications.length === 0) {
        showToast('You have not applied for any jobs yet', 'info');
        return;
    }
    
    // Create modal to show applications
    let modalHtml = `
        <div id="myApplicationsModal" class="modal" style="display: flex; align-items: center; justify-content: center;">
            <div class="modal-content" style="max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2><i class="fas fa-briefcase"></i> My Applications</h2>
                    <button class="modal-close" onclick="closeMyApplicationsModal()">&times;</button>
                </div>
                <div style="padding: 1rem;">
                    <p style="margin-bottom: 1rem; color: var(--gray-600);">You have applied for <strong>${myApplications.length}</strong> job(s)</p>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--gray-200);">
                                    <th style="padding: 0.75rem; text-align: left;">Job Title</th>
                                    <th style="padding: 0.75rem; text-align: left;">Company</th>
                                    <th style="padding: 0.75rem; text-align: left;">Applied Date</th>
                                    <th style="padding: 0.75rem; text-align: left;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
    `;
    
    myApplications.forEach(app => {
        const appliedDate = new Date(app.appliedDate).toLocaleDateString();
        let statusClass = '';
        let statusIcon = '';
        
        switch(app.status) {
            case 'Pending':
                statusClass = 'status-pending';
                statusIcon = '⏳';
                break;
            case 'Reviewed':
                statusClass = 'status-reviewed';
                statusIcon = '👀';
                break;
            case 'Shortlisted':
                statusClass = 'status-shortlisted';
                statusIcon = '⭐';
                break;
            case 'Rejected':
                statusClass = 'status-rejected';
                statusIcon = '❌';
                break;
            case 'Hired':
                statusClass = 'status-hired';
                statusIcon = '✅';
                break;
            default:
                statusClass = 'status-pending';
                statusIcon = '📌';
        }
        
        modalHtml += `
            <tr style="border-bottom: 1px solid var(--gray-200);">
                <td style="padding: 0.75rem;"><strong>${escapeHtml(app.jobTitle)}</strong></td>
                <td style="padding: 0.75rem;">${escapeHtml(app.company)}</td>
                <td style="padding: 0.75rem;">${appliedDate}</td>
                <td style="padding: 0.75rem;">
                    <span class="${statusClass}" style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 500;">
                        ${statusIcon} ${app.status}
                    </span>
                </td>
            </tr>
        `;
    });
    
    modalHtml += `
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 1rem; text-align: center; border-top: 1px solid var(--gray-200);">
                    <button class="btn-primary" onclick="closeMyApplicationsModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('myApplicationsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeMyApplicationsModal() {
    const modal = document.getElementById('myApplicationsModal');
    if (modal) {
        modal.remove();
    }
}

function updateApplicationCountBadge() {
    if (!currentUser) return;
    
    const allApplications = JSON.parse(localStorage.getItem('jobportal_applications') || '[]');
    const myApplications = allApplications.filter(app => app.userId === currentUser.id || app.email === currentUser.email);
    const count = myApplications.length;
    
    let badge = document.getElementById('appCountBadge');
    const myAppsLink = document.querySelector('a[onclick="viewMyApplications()"]');
    
    if (myAppsLink) {
        if (!badge && count > 0) {
            badge = document.createElement('span');
            badge.id = 'appCountBadge';
            badge.className = 'app-count-badge';
            badge.textContent = count;
            myAppsLink.appendChild(badge);
        } else if (badge && count > 0) {
            badge.textContent = count;
        } else if (badge && count === 0) {
            badge.remove();
        }
    }
}

// ============================================
// MULTI-STEP APPLICATION FORM WITH RESUME UPLOAD
// ============================================

function openApplyModal(jobId) {
    if (!currentUser) {
        showToast('Please login to apply', 'error');
        return;
    }
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;
    
    // Reset form state
    currentStep = 1;
    uploadedResume = null;
    uploadedCoverLetter = null;
    
    // Set job title
    const titleSpan = document.getElementById('applyJobTitle');
    if (titleSpan) titleSpan.textContent = `${job.title} at ${job.company} • ${job.location}`;
    document.getElementById('applyJobId').value = jobId;
    
    // Reset all steps
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    const step1 = document.getElementById('step1');
    if (step1) step1.classList.add('active');
    
    // Reset step indicators
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    // Reset form
    const form = document.getElementById('applicationForm');
    if (form) form.reset();
    
    // Reset file uploads
    const resumePreview = document.getElementById('resumePreview');
    const coverPreview = document.getElementById('coverPreview');
    const resumeContent = document.querySelector('#resumeUploadArea .file-upload-content');
    const coverContent = document.querySelector('#coverUploadArea .file-upload-content');
    
    if (resumePreview) resumePreview.classList.add('hidden');
    if (coverPreview) coverPreview.classList.add('hidden');
    if (resumeContent) resumeContent.style.display = 'block';
    if (coverContent) coverContent.style.display = 'block';
    
    // Reset file inputs
    const resumeFile = document.getElementById('resumeFile');
    const coverFile = document.getElementById('coverFile');
    if (resumeFile) resumeFile.value = '';
    if (coverFile) coverFile.value = '';
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-flex';
    if (submitBtn) submitBtn.style.display = 'none';
    
    // Pre-fill user data
    if (currentUser) {
        const nameParts = (currentUser.fullName || '').split(' ');
        const firstNameField = document.getElementById('firstName');
        const lastNameField = document.getElementById('lastName');
        const emailField = document.getElementById('applicantEmail');
        const skillsField = document.getElementById('skills');
        
        if (firstNameField) firstNameField.value = nameParts[0] || '';
        if (lastNameField) lastNameField.value = nameParts.slice(1).join(' ') || '';
        if (emailField) emailField.value = currentUser.email || '';
        if (skillsField) skillsField.value = currentUser.skills || '';
    }
    
    const modal = document.getElementById('applyModal');
    if (modal) modal.classList.add('show');
}

function closeApplyModal() {
    const modal = document.getElementById('applyModal');
    if (modal) modal.classList.remove('show');
    currentStep = 1;
}

function changeStep(direction) {
    // Validate current step before proceeding
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }
    
    const steps = document.querySelectorAll('.form-step');
    const stepNumbers = document.querySelectorAll('.step');
    
    // Mark current step as completed
    if (stepNumbers[currentStep - 1]) {
        stepNumbers[currentStep - 1].classList.add('completed');
        stepNumbers[currentStep - 1].classList.remove('active');
    }
    
    // Hide current step
    if (steps[currentStep - 1]) {
        steps[currentStep - 1].classList.remove('active');
    }
    
    // Update step
    currentStep += direction;
    
    // Show new step
    if (steps[currentStep - 1]) {
        steps[currentStep - 1].classList.add('active');
    }
    if (stepNumbers[currentStep - 1]) {
        stepNumbers[currentStep - 1].classList.add('active');
    }
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }
    
    if (nextBtn && submitBtn) {
        if (currentStep === 3) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const firstName = document.getElementById('firstName')?.value.trim();
        const lastName = document.getElementById('lastName')?.value.trim();
        const email = document.getElementById('applicantEmail')?.value.trim();
        const phone = document.getElementById('applicantPhone')?.value.trim();
        
        if (!firstName) {
            showToast('Please enter your first name', 'error');
            return false;
        }
        if (!lastName) {
            showToast('Please enter your last name', 'error');
            return false;
        }
        if (!email) {
            showToast('Please enter your email address', 'error');
            return false;
        }
        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        if (!phone) {
            showToast('Please enter your phone number', 'error');
            return false;
        }
    }
    
    if (currentStep === 2) {
        const experience = document.getElementById('experience')?.value;
        const skills = document.getElementById('skills')?.value.trim();
        
        if (!experience) {
            showToast('Please select your experience level', 'error');
            return false;
        }
        if (!skills) {
            showToast('Please enter your skills', 'error');
            return false;
        }
    }
    
    if (currentStep === 3) {
        if (!uploadedResume && !document.getElementById('resumeFile')?.files[0]) {
            showToast('Please upload your resume', 'error');
            return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// File upload handlers
function setupFileUploads() {
    // Resume Upload
    const resumeArea = document.getElementById('resumeUploadArea');
    const resumeInput = document.getElementById('resumeFile');
    
    if (resumeArea) {
        resumeArea.addEventListener('click', () => resumeInput?.click());
        resumeArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            resumeArea.style.borderColor = 'var(--primary)';
        });
        resumeArea.addEventListener('dragleave', () => {
            resumeArea.style.borderColor = 'var(--gray-200)';
        });
        resumeArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleResumeUpload(file);
        });
    }
    
    if (resumeInput) {
        resumeInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleResumeUpload(e.target.files[0]);
        });
    }
    
    // Cover Letter Upload
    const coverArea = document.getElementById('coverUploadArea');
    const coverInput = document.getElementById('coverFile');
    
    if (coverArea) {
        coverArea.addEventListener('click', () => coverInput?.click());
        coverArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            coverArea.style.borderColor = 'var(--primary)';
        });
        coverArea.addEventListener('dragleave', () => {
            coverArea.style.borderColor = 'var(--gray-200)';
        });
        coverArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleCoverUpload(file);
        });
    }
    
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleCoverUpload(e.target.files[0]);
        });
    }
}

function handleResumeUpload(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
        showToast('Please upload PDF or DOC file', 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showToast('File size must be less than 5MB', 'error');
        return false;
    }
    
    uploadedResume = file;
    const preview = document.getElementById('resumePreview');
    const fileName = document.getElementById('resumeFileName');
    const uploadArea = document.getElementById('resumeUploadArea');
    const content = uploadArea?.querySelector('.file-upload-content');
    
    if (fileName) fileName.textContent = file.name;
    if (preview) preview.classList.remove('hidden');
    if (content) content.style.display = 'none';
    
    return true;
}

function removeResume() {
    uploadedResume = null;
    const resumeInput = document.getElementById('resumeFile');
    const preview = document.getElementById('resumePreview');
    const uploadArea = document.getElementById('resumeUploadArea');
    const content = uploadArea?.querySelector('.file-upload-content');
    
    if (resumeInput) resumeInput.value = '';
    if (preview) preview.classList.add('hidden');
    if (content) content.style.display = 'block';
}

function handleCoverUpload(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
        showToast('Please upload PDF or DOC file', 'error');
        return false;
    }
    
    uploadedCoverLetter = file;
    const preview = document.getElementById('coverPreview');
    const fileName = document.getElementById('coverFileName');
    const uploadArea = document.getElementById('coverUploadArea');
    const content = uploadArea?.querySelector('.file-upload-content');
    
    if (fileName) fileName.textContent = file.name;
    if (preview) preview.classList.remove('hidden');
    if (content) content.style.display = 'none';
    
    return true;
}

function removeCoverLetter() {
    uploadedCoverLetter = null;
    const coverInput = document.getElementById('coverFile');
    const preview = document.getElementById('coverPreview');
    const uploadArea = document.getElementById('coverUploadArea');
    const content = uploadArea?.querySelector('.file-upload-content');
    
    if (coverInput) coverInput.value = '';
    if (preview) preview.classList.add('hidden');
    if (content) content.style.display = 'block';
}

function submitApplication(event) {
    event.preventDefault();
    
    const jobId = document.getElementById('applyJobId').value;
    const job = allJobs.find(j => j.id == jobId);
    
    const application = {
        id: Date.now(),
        jobId: jobId,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        fullName: (document.getElementById('firstName')?.value || '') + ' ' + (document.getElementById('lastName')?.value || ''),
        email: document.getElementById('applicantEmail')?.value || '',
        phoneCode: document.getElementById('phoneCode')?.value || '+91',
        phone: document.getElementById('applicantPhone')?.value || '',
        dob: document.getElementById('dob')?.value || '',
        currentLocation: document.getElementById('location')?.value || '',
        
        currentCompany: document.getElementById('currentCompany')?.value || '',
        experience: document.getElementById('experience')?.value || '',
        currentCTC: document.getElementById('currentCTC')?.value || '',
        skills: document.getElementById('skills')?.value || '',
        linkedin: document.getElementById('linkedin')?.value || '',
        portfolio: document.getElementById('portfolio')?.value || '',
        coverLetter: document.getElementById('coverLetter')?.value || '',
        
        resumeName: uploadedResume ? uploadedResume.name : null,
        hasResume: !!uploadedResume,
        
        appliedDate: new Date().toISOString(),
        status: 'Pending',
        userId: currentUser.id,
        userName: currentUser.fullName
    };
    
    let apps = JSON.parse(localStorage.getItem('jobportal_applications') || '[]');
    apps.push(application);
    localStorage.setItem('jobportal_applications', JSON.stringify(apps));
    
    showToast('Application submitted successfully!', 'success');
    closeApplyModal();
    updateApplicationCountBadge();
    
    const form = document.getElementById('applicationForm');
    if (form) form.reset();
    uploadedResume = null;
    uploadedCoverLetter = null;
    currentStep = 1;
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function checkAuthStatus() {
    const saved = localStorage.getItem('jobportal_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        showMainApp();
        updateUIForUser();
        loadJobs();
        updateApplicationCountBadge();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainApp) mainApp.style.display = 'none';
}

function showMainApp() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

function updateUIForUser() {
    const userNameSpan = document.getElementById('mainUserName');
    const adminLink = document.getElementById('adminNavLink');
    
    if (userNameSpan) userNameSpan.textContent = currentUser.fullName;
    
    if (adminLink) {
        if (currentUser.role === 'admin') {
            adminLink.classList.remove('hidden');
        } else {
            adminLink.classList.add('hidden');
        }
    }
}

function switchToRegister() {
    const loginContainer = document.getElementById('loginFormContainer');
    const registerContainer = document.getElementById('registerFormContainer');
    if (loginContainer) loginContainer.classList.remove('active');
    if (registerContainer) registerContainer.classList.add('active');
}

function switchToLogin() {
    const registerContainer = document.getElementById('registerFormContainer');
    const loginContainer = document.getElementById('loginFormContainer');
    if (registerContainer) registerContainer.classList.remove('active');
    if (loginContainer) loginContainer.classList.add('active');
}

function togglePassword(element) {
    const input = element.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        element.classList.remove('fa-eye-slash');
        element.classList.add('fa-eye');
    } else {
        input.type = 'password';
        element.classList.remove('fa-eye');
        element.classList.add('fa-eye-slash');
    }
}

function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (ADMIN_USER.username === username && ADMIN_USER.password === password) {
        currentUser = ADMIN_USER;
        localStorage.setItem('jobportal_user', JSON.stringify(currentUser));
        showToast(`Welcome ${currentUser.fullName}!`, 'success');
        showMainApp();
        updateUIForUser();
        loadJobs();
        loadCompanies();
        updateApplicationCountBadge();
        clearLoginForm();
        return;
    }
    
    const user = registeredUsers.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('jobportal_user', JSON.stringify(currentUser));
        showToast(`Welcome ${currentUser.fullName}!`, 'success');
        showMainApp();
        updateUIForUser();
        loadJobs();
        loadCompanies();
        updateApplicationCountBadge();
        clearLoginForm();
        return;
    }
    
    showToast('Invalid credentials! Admin: admin/admin123 or Register new account', 'error');
}

function clearLoginForm() {
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function registerUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword').value;
    const fullName = document.getElementById('regFullName').value;
    
    if (!fullName || !username || !email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    if (username.toLowerCase() === 'admin') {
        showToast('Cannot register as Admin!', 'error');
        return;
    }
    
    if (registeredUsers.find(u => u.username === username)) {
        showToast('Username already exists!', 'error');
        return;
    }
    
    if (registeredUsers.find(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }

    const newUser = {
        id: Date.now(),
        username: username,
        fullName: fullName,
        email: email,
        phone: document.getElementById('regPhone').value || '',
        skills: document.getElementById('regSkills').value || '',
        role: 'user',
        password: password,
        registeredDate: new Date().toISOString()
    };
    
    registeredUsers.push(newUser);
    saveRegisteredUsers();
    
    showToast('Registration successful! Please login.', 'success');
    
    document.getElementById('regFullName').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regConfirmPassword').value = '';
    document.getElementById('regSkills').value = '';
    
    switchToLogin();
}

function logout() {
    localStorage.removeItem('jobportal_user');
    currentUser = null;
    showLoginScreen();
    showToast('Logged out successfully', 'success');
}

function loadCompanies() {
    const companies = [
        { name: "Zoho", jobs: 156, icon: "fas fa-cloud" },
        { name: "Freshworks", jobs: 98, icon: "fas fa-leaf" },
        { name: "Cognizant", jobs: 245, icon: "fas fa-building" },
        { name: "TCS", jobs: 312, icon: "fas fa-chart-line" },
        { name: "Infosys", jobs: 189, icon: "fas fa-code" },
        { name: "PayPal", jobs: 76, icon: "fab fa-paypal" },
        { name: "Amazon", jobs: 203, icon: "fab fa-amazon" },
        { name: "HCL", jobs: 167, icon: "fas fa-laptop-code" }
    ];
    
    const container = document.getElementById('companiesContainer');
    if (container) {
        container.innerHTML = companies.map(c => `
            <div class="company-card">
                <div class="company-logo"><i class="${c.icon}"></i></div>
                <h4 class="company-name">${c.name}</h4>
                <p class="company-jobs">${c.jobs} open positions</p>
            </div>
        `).join('');
    }
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }
});

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}