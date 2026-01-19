/**
 * Productivity Dashboard
 * A personal task management app that syncs with GitHub
 */

// Configuration - Update these values for your setup
const CONFIG = {
    // GitHub OAuth App credentials (create at https://github.com/settings/developers)
    clientId: 'YOUR_GITHUB_CLIENT_ID',
    // Your GitHub username and repo name where data.json will be stored
    owner: 'SamuelLittle',
    repo: 'productivity-dashboard',
    branch: 'main',
    dataFile: 'data.json',
    // OAuth proxy service (needed because GitHub OAuth requires a backend)
    authProxy: null
};

// App State
let state = {
    user: null,
    token: null,
    data: null,
    currentView: 'today',
    currentProject: null,
    fileSha: null
};

// DOM Elements
const elements = {};

// Initialize DOM elements after page loads
function initElements() {
    Object.assign(elements, {
        authScreen: document.getElementById('auth-screen'),
        dashboard: document.getElementById('dashboard'),
        authBtn: document.getElementById('auth-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        userAvatar: document.getElementById('user-avatar'),
        currentDate: document.getElementById('current-date'),
        exportBtn: document.getElementById('export-btn'),
        loading: document.getElementById('loading'),
        toastContainer: document.getElementById('toast-container'),
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view'),
        // Task modal
        taskModal: document.getElementById('task-modal'),
        taskForm: document.getElementById('task-form'),
        taskModalTitle: document.getElementById('task-modal-title'),
        taskId: document.getElementById('task-id'),
        taskProjectId: document.getElementById('task-project-id'),
        taskParentId: document.getElementById('task-parent-id'),
        taskTitle: document.getElementById('task-title'),
        taskDescription: document.getElementById('task-description'),
        taskProject: document.getElementById('task-project'),
        taskSchedule: document.getElementById('task-schedule'),
        taskCustomDate: document.getElementById('task-custom-date'),
        customDateGroup: document.getElementById('custom-date-group'),
        taskPriority: document.getElementById('task-priority'),
        // Complete modal
        completeModal: document.getElementById('complete-modal'),
        completeForm: document.getElementById('complete-form'),
        completeTaskId: document.getElementById('complete-task-id'),
        completeNotes: document.getElementById('complete-notes'),
        completeLinks: document.getElementById('complete-links'),
        // Project modal
        projectModal: document.getElementById('project-modal'),
        projectForm: document.getElementById('project-form'),
        projectModalTitle: document.getElementById('project-modal-title'),
        projectId: document.getElementById('project-id'),
        projectName: document.getElementById('project-name'),
        projectDescription: document.getElementById('project-description'),
        // Progress modal
        progressModal: document.getElementById('progress-modal'),
        progressForm: document.getElementById('progress-form'),
        progressProjectId: document.getElementById('progress-project-id'),
        progressText: document.getElementById('progress-text'),
        // Export modal
        exportModal: document.getElementById('export-modal'),
        exportForm: document.getElementById('export-form'),
        exportMonth: document.getElementById('export-month'),
        exportFormat: document.getElementById('export-format'),
        // Schedule modal
        scheduleModal: document.getElementById('schedule-modal'),
        scheduleProjectId: document.getElementById('schedule-project-id'),
        scheduleTaskId: document.getElementById('schedule-task-id'),
        scheduleSubtaskId: document.getElementById('schedule-subtask-id'),
        scheduleTaskTitle: document.getElementById('schedule-task-title'),
        scheduleCustomDate: document.getElementById('schedule-custom-date'),
        scheduleCustomBtn: document.getElementById('schedule-custom-btn'),
        scheduleSubtasksOption: document.getElementById('schedule-subtasks-option'),
        scheduleIncludeSubtasks: document.getElementById('schedule-include-subtasks'),
        // View containers
        todayTasks: document.getElementById('today-tasks'),
        todayEmpty: document.getElementById('today-empty'),
        yesterdayTasks: document.getElementById('yesterday-tasks'),
        yesterdayEmpty: document.getElementById('yesterday-empty'),
        scheduledTasks: document.getElementById('scheduled-tasks'),
        scheduledEmpty: document.getElementById('scheduled-empty'),
        projectsList: document.getElementById('projects-list'),
        projectsEmpty: document.getElementById('projects-empty'),
        archiveList: document.getElementById('archive-list'),
        archiveEmpty: document.getElementById('archive-empty'),
        projectDetailTitle: document.getElementById('project-detail-title'),
        projectTasks: document.getElementById('project-tasks'),
        projectProgress: document.getElementById('project-progress')
    });
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShortDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

function getTomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

function getNextWeek() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
}

function showLoading() {
    elements.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Authentication
function initAuth() {
    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');

    if (storedToken && storedUser) {
        state.token = storedToken;
        state.user = JSON.parse(storedUser);
        showDashboard();
        loadData();
    }
}

function handleLogin() {
    const token = prompt(
        'Enter your GitHub Personal Access Token:\n\n' +
        'Create one at: https://github.com/settings/tokens\n' +
        'Required scopes: repo\n\n' +
        'Your token is stored locally and only used to access your repository.'
    );

    if (token) {
        validateToken(token);
    }
}

async function validateToken(token) {
    showLoading();
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: { Authorization: `token ${token}` }
        });

        if (response.ok) {
            state.token = token;
            state.user = await response.json();
            localStorage.setItem('github_token', token);
            localStorage.setItem('github_user', JSON.stringify(state.user));
            showDashboard();
            loadData();
            showToast('Successfully connected to GitHub', 'success');
        } else {
            showToast('Invalid token', 'error');
        }
    } catch (error) {
        console.error('Token validation error:', error);
        showToast('Failed to validate token', 'error');
    }
    hideLoading();
}

function handleLogout() {
    state.token = null;
    state.user = null;
    state.data = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    elements.dashboard.classList.add('hidden');
    elements.authScreen.classList.remove('hidden');
    showToast('Logged out successfully');
}

function showDashboard() {
    elements.authScreen.classList.add('hidden');
    elements.dashboard.classList.remove('hidden');
    elements.userAvatar.src = state.user.avatar_url;
    elements.currentDate.textContent = formatDate(new Date());

    const now = new Date();
    elements.exportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Data Management
async function loadData() {
    showLoading();
    try {
        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.dataFile}?ref=${CONFIG.branch}`,
            {
                headers: { Authorization: `token ${state.token}` }
            }
        );

        if (response.ok) {
            const fileData = await response.json();
            state.fileSha = fileData.sha;
            const content = atob(fileData.content);
            state.data = JSON.parse(content);

            // Migrate old data structure if needed
            migrateDataStructure();
        } else if (response.status === 404) {
            state.data = createInitialData();
            await saveData();
        } else {
            throw new Error('Failed to load data');
        }

        renderAllViews();
    } catch (error) {
        console.error('Load data error:', error);
        showToast('Failed to load data', 'error');

        const localData = localStorage.getItem('dashboard_data');
        if (localData) {
            state.data = JSON.parse(localData);
            migrateDataStructure();
            renderAllViews();
        } else {
            state.data = createInitialData();
            renderAllViews();
        }
    }
    hideLoading();
}

// Migrate old data structure to new reference-based structure
function migrateDataStructure() {
    if (!state.data.scheduledItems) {
        state.data.scheduledItems = {};
    }

    // Convert old dailyLists format if needed
    Object.keys(state.data.dailyLists || {}).forEach(date => {
        const items = state.data.dailyLists[date];
        if (items && items.length > 0 && items[0].title && !items[0].type) {
            // Old format - has full task data, not references
            // Keep standalone tasks, convert project tasks to references
            state.data.dailyLists[date] = items.filter(item => !item.projectId);
        }
    });
}

async function saveData() {
    localStorage.setItem('dashboard_data', JSON.stringify(state.data));

    try {
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(state.data, null, 2))));

        const body = {
            message: `Update productivity data - ${new Date().toISOString()}`,
            content: content,
            branch: CONFIG.branch
        };

        if (state.fileSha) {
            body.sha = state.fileSha;
        }

        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.dataFile}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `token ${state.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {
            const result = await response.json();
            state.fileSha = result.content.sha;
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        console.error('Save data error:', error);
        showToast('Changes saved locally. Will sync when online.', 'error');
    }
}

function createInitialData() {
    return {
        projects: [],
        dailyLists: {},        // For standalone tasks (not from projects)
        scheduledItems: {},    // For references to project tasks: { "2025-01-20": [{ projectId, taskId, subtaskId? }] }
        completedTasks: [],
        lastUpdated: new Date().toISOString()
    };
}

// Get task data from project by reference
function getTaskFromProject(projectId, taskId, subtaskId = null) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return null;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return null;

    if (subtaskId) {
        const subtask = (task.subtasks || []).find(st => st.id === subtaskId);
        if (!subtask) return null;
        return {
            ...subtask,
            parentTask: task,
            project: project,
            projectId: project.id,
            projectName: project.name,
            projectColor: project.color,
            taskId: task.id,
            subtaskId: subtask.id,
            isSubtask: true
        };
    }

    return {
        ...task,
        project: project,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color,
        isSubtask: false
    };
}

// View Rendering
function renderAllViews() {
    renderTodayView();
    renderYesterdayView();
    renderScheduledView();
    renderProjectsView();
    renderArchiveView();
    updateProjectSelector();
}

function renderTodayView() {
    const today = getToday();
    const tasks = getTasksForDate(today);

    elements.todayTasks.innerHTML = '';
    elements.todayEmpty.classList.toggle('hidden', tasks.length > 0);

    tasks.forEach(task => {
        elements.todayTasks.appendChild(createDailyTaskElement(task, today));
    });
}

function renderYesterdayView() {
    const yesterday = getYesterday();
    const tasks = getTasksForDate(yesterday, true);

    elements.yesterdayTasks.innerHTML = '';
    elements.yesterdayEmpty.classList.toggle('hidden', tasks.length > 0);

    tasks.forEach(task => {
        elements.yesterdayTasks.appendChild(createDailyTaskElement(task, yesterday, true));
    });
}

function renderScheduledView() {
    const today = getToday();
    const scheduled = {};

    // Get scheduled project tasks
    Object.entries(state.data.scheduledItems || {}).forEach(([date, items]) => {
        if (date > today) {
            items.forEach(ref => {
                const task = getTaskFromProject(ref.projectId, ref.taskId, ref.subtaskId);
                if (task && !task.completed) {
                    if (!scheduled[date]) scheduled[date] = [];
                    scheduled[date].push(task);
                }
            });
        }
    });

    // Get standalone scheduled tasks
    Object.entries(state.data.dailyLists || {}).forEach(([date, tasks]) => {
        if (date > today) {
            tasks.forEach(task => {
                if (!task.completed) {
                    if (!scheduled[date]) scheduled[date] = [];
                    scheduled[date].push({ ...task, isStandalone: true });
                }
            });
        }
    });

    elements.scheduledTasks.innerHTML = '';
    const dates = Object.keys(scheduled).sort();

    elements.scheduledEmpty.classList.toggle('hidden', dates.length > 0);

    dates.forEach(date => {
        const group = document.createElement('div');
        group.className = 'scheduled-group';
        group.innerHTML = `
            <div class="scheduled-group-header">${formatDate(date)}</div>
            <div class="scheduled-group-tasks"></div>
        `;

        const tasksContainer = group.querySelector('.scheduled-group-tasks');
        scheduled[date].forEach(task => {
            tasksContainer.appendChild(createDailyTaskElement(task, date));
        });

        elements.scheduledTasks.appendChild(group);
    });
}

function renderProjectsView() {
    const activeProjects = state.data.projects.filter(p => !p.archived);

    elements.projectsList.innerHTML = '';
    elements.projectsEmpty.classList.toggle('hidden', activeProjects.length > 0);

    activeProjects.forEach(project => {
        elements.projectsList.appendChild(createProjectCard(project));
    });
}

function renderArchiveView() {
    const archivedProjects = state.data.projects.filter(p => p.archived);

    elements.archiveList.innerHTML = '';
    elements.archiveEmpty.classList.toggle('hidden', archivedProjects.length > 0);

    archivedProjects.forEach(project => {
        elements.archiveList.appendChild(createProjectCard(project, true));
    });
}

function renderProjectDetail(projectId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    state.currentProject = projectId;
    elements.projectDetailTitle.textContent = project.name;

    // Render tasks
    elements.projectTasks.innerHTML = '';
    project.tasks.forEach(task => {
        elements.projectTasks.appendChild(createProjectTaskElement(task, project));
    });

    if (project.tasks.length === 0) {
        elements.projectTasks.innerHTML = '<p class="empty-state">No tasks yet</p>';
    }

    // Render progress updates
    elements.projectProgress.innerHTML = '';
    const updates = (project.progressUpdates || []).slice().reverse();
    updates.forEach(update => {
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="progress-item-date">${formatDate(update.date)}</div>
            <div>${update.text}</div>
        `;
        elements.projectProgress.appendChild(item);
    });

    if (updates.length === 0) {
        elements.projectProgress.innerHTML = '<p class="empty-state">No updates yet</p>';
    }

    const archiveBtn = document.getElementById('archive-project-btn');
    archiveBtn.textContent = project.archived ? 'Unarchive' : 'Archive';

    switchView('project-detail');
}

function getTasksForDate(date, includeCompleted = false) {
    const tasks = [];

    // Get scheduled project tasks for this date
    const scheduledRefs = (state.data.scheduledItems || {})[date] || [];
    scheduledRefs.forEach(ref => {
        const task = getTaskFromProject(ref.projectId, ref.taskId, ref.subtaskId);
        if (task) {
            // Check daily completion status
            const dailyCompletion = ref.completedOnDay;
            const taskWithStatus = {
                ...task,
                completedOnDay: dailyCompletion,
                scheduledRef: ref
            };
            if (includeCompleted || !dailyCompletion) {
                tasks.push(taskWithStatus);
            }
        }
    });

    // Get standalone tasks for this date
    const standaloneTasks = (state.data.dailyLists || {})[date] || [];
    standaloneTasks.forEach(task => {
        if (includeCompleted || !task.completed) {
            tasks.push({ ...task, isStandalone: true });
        }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => {
        const aCompleted = a.completedOnDay || a.completed;
        const bCompleted = b.completedOnDay || b.completed;
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

    return tasks;
}

// Get all dates a task is scheduled for
function getScheduledDatesForTask(projectId, taskId, subtaskId = null) {
    const dates = [];
    Object.entries(state.data.scheduledItems || {}).forEach(([date, items]) => {
        items.forEach(ref => {
            if (ref.projectId === projectId && ref.taskId === taskId) {
                if (subtaskId === null || ref.subtaskId === subtaskId) {
                    dates.push(date);
                }
            }
        });
    });
    return dates.sort();
}

// Create task element for daily views (Today, Yesterday, Scheduled)
function createDailyTaskElement(task, date, readonly = false) {
    const div = document.createElement('div');
    const isCompleted = task.completedOnDay || task.completed;
    div.className = `task-item ${isCompleted ? 'completed' : ''} priority-${task.priority || 'medium'}`;

    const projectTag = task.projectName ? `
        <span class="task-project-tag" style="background: ${task.projectColor}20; color: ${task.projectColor}">
            ${task.projectName}
        </span>
    ` : '';

    const subtaskIndicator = task.isSubtask ? `
        <span class="task-project-tag" style="background: #64748b20; color: #64748b">
            Subtask of: ${task.parentTask?.title || 'Unknown'}
        </span>
    ` : '';

    const priorityBadge = `
        <span class="task-priority">
            <span class="priority-dot"></span>
            ${task.priority || 'medium'}
        </span>
    `;

    div.innerHTML = `
        <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-date="${date}"></div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                ${projectTag}
                ${subtaskIndicator}
                ${priorityBadge}
            </div>
        </div>
        ${!readonly ? `
            <div class="task-actions">
                <button class="task-action-btn" data-action="remove-from-day" title="Remove from this day">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        ` : ''}
    `;

    // Checkbox click handler
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isCompleted) {
            openCompleteModal(task, date);
        } else {
            toggleDailyTaskComplete(task, date, false);
        }
    });

    // Action buttons
    div.querySelectorAll('.task-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            if (action === 'remove-from-day') {
                removeTaskFromDay(task, date);
            }
        });
    });

    return div;
}

// Create task element for project detail view
function createProjectTaskElement(task, project) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority || 'medium'}`;
    div.dataset.taskId = task.id;

    const scheduledDates = getScheduledDatesForTask(project.id, task.id);
    const scheduledBadge = scheduledDates.length > 0 ? `
        <div class="task-scheduled-dates">
            ${scheduledDates.map(d => `<span class="task-scheduled-badge">${formatShortDate(d)}</span>`).join('')}
        </div>
    ` : '';

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;

    div.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}"></div>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                <span class="task-priority">
                    <span class="priority-dot"></span>
                    ${task.priority || 'medium'}
                </span>
                ${hasSubtasks ? `<span>${completedSubtasks}/${task.subtasks.length} subtasks</span>` : ''}
            </div>
            ${scheduledBadge}
            ${hasSubtasks ? `
                <div class="subtasks">
                    ${task.subtasks.map(st => createSubtaskHTML(st, task, project)).join('')}
                </div>
            ` : ''}
        </div>
        <div class="task-actions">
            <button class="task-action-btn" data-action="schedule" title="Add to Day">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="12" y1="14" x2="12" y2="18"/>
                    <line x1="10" y1="16" x2="14" y2="16"/>
                </svg>
            </button>
            <button class="task-action-btn" data-action="add-subtask" title="Add Subtask">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>
            <button class="task-action-btn" data-action="edit" title="Edit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="task-action-btn" data-action="delete" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </div>
    `;

    // Checkbox handler
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!task.completed) {
            openCompleteModal({ ...task, projectId: project.id }, null, true);
        } else {
            toggleProjectTaskComplete(project.id, task.id, false);
        }
    });

    // Subtask checkbox handlers
    div.querySelectorAll('.subtask-item .task-checkbox').forEach(cb => {
        cb.addEventListener('click', (e) => {
            e.stopPropagation();
            const subtaskId = cb.dataset.subtaskId;
            toggleSubtaskComplete(project.id, task.id, subtaskId);
        });
    });

    // Subtask schedule buttons
    div.querySelectorAll('.subtask-schedule-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const subtaskId = btn.dataset.subtaskId;
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                openScheduleModal(project.id, task.id, subtaskId, subtask.title);
            }
        });
    });

    // Action buttons
    div.querySelectorAll('.task-actions > .task-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            handleProjectTaskAction(action, task, project);
        });
    });

    return div;
}

function createSubtaskHTML(subtask, parentTask, project) {
    const scheduledDates = getScheduledDatesForTask(project.id, parentTask.id, subtask.id);
    const scheduledBadges = scheduledDates.map(d =>
        `<span class="task-scheduled-badge">${formatShortDate(d)}</span>`
    ).join('');

    return `
        <div class="subtask-item">
            <div class="task-checkbox ${subtask.completed ? 'checked' : ''}" data-subtask-id="${subtask.id}"></div>
            <span style="${subtask.completed ? 'text-decoration: line-through; opacity: 0.6' : ''}">${subtask.title}</span>
            ${scheduledBadges}
            <div class="subtask-actions">
                <button class="subtask-schedule-btn" data-subtask-id="${subtask.id}" title="Add to Day">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function createProjectCard(project, archived = false) {
    const div = document.createElement('div');
    div.className = 'project-card';
    div.dataset.projectId = project.id;

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.completed).length;

    div.innerHTML = `
        <div class="project-card-header">
            <div>
                <h3>${project.name}</h3>
                <p class="project-card-description">${project.description || 'No description'}</p>
            </div>
            <div class="project-color-indicator" style="background: ${project.color}"></div>
        </div>
        <div class="project-card-stats">
            <span class="project-stat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                ${completedTasks}/${totalTasks} tasks
            </span>
            ${project.progressUpdates?.length > 0 ? `
                <span class="project-stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    ${project.progressUpdates.length} updates
                </span>
            ` : ''}
        </div>
    `;

    div.addEventListener('click', () => renderProjectDetail(project.id));

    return div;
}

function updateProjectSelector() {
    const select = elements.taskProject;
    select.innerHTML = '<option value="">No Project</option>';

    state.data.projects
        .filter(p => !p.archived)
        .forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            select.appendChild(option);
        });
}

// Navigation
function switchView(viewName) {
    state.currentView = viewName;

    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `view-${viewName}`);
    });
}

// Schedule Modal
function openScheduleModal(projectId, taskId, subtaskId = null, taskTitle = '') {
    elements.scheduleProjectId.value = projectId;
    elements.scheduleTaskId.value = taskId;
    elements.scheduleSubtaskId.value = subtaskId || '';
    elements.scheduleTaskTitle.textContent = taskTitle;
    elements.scheduleCustomDate.value = getTomorrow();

    // Show subtasks option if task has subtasks and we're scheduling the parent
    const project = state.data.projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    const hasSubtasks = task?.subtasks && task.subtasks.length > 0 && !subtaskId;

    elements.scheduleSubtasksOption.classList.toggle('hidden', !hasSubtasks);
    if (hasSubtasks) {
        elements.scheduleIncludeSubtasks.checked = true;
    }

    elements.scheduleModal.classList.remove('hidden');
}

async function scheduleTaskForDate(date) {
    const projectId = elements.scheduleProjectId.value;
    const taskId = elements.scheduleTaskId.value;
    const subtaskId = elements.scheduleSubtaskId.value || null;
    const includeSubtasks = elements.scheduleIncludeSubtasks.checked;

    if (!state.data.scheduledItems[date]) {
        state.data.scheduledItems[date] = [];
    }

    // Check if already scheduled
    const exists = state.data.scheduledItems[date].some(ref =>
        ref.projectId === projectId &&
        ref.taskId === taskId &&
        ref.subtaskId === subtaskId
    );

    if (!exists) {
        state.data.scheduledItems[date].push({
            projectId,
            taskId,
            subtaskId,
            scheduledAt: new Date().toISOString(),
            completedOnDay: false
        });

        // If including subtasks and this is a parent task
        if (includeSubtasks && !subtaskId) {
            const project = state.data.projects.find(p => p.id === projectId);
            const task = project?.tasks.find(t => t.id === taskId);
            if (task?.subtasks) {
                task.subtasks.forEach(st => {
                    const stExists = state.data.scheduledItems[date].some(ref =>
                        ref.projectId === projectId &&
                        ref.taskId === taskId &&
                        ref.subtaskId === st.id
                    );
                    if (!stExists) {
                        state.data.scheduledItems[date].push({
                            projectId,
                            taskId,
                            subtaskId: st.id,
                            scheduledAt: new Date().toISOString(),
                            completedOnDay: false
                        });
                    }
                });
            }
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();
    showToast(`Task scheduled for ${formatShortDate(date)}`, 'success');
}

async function removeTaskFromDay(task, date) {
    if (task.isStandalone) {
        // Remove standalone task
        if (state.data.dailyLists[date]) {
            state.data.dailyLists[date] = state.data.dailyLists[date].filter(t => t.id !== task.id);
        }
    } else {
        // Remove scheduled reference
        if (state.data.scheduledItems[date]) {
            state.data.scheduledItems[date] = state.data.scheduledItems[date].filter(ref =>
                !(ref.projectId === task.projectId &&
                  ref.taskId === task.taskId &&
                  ref.subtaskId === task.subtaskId)
            );
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();
    showToast('Task removed from day', 'success');
}

// Task Actions
function handleProjectTaskAction(action, task, project) {
    switch (action) {
        case 'schedule':
            openScheduleModal(project.id, task.id, null, task.title);
            break;
        case 'edit':
            openTaskModal(task, project.id);
            break;
        case 'add-subtask':
            openSubtaskModal(task, project.id);
            break;
        case 'delete':
            if (confirm('Delete this task?')) {
                deleteProjectTask(project.id, task.id);
            }
            break;
    }
}

function openTaskModal(task = null, projectId = null) {
    elements.taskModalTitle.textContent = task ? 'Edit Task' : 'Add Task';
    elements.taskForm.reset();
    elements.customDateGroup.classList.add('hidden');
    elements.taskParentId.value = '';
    elements.taskProject.disabled = false;

    if (task) {
        elements.taskId.value = task.id;
        elements.taskProjectId.value = projectId || '';
        elements.taskTitle.value = task.title;
        elements.taskDescription.value = task.description || '';
        elements.taskProject.value = projectId || '';
        elements.taskPriority.value = task.priority || 'medium';
        elements.taskSchedule.value = 'none';
    } else {
        elements.taskId.value = '';
        elements.taskProjectId.value = projectId || '';
        elements.taskProject.value = projectId || '';
        elements.taskSchedule.value = 'today';
    }

    elements.taskModal.classList.remove('hidden');
}

function openSubtaskModal(parentTask, projectId) {
    elements.taskModalTitle.textContent = 'Add Subtask';
    elements.taskForm.reset();
    elements.customDateGroup.classList.add('hidden');

    elements.taskId.value = '';
    elements.taskProjectId.value = projectId;
    elements.taskParentId.value = parentTask.id;
    elements.taskProject.value = projectId;
    elements.taskProject.disabled = true;
    elements.taskSchedule.value = 'none';

    elements.taskModal.classList.remove('hidden');
}

function openCompleteModal(task, date = null, isProjectTask = false) {
    elements.completeTaskId.value = JSON.stringify({
        id: task.id,
        projectId: task.projectId,
        taskId: task.taskId,
        subtaskId: task.subtaskId,
        date: date,
        isStandalone: task.isStandalone,
        isProjectTask: isProjectTask,
        isSubtask: task.isSubtask
    });
    elements.completeNotes.value = '';
    elements.completeLinks.value = '';
    elements.completeModal.classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    elements.taskProject.disabled = false;
    elements.taskParentId.value = '';
}

async function saveTask(e) {
    e.preventDefault();

    const taskId = elements.taskId.value || generateId();
    const projectId = elements.taskProjectId.value || elements.taskProject.value;
    const parentId = elements.taskParentId.value;

    let scheduledDate = null;
    switch (elements.taskSchedule.value) {
        case 'today':
            scheduledDate = getToday();
            break;
        case 'tomorrow':
            scheduledDate = getTomorrow();
            break;
        case 'next-week':
            scheduledDate = getNextWeek();
            break;
        case 'custom':
            scheduledDate = elements.taskCustomDate.value;
            break;
    }

    const taskData = {
        id: taskId,
        title: elements.taskTitle.value,
        description: elements.taskDescription.value,
        priority: elements.taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (parentId && projectId) {
        // Adding as subtask
        const project = state.data.projects.find(p => p.id === projectId);
        if (project) {
            const parentTask = project.tasks.find(t => t.id === parentId);
            if (parentTask) {
                if (!parentTask.subtasks) parentTask.subtasks = [];
                parentTask.subtasks.push(taskData);

                // Schedule if requested
                if (scheduledDate) {
                    if (!state.data.scheduledItems[scheduledDate]) {
                        state.data.scheduledItems[scheduledDate] = [];
                    }
                    state.data.scheduledItems[scheduledDate].push({
                        projectId,
                        taskId: parentId,
                        subtaskId: taskId,
                        scheduledAt: new Date().toISOString(),
                        completedOnDay: false
                    });
                }
            }
        }
    } else if (projectId) {
        // Adding to project
        const project = state.data.projects.find(p => p.id === projectId);
        if (project) {
            const existingIndex = project.tasks.findIndex(t => t.id === taskId);
            if (existingIndex >= 0) {
                project.tasks[existingIndex] = {
                    ...project.tasks[existingIndex],
                    ...taskData,
                    subtasks: project.tasks[existingIndex].subtasks
                };
            } else {
                taskData.subtasks = [];
                project.tasks.push(taskData);
            }

            // Schedule if requested
            if (scheduledDate && existingIndex < 0) {
                if (!state.data.scheduledItems[scheduledDate]) {
                    state.data.scheduledItems[scheduledDate] = [];
                }
                state.data.scheduledItems[scheduledDate].push({
                    projectId,
                    taskId,
                    subtaskId: null,
                    scheduledAt: new Date().toISOString(),
                    completedOnDay: false
                });
            }
        }
    } else if (scheduledDate) {
        // Adding standalone task to daily list
        if (!state.data.dailyLists[scheduledDate]) {
            state.data.dailyLists[scheduledDate] = [];
        }
        const existingIndex = state.data.dailyLists[scheduledDate].findIndex(t => t.id === taskId);
        if (existingIndex >= 0) {
            state.data.dailyLists[scheduledDate][existingIndex] = {
                ...state.data.dailyLists[scheduledDate][existingIndex],
                ...taskData
            };
        } else {
            state.data.dailyLists[scheduledDate].push(taskData);
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();

    if (state.currentProject) {
        renderProjectDetail(state.currentProject);
    }

    showToast('Task saved', 'success');
}

async function completeTask(e) {
    e.preventDefault();

    const taskInfo = JSON.parse(elements.completeTaskId.value);
    const notes = elements.completeNotes.value;
    const links = elements.completeLinks.value;

    if (taskInfo.isProjectTask) {
        // Completing from project view - mark task as complete in project
        await toggleProjectTaskComplete(taskInfo.projectId, taskInfo.id, true, notes, links);
    } else if (taskInfo.isStandalone) {
        // Completing standalone task
        await toggleStandaloneTaskComplete(taskInfo.id, taskInfo.date, true, notes, links);
    } else {
        // Completing from daily view - mark as complete for that day
        await toggleDailyTaskComplete(taskInfo, taskInfo.date, true, notes, links);
    }

    closeAllModals();
}

async function toggleDailyTaskComplete(task, date, completed, notes = '', links = '') {
    if (task.isStandalone) {
        await toggleStandaloneTaskComplete(task.id, date, completed, notes, links);
        return;
    }

    // Find the scheduled reference and update it
    const scheduledItems = state.data.scheduledItems[date] || [];
    const ref = scheduledItems.find(r =>
        r.projectId === task.projectId &&
        r.taskId === task.taskId &&
        r.subtaskId === task.subtaskId
    );

    if (ref) {
        ref.completedOnDay = completed;
        if (completed) {
            ref.completedAt = new Date().toISOString();
            ref.completionNotes = notes;
            ref.completionLinks = links;

            // Also mark complete in project
            if (task.isSubtask) {
                await markSubtaskCompleteInProject(task.projectId, task.taskId, task.subtaskId, completed);
            } else {
                await markTaskCompleteInProject(task.projectId, task.taskId, completed, notes, links);
            }

            // Track for reporting
            state.data.completedTasks.push({
                projectId: task.projectId,
                taskId: task.taskId,
                subtaskId: task.subtaskId,
                title: task.title,
                completedAt: new Date().toISOString(),
                completionNotes: notes,
                completionLinks: links,
                date: date
            });
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();
    showToast(completed ? 'Task completed!' : 'Task reopened', 'success');
}

async function toggleStandaloneTaskComplete(taskId, date, completed, notes = '', links = '') {
    const dailyList = state.data.dailyLists[date] || [];
    const task = dailyList.find(t => t.id === taskId);

    if (task) {
        task.completed = completed;
        if (completed) {
            task.completedAt = new Date().toISOString();
            task.completionNotes = notes;
            task.completionLinks = links;

            state.data.completedTasks.push({
                id: taskId,
                title: task.title,
                completedAt: new Date().toISOString(),
                completionNotes: notes,
                completionLinks: links,
                date: date
            });
        } else {
            task.completedAt = null;
            task.completionNotes = null;
            task.completionLinks = null;
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();
    showToast(completed ? 'Task completed!' : 'Task reopened', 'success');
}

async function toggleProjectTaskComplete(projectId, taskId, completed, notes = '', links = '') {
    await markTaskCompleteInProject(projectId, taskId, completed, notes, links);

    if (completed) {
        const project = state.data.projects.find(p => p.id === projectId);
        const task = project?.tasks.find(t => t.id === taskId);

        state.data.completedTasks.push({
            projectId,
            taskId,
            title: task?.title || 'Unknown task',
            completedAt: new Date().toISOString(),
            completionNotes: notes,
            completionLinks: links
        });
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();

    if (state.currentProject === projectId) {
        renderProjectDetail(projectId);
    }

    showToast(completed ? 'Task completed!' : 'Task reopened', 'success');
}

async function markTaskCompleteInProject(projectId, taskId, completed, notes = '', links = '') {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = completed;
    if (completed) {
        task.completedAt = new Date().toISOString();
        task.completionNotes = notes;
        task.completionLinks = links;

        // Mark all subtasks as complete too
        if (task.subtasks) {
            task.subtasks.forEach(st => {
                st.completed = true;
                st.completedAt = new Date().toISOString();
            });
        }
    } else {
        task.completedAt = null;
        task.completionNotes = null;
        task.completionLinks = null;
    }
}

async function markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.completed = completed;
    subtask.completedAt = completed ? new Date().toISOString() : null;

    // Check if all subtasks are complete - auto-complete parent
    if (completed && task.subtasks.every(st => st.completed)) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
        showToast('All subtasks complete - parent task auto-completed!', 'success');
    } else if (!completed && task.completed) {
        // Reopen parent if a subtask is reopened
        task.completed = false;
        task.completedAt = null;
    }
}

async function toggleSubtaskComplete(projectId, taskId, subtaskId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    const newCompleted = !subtask.completed;
    await markSubtaskCompleteInProject(projectId, taskId, subtaskId, newCompleted);

    // Also update any scheduled references
    Object.values(state.data.scheduledItems).forEach(items => {
        items.forEach(ref => {
            if (ref.projectId === projectId && ref.taskId === taskId && ref.subtaskId === subtaskId) {
                ref.completedOnDay = newCompleted;
                if (newCompleted) {
                    ref.completedAt = new Date().toISOString();
                }
            }
        });
    });

    if (newCompleted) {
        state.data.completedTasks.push({
            projectId,
            taskId,
            subtaskId,
            title: subtask.title,
            completedAt: new Date().toISOString()
        });
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();

    if (state.currentProject === projectId) {
        renderProjectDetail(projectId);
    }
}

async function deleteProjectTask(projectId, taskId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (project) {
        project.tasks = project.tasks.filter(t => t.id !== taskId);

        // Remove all scheduled references
        Object.keys(state.data.scheduledItems).forEach(date => {
            state.data.scheduledItems[date] = state.data.scheduledItems[date].filter(ref =>
                !(ref.projectId === projectId && ref.taskId === taskId)
            );
        });
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();

    if (state.currentProject === projectId) {
        renderProjectDetail(projectId);
    }

    showToast('Task deleted', 'success');
}

// Project Actions
function openProjectModal(project = null) {
    elements.projectModalTitle.textContent = project ? 'Edit Project' : 'New Project';
    elements.projectForm.reset();

    if (project) {
        elements.projectId.value = project.id;
        elements.projectName.value = project.name;
        elements.projectDescription.value = project.description || '';

        const colorInput = document.querySelector(`input[name="project-color"][value="${project.color}"]`);
        if (colorInput) colorInput.checked = true;
    } else {
        elements.projectId.value = '';
    }

    elements.projectModal.classList.remove('hidden');
}

async function saveProject(e) {
    e.preventDefault();

    const projectId = elements.projectId.value || generateId();
    const colorInput = document.querySelector('input[name="project-color"]:checked');

    const projectData = {
        id: projectId,
        name: elements.projectName.value,
        description: elements.projectDescription.value,
        color: colorInput?.value || '#3b82f6',
        createdAt: new Date().toISOString(),
        tasks: [],
        progressUpdates: [],
        archived: false
    };

    const existingIndex = state.data.projects.findIndex(p => p.id === projectId);
    if (existingIndex >= 0) {
        projectData.tasks = state.data.projects[existingIndex].tasks;
        projectData.progressUpdates = state.data.projects[existingIndex].progressUpdates;
        projectData.archived = state.data.projects[existingIndex].archived;
        state.data.projects[existingIndex] = projectData;
    } else {
        state.data.projects.push(projectData);
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();
    showToast('Project saved', 'success');
}

async function archiveProject() {
    if (!state.currentProject) return;

    const project = state.data.projects.find(p => p.id === state.currentProject);
    if (project) {
        project.archived = !project.archived;
        state.data.lastUpdated = new Date().toISOString();
        await saveData();
        renderAllViews();
        switchView('projects');
        showToast(project.archived ? 'Project archived' : 'Project restored', 'success');
    }
}

function openProgressModal() {
    if (!state.currentProject) return;

    elements.progressProjectId.value = state.currentProject;
    elements.progressText.value = '';
    elements.progressModal.classList.remove('hidden');
}

async function saveProgress(e) {
    e.preventDefault();

    const projectId = elements.progressProjectId.value;
    const project = state.data.projects.find(p => p.id === projectId);

    if (project) {
        if (!project.progressUpdates) project.progressUpdates = [];
        project.progressUpdates.push({
            id: generateId(),
            text: elements.progressText.value,
            date: new Date().toISOString()
        });

        state.data.lastUpdated = new Date().toISOString();
        await saveData();
        closeAllModals();
        renderProjectDetail(projectId);
        showToast('Progress update added', 'success');
    }
}

// Export
function openExportModal() {
    elements.exportModal.classList.remove('hidden');
}

function exportReport(e) {
    e.preventDefault();

    const monthStr = elements.exportMonth.value;
    const format = elements.exportFormat.value;
    const [year, month] = monthStr.split('-').map(Number);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const completedInMonth = state.data.completedTasks.filter(task => {
        const taskDate = new Date(task.completedAt);
        return taskDate >= startDate && taskDate <= endDate;
    });

    const byProject = {};
    const standalone = [];

    completedInMonth.forEach(task => {
        if (task.projectId) {
            const project = state.data.projects.find(p => p.id === task.projectId);
            const projectName = project?.name || 'Unknown Project';
            if (!byProject[projectName]) byProject[projectName] = [];
            byProject[projectName].push(task);
        } else {
            standalone.push(task);
        }
    });

    let content = '';
    const monthName = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (format === 'markdown') {
        content = `# Productivity Report - ${monthName}\n\n`;
        content += `**Total Tasks Completed:** ${completedInMonth.length}\n\n`;

        Object.entries(byProject).forEach(([projectName, tasks]) => {
            content += `## ${projectName}\n\n`;
            tasks.forEach(task => {
                content += `- [x] ${task.title}`;
                if (task.completionNotes) content += `\n  - Notes: ${task.completionNotes}`;
                if (task.completionLinks) content += `\n  - Links: ${task.completionLinks}`;
                content += '\n';
            });
            content += '\n';
        });

        if (standalone.length > 0) {
            content += `## Other Tasks\n\n`;
            standalone.forEach(task => {
                content += `- [x] ${task.title}`;
                if (task.completionNotes) content += `\n  - Notes: ${task.completionNotes}`;
                content += '\n';
            });
        }
    } else if (format === 'json') {
        content = JSON.stringify({ month: monthName, tasks: completedInMonth }, null, 2);
    } else {
        content = `Productivity Report - ${monthName}\n`;
        content += `${'='.repeat(40)}\n\n`;
        content += `Total Tasks Completed: ${completedInMonth.length}\n\n`;

        Object.entries(byProject).forEach(([projectName, tasks]) => {
            content += `${projectName}\n${'-'.repeat(20)}\n`;
            tasks.forEach(task => {
                content += `  [x] ${task.title}\n`;
                if (task.completionNotes) content += `      Notes: ${task.completionNotes}\n`;
            });
            content += '\n';
        });

        if (standalone.length > 0) {
            content += `Other Tasks\n${'-'.repeat(20)}\n`;
            standalone.forEach(task => {
                content += `  [x] ${task.title}\n`;
            });
        }
    }

    const extension = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-report-${monthStr}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    closeAllModals();
    showToast('Report exported', 'success');
}

// Event Listeners
function initEventListeners() {
    // Auth
    elements.authBtn.addEventListener('click', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // Add buttons
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
    document.getElementById('add-project-task-btn').addEventListener('click', () => {
        openTaskModal(null, state.currentProject);
    });
    document.getElementById('add-progress-btn').addEventListener('click', openProgressModal);
    document.getElementById('archive-project-btn').addEventListener('click', archiveProject);
    document.getElementById('back-to-projects').addEventListener('click', () => switchView('projects'));
    elements.exportBtn.addEventListener('click', openExportModal);

    // Forms
    elements.taskForm.addEventListener('submit', saveTask);
    elements.completeForm.addEventListener('submit', completeTask);
    elements.projectForm.addEventListener('submit', saveProject);
    elements.progressForm.addEventListener('submit', saveProgress);
    elements.exportForm.addEventListener('submit', exportReport);

    // Schedule dropdown
    elements.taskSchedule.addEventListener('change', () => {
        elements.customDateGroup.classList.toggle('hidden', elements.taskSchedule.value !== 'custom');
    });

    // Schedule modal buttons
    document.querySelectorAll('.schedule-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const scheduleType = btn.dataset.schedule;
            let date;
            switch (scheduleType) {
                case 'today':
                    date = getToday();
                    break;
                case 'tomorrow':
                    date = getTomorrow();
                    break;
                case 'next-week':
                    date = getNextWeek();
                    break;
            }
            if (date) {
                scheduleTaskForDate(date);
            }
        });
    });

    elements.scheduleCustomBtn.addEventListener('click', () => {
        const date = elements.scheduleCustomDate.value;
        if (date) {
            scheduleTaskForDate(date);
        } else {
            showToast('Please select a date', 'error');
        }
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeAllModals);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
        if (e.key === 'n' && e.ctrlKey) {
            e.preventDefault();
            openTaskModal();
        }
    });
}

// Initialize App
function init() {
    initElements();
    initEventListeners();
    initAuth();
}

document.addEventListener('DOMContentLoaded', init);
