let allJobs = [];
let currentAdmin = null;
let allApplications = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setCurrentDate();
    loadJobs();
    updateStats();
    loadApplications();
    loadRecentActivity();
    setupEventListeners();
});

function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function setupEventListeners() {
    document.getElementById('addJobForm')?.addEventListener('submit', addJob);
    document.getElementById('searchJobInput')?.addEventListener('keyup', filterJobsTable);
    document.getElementById('filterStatus')?.addEventListener('change', filterApplications);
}

function checkAdminAuth() {
    const saved = localStorage.getItem('jobportal_user');
    if (!saved) {
        window.location.href = '/';
        return;
    }
    currentAdmin = JSON.parse(saved);
    if (currentAdmin.role !== 'admin') {
        window.location.href = '/';
        return;
    }
    document.getElementById('adminName').textContent = currentAdmin.fullName;
    document.getElementById('adminWelcomeName').textContent = currentAdmin.fullName.split(' ')[0];
}

function loadJobs() {
    const saved = localStorage.getItem('jobportal_jobs');
    allJobs = saved ? JSON.parse(saved) : [];
    displayJobsTable();
}

function saveJobs() {
    localStorage.setItem('jobportal_jobs', JSON.stringify(allJobs));
    loadJobs();
    updateStats();
    addActivity('job', `Job list updated`);
}

function displayJobsTable() {
    const tbody = document.getElementById('jobsTable');
    if (!allJobs.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center">No jobs found</td></tr>';
        return;
    }
    tbody.innerHTML = allJobs.map(job => `
        <tr>
            <td>${job.id}</td>
            <td><strong>${escapeHtml(job.title)}</strong></td>
            <td>${escapeHtml(job.company)}</td>
            <td>${job.type}</td>
            <td>${job.location}</td>
            <td>${job.salary}</td>
            <td>
                <span class="status-badge ${job.active !== false ? 'status-active' : 'status-inactive'}">
                    ${job.active !== false ? '✅ Active' : '⭕ Inactive'}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn-warning" onclick="editJob(${job.id})">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteJob(${job.id})">🗑️ Delete</button>
                <button class="btn-${job.active !== false ? 'secondary' : 'success'}" onclick="toggleJobStatus(${job.id})">
                    ${job.active !== false ? '🔴 Deactivate' : '🟢 Activate'}
                </button>
            </td>
        </tr>
    `).join('');
}

function filterJobsTable() {
    const searchTerm = document.getElementById('searchJobInput')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#jobsTable tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function addJob(event) {
    event.preventDefault();
    const newJob = {
        id: Date.now(),
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('company').value,
        type: document.getElementById('jobType').value,
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        tags: document.getElementById('tags').value || '',
        description: document.getElementById('description')?.value || '',
        requirements: document.getElementById('requirements')?.value || '',
        active: true,
        postedDate: new Date().toISOString(),
        postedBy: currentAdmin.id,
        postedByName: currentAdmin.fullName
    };
    allJobs.unshift(newJob);
    saveJobs();
    document.getElementById('addJobForm').reset();
    addActivity('job_add', `Posted new job: ${newJob.title} at ${newJob.company}`);
    showToast('Job posted successfully!', 'success');
}

function editJob(id) {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    
    document.getElementById('editJobId').value = job.id;
    document.getElementById('editTitle').value = job.title;
    document.getElementById('editCompany').value = job.company;
    document.getElementById('editType').value = job.type;
    document.getElementById('editLocation').value = job.location;
    document.getElementById('editSalary').value = job.salary;
    document.getElementById('editTags').value = job.tags || '';
    
    document.getElementById('editModal').classList.add('show');
}

function updateJob(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('editJobId').value);
    const jobIndex = allJobs.findIndex(j => j.id === id);
    
    if (jobIndex !== -1) {
        allJobs[jobIndex] = {
            ...allJobs[jobIndex],
            title: document.getElementById('editTitle').value,
            company: document.getElementById('editCompany').value,
            type: document.getElementById('editType').value,
            location: document.getElementById('editLocation').value,
            salary: document.getElementById('editSalary').value,
            tags: document.getElementById('editTags').value
        };
        saveJobs();
        addActivity('job_edit', `Updated job: ${allJobs[jobIndex].title}`);
        showToast('Job updated successfully!', 'success');
        closeEditModal();
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job?')) {
        const job = allJobs.find(j => j.id === id);
        allJobs = allJobs.filter(j => j.id !== id);
        saveJobs();
        addActivity('job_delete', `Deleted job: ${job?.title} at ${job?.company}`);
        showToast('Job deleted successfully!', 'success');
    }
}

function toggleJobStatus(id) {
    const job = allJobs.find(j => j.id === id);
    if (job) {
        job.active = !job.active;
        saveJobs();
        addActivity('job_status', `${job.active ? 'Activated' : 'Deactivated'} job: ${job.title}`);
        showToast(`Job ${job.active ? 'activated' : 'deactivated'}!`, 'success');
    }
}

function updateStats() {
    const activeJobs = allJobs.filter(job => job.active !== false).length;
    document.getElementById('totalJobs').textContent = allJobs.length;
    document.getElementById('activeJobs').textContent = activeJobs;
    
    const uniqueApplicants = new Set();
    allApplications.forEach(app => uniqueApplicants.add(app.email));
    document.getElementById('totalCandidates').textContent = uniqueApplicants.size;
}

function loadApplications() {
    allApplications = JSON.parse(localStorage.getItem('jobportal_applications') || '[]');
    document.getElementById('totalApps').textContent = allApplications.length;
    filterApplications();
}

function filterApplications() {
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    let filteredApps = allApplications;
    
    if (filterStatus !== 'all') {
        filteredApps = allApplications.filter(app => app.status === filterStatus);
    }
    
    displayApplicationsTable(filteredApps);
}

function displayApplicationsTable(apps) {
    const tbody = document.getElementById('appsTable');
    if (!apps.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No applications found</td></tr>';
        return;
    }
    
    tbody.innerHTML = apps.map(app => {
        let statusClass = '';
        let statusIcon = '';
        switch(app.status) {
            case 'Pending': statusClass = 'status-pending'; statusIcon = '⏳'; break;
            case 'Reviewed': statusClass = 'status-reviewed'; statusIcon = '👀'; break;
            case 'Shortlisted': statusClass = 'status-shortlisted'; statusIcon = '⭐'; break;
            case 'Rejected': statusClass = 'status-rejected'; statusIcon = '❌'; break;
            case 'Hired': statusClass = 'status-hired'; statusIcon = '✅'; break;
            default: statusClass = 'status-pending'; statusIcon = '📌';
        }
        
        return `
            <tr>
                <td><strong>${escapeHtml(app.jobTitle)}</strong></td>
                <td>${escapeHtml(app.applicantName)}</td>
                <td>${escapeHtml(app.email)}</td>
                <td>${new Date(app.appliedDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${app.status}
                    </span>
                </td>
                <td class="action-buttons">
                    <select onchange="updateApplicationStatus(${app.id}, this.value)" class="status-select">
                        <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                        <option value="Reviewed" ${app.status === 'Reviewed' ? 'selected' : ''}>👀 Reviewed</option>
                        <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>⭐ Shortlisted</option>
                        <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>❌ Rejected</option>
                        <option value="Hired" ${app.status === 'Hired' ? 'selected' : ''}>✅ Hired</option>
                    </select>
                    <button class="btn-view" onclick="viewApplicationDetails(${app.id})">📋 View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateApplicationStatus(appId, newStatus) {
    let apps = JSON.parse(localStorage.getItem('jobportal_applications') || '[]');
    const appIndex = apps.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
        const oldStatus = apps[appIndex].status;
        apps[appIndex].status = newStatus;
        apps[appIndex].statusUpdatedDate = new Date().toISOString();
        apps[appIndex].statusUpdatedBy = currentAdmin.fullName;
        localStorage.setItem('jobportal_applications', JSON.stringify(apps));
        
        addActivity('application', `Updated application status for ${apps[appIndex].applicantName} from ${oldStatus} to ${newStatus}`);
        loadApplications();
        showToast(`Status updated to ${newStatus}!`, 'success');
    }
}

function viewApplicationDetails(appId) {
    const app = allApplications.find(a => a.id === appId);
    if (app) {
        const modalHtml = `
            <div id="detailsModal" class="modal show">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-alt"></i> Application Details</h3>
                        <button class="modal-close" onclick="closeDetailsModal()">&times;</button>
                    </div>
                    <div style="padding: 1.2rem;">
                        <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                            <p><strong>📋 Job Title:</strong> ${escapeHtml(app.jobTitle)}</p>
                            <p><strong>🏢 Company:</strong> ${escapeHtml(app.company)}</p>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
                            <p><strong>👤 Applicant:</strong> ${escapeHtml(app.applicantName)}</p>
                            <p><strong>📧 Email:</strong> ${escapeHtml(app.email)}</p>
                            <p><strong>📞 Phone:</strong> ${app.phone || 'Not provided'}</p>
                            <p><strong>📍 Location:</strong> ${app.currentLocation || 'Not specified'}</p>
                        </div>
                        <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                            <p><strong>💼 Experience:</strong> ${app.experience || 'Not specified'}</p>
                            <p><strong>🎯 Skills:</strong> ${app.skills || 'Not specified'}</p>
                            <p><strong>💰 Current CTC:</strong> ${app.currentCTC || 'Not specified'}</p>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <p><strong>📝 Cover Letter:</strong></p>
                            <p style="background: #f9fafb; padding: 0.8rem; border-radius: 0.5rem;">${app.coverLetter || 'Not provided'}</p>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                            <p><strong>📅 Applied Date:</strong> ${new Date(app.appliedDate).toLocaleString()}</p>
                            <p><strong>📌 Status:</strong> ${app.status}</p>
                            ${app.statusUpdatedDate ? `<p><strong>🔄 Last Updated:</strong> ${new Date(app.statusUpdatedDate).toLocaleString()}</p>` : ''}
                            ${app.statusUpdatedBy ? `<p><strong>👨‍💼 Updated By:</strong> ${app.statusUpdatedBy}</p>` : ''}
                        </div>
                    </div>
                    <div class="modal-footer" style="padding: 1rem; text-align: center; border-top: 1px solid #e5e7eb;">
                        <button class="btn-primary" onclick="closeDetailsModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('detailsModal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.remove();
}

function loadRecentActivity() {
    const activities = JSON.parse(localStorage.getItem('admin_activities') || '[]');
    const activityList = document.getElementById('activityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="activity-item"><i class="fas fa-check-circle"></i><span>No recent activities</span></div>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <i class="fas ${getActivityIcon(activity.type)}"></i>
            <div>
                <strong>${activity.message}</strong>
                <div style="font-size: 0.7rem; color: #6b7280;">${new Date(activity.timestamp).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

function getActivityIcon(type) {
    switch(type) {
        case 'job_add': return 'fa-plus-circle';
        case 'job_edit': return 'fa-edit';
        case 'job_delete': return 'fa-trash';
        case 'job_status': return 'fa-toggle-on';
        case 'application': return 'fa-file-alt';
        default: return 'fa-bell';
    }
}

function addActivity(type, message) {
    let activities = JSON.parse(localStorage.getItem('admin_activities') || '[]');
    activities.unshift({
        id: Date.now(),
        type: type,
        message: message,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 activities
    activities = activities.slice(0, 50);
    localStorage.setItem('admin_activities', JSON.stringify(activities));
    loadRecentActivity();
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function logout() {
    localStorage.removeItem('jobportal_user');
    window.location.href = '/';
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .status-active {
        background: #d1fae5;
        color: #059669;
    }
    .status-inactive {
        background: #fee2e2;
        color: #dc2626;
    }
    .btn-secondary {
        background: #6b7280;
        color: white;
    }
    .btn-success {
        background: #10b981;
        color: white;
    }
`;
document.head.appendChild(style);

// Make functions global for HTML onclick
window.editJob = editJob;
window.deleteJob = deleteJob;
window.toggleJobStatus = toggleJobStatus;
window.updateApplicationStatus = updateApplicationStatus;
window.viewApplicationDetails = viewApplicationDetails;
window.showTab = showTab;
window.logout = logout;
window.closeEditModal = closeEditModal;
window.closeDetailsModal = closeDetailsModal;
window.updateJob = updateJob;
window.filterApplications = filterApplications;

// Add form submission handler
document.getElementById('editJobForm')?.addEventListener('submit', updateJob);