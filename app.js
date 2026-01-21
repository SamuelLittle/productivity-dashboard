/**
 * Productivity Dashboard
 * A personal task management app that syncs with GitHub
 */

// Configuration
const CONFIG = {
    clientId: 'YOUR_GITHUB_CLIENT_ID',
    owner: 'SamuelLittle',
    repo: 'productivity-dashboard',
    branch: 'main',
    dataFile: 'data.json',
    authProxy: null
};

// App State
let state = {
    user: null,
    token: null,
    data: null,
    currentView: 'today',
    currentProject: null,
    fileSha: null,
    calendarDate: new Date(),
    selectedDate: null,
    selectedPreviousDate: null,
    showCompleted: true,
    draggedTaskKey: null,
    draggedTaskDate: null,
    isSubmitting: false,
    calendarFilter: {
        projectId: null,
        taskId: null
    }
};

// DOM Elements
const elements = {};

// ============================================
// DARK MODE
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.removeAttribute('data-theme');
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(true);
    }
}

function updateThemeIcon(isDark) {
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    if (lightIcon && darkIcon) {
        if (isDark) {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }
}

// Initialize theme on page load
initTheme();

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
        previousViewTitle: document.getElementById('previous-view-title'),
        previousTasks: document.getElementById('previous-tasks'),
        previousEmpty: document.getElementById('previous-empty'),
        previousDateInput: document.getElementById('previous-date-input'),
        previousDatePrev: document.getElementById('previous-date-prev'),
        previousDateNext: document.getElementById('previous-date-next'),
        scheduledTasks: document.getElementById('scheduled-tasks'),
        scheduledEmpty: document.getElementById('scheduled-empty'),
        projectsList: document.getElementById('projects-list'),
        projectsEmpty: document.getElementById('projects-empty'),
        archiveList: document.getElementById('archive-list'),
        archiveEmpty: document.getElementById('archive-empty'),
        projectDetailTitle: document.getElementById('project-detail-title'),
        projectTasks: document.getElementById('project-tasks'),
        projectProgress: document.getElementById('project-progress'),
        // Calendar
        calendarGrid: document.getElementById('calendar-grid'),
        calendarMonthYear: document.getElementById('calendar-month-year'),
        calendarPrevBtn: document.getElementById('calendar-prev'),
        calendarNextBtn: document.getElementById('calendar-next'),
        calendarTodayBtn: document.getElementById('calendar-today-btn'),
        calendarProjectFilter: document.getElementById('calendar-project-filter'),
        calendarTaskFilter: document.getElementById('calendar-task-filter'),
        calendarFilterReset: document.getElementById('calendar-filter-reset'),
        // Day detail modal
        dayDetailModal: document.getElementById('day-detail-modal'),
        dayDetailDate: document.getElementById('day-detail-date'),
        dayDetailTasks: document.getElementById('day-detail-tasks'),
        dayDetailPrevBtn: document.getElementById('day-detail-prev'),
        dayDetailNextBtn: document.getElementById('day-detail-next'),
        dayDetailAddBtn: document.getElementById('day-detail-add-btn'),
        dayDetailNotes: document.getElementById('day-detail-notes'),
        dayDetailSaveNotes: document.getElementById('day-detail-save-notes'),
        // Reschedule modal
        rescheduleModal: document.getElementById('reschedule-modal'),
        rescheduleTaskInfo: document.getElementById('reschedule-task-info'),
        rescheduleCustomDate: document.getElementById('reschedule-custom-date'),
        rescheduleCustomBtn: document.getElementById('reschedule-custom-btn'),
        // Task detail modal
        taskDetailModal: document.getElementById('task-detail-modal'),
        taskDetailTitle: document.getElementById('task-detail-title'),
        taskDetailData: document.getElementById('task-detail-data'),
        taskDetailProject: document.getElementById('task-detail-project'),
        taskDetailPriority: document.getElementById('task-detail-priority'),
        taskDetailPriorityText: document.getElementById('task-detail-priority-text'),
        taskDetailDescription: document.getElementById('task-detail-description'),
        taskDetailNotes: document.getElementById('task-detail-notes'),
        taskDetailLinks: document.getElementById('task-detail-links'),
        taskDetailCompletionInfo: document.getElementById('task-detail-completion-info'),
        taskDetailCompletedAt: document.getElementById('task-detail-completed-at'),
        taskDetailCompletionNotes: document.getElementById('task-detail-completion-notes'),
        taskDetailSaveBtn: document.getElementById('task-detail-save-btn'),
        // Theme toggle
        themeToggle: document.getElementById('theme-toggle')
    });
}

// ============================================
// DATE UTILITY FUNCTIONS (FIXED FOR TIMEZONE)
// ============================================

// Get local date string in YYYY-MM-DD format
function getLocalDateString(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getToday() {
    return getLocalDateString(new Date());
}

function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return getLocalDateString(date);
}

function getTomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return getLocalDateString(date);
}

function getNextWeek() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return getLocalDateString(date);
}

function getDateFromString(dateString) {
    // Parse YYYY-MM-DD string into local date
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateInput) {
    const date = typeof dateInput === 'string' ? getDateFromString(dateInput) : new Date(dateInput);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShortDate(dateInput) {
    const date = typeof dateInput === 'string' ? getDateFromString(dateInput) : new Date(dateInput);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function showLoading() {
    elements.loading?.classList.remove('hidden');
}

function hideLoading() {
    elements.loading?.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    elements.toastContainer?.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============================================
// AUTHENTICATION
// ============================================

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

// ============================================
// DATA MANAGEMENT
// ============================================

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
        showToast('Failed to load data from GitHub', 'error');

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

function migrateDataStructure() {
    if (!state.data.scheduledItems) {
        state.data.scheduledItems = {};
    }
    if (!state.data.dailyLists) {
        state.data.dailyLists = {};
    }
    if (!state.data.completedTasks) {
        state.data.completedTasks = [];
    }
    if (!state.data.dailyNotes) {
        state.data.dailyNotes = {};
    }
    if (!state.data.taskOrder) {
        state.data.taskOrder = {};
    }
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
        dailyLists: {},
        scheduledItems: {},
        completedTasks: [],
        lastUpdated: new Date().toISOString()
    };
}

// ============================================
// TASK DATA HELPERS
// ============================================

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

function getTasksForDate(date, includeCompleted = true) {
    const tasks = [];

    // Get scheduled project tasks for this date
    const scheduledRefs = (state.data.scheduledItems || {})[date] || [];
    scheduledRefs.forEach(ref => {
        const task = getTaskFromProject(ref.projectId, ref.taskId, ref.subtaskId);
        if (task) {
            const taskWithStatus = {
                ...task,
                completedOnDay: ref.completedOnDay,
                completionNotes: ref.completionNotes,
                completionLinks: ref.completionLinks,
                scheduledRef: ref
            };
            if (includeCompleted || !ref.completedOnDay) {
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

    // Get saved order for this date
    const savedOrder = getTaskOrder(date);

    // Sort tasks: first by saved order, then incomplete first, then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => {
        const aKey = getTaskKey(a);
        const bKey = getTaskKey(b);
        const aIndex = savedOrder.indexOf(aKey);
        const bIndex = savedOrder.indexOf(bKey);

        // If both have saved positions, use those
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        // If only one has saved position, it comes first
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;

        // Fall back to: incomplete first, then by priority
        const aCompleted = a.completedOnDay || a.completed;
        const bCompleted = b.completedOnDay || b.completed;
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

    return tasks;
}

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

// Get date status for calendar indicators
function getDateStatus(date) {
    const today = getToday();
    const tasks = getTasksForDate(date, true);

    if (tasks.length === 0) return null;

    const completed = tasks.filter(t => t.completedOnDay || t.completed).length;
    const incomplete = tasks.length - completed;

    if (date < today) {
        // Past date
        if (incomplete > 0) return 'past-incomplete';
        return 'past-complete';
    } else if (date === today) {
        return 'today';
    } else {
        // Future date
        return 'future';
    }
}

// ============================================
// VIEW RENDERING
// ============================================

function renderAllViews() {
    renderTodayView();
    renderPreviousView();
    renderScheduledView();
    renderProjectsView();
    renderArchiveView();
    renderCalendar();
    updateProjectSelector();
    updateCalendarProjectFilter();
}

function renderTodayView() {
    const today = getToday();
    const tasks = getTasksForDate(today, true); // Include completed tasks

    elements.todayTasks.innerHTML = '';

    const visibleTasks = state.showCompleted ? tasks : tasks.filter(t => !(t.completedOnDay || t.completed));
    elements.todayEmpty.classList.toggle('hidden', visibleTasks.length > 0);

    visibleTasks.forEach(task => {
        elements.todayTasks.appendChild(createDailyTaskElement(task, today));
    });
}

function renderPreviousView() {
    // Default to yesterday if no date selected
    if (!state.selectedPreviousDate) {
        state.selectedPreviousDate = getYesterday();
    }

    const date = state.selectedPreviousDate;
    const tasks = getTasksForDate(date, true);

    // Update title and date picker
    elements.previousViewTitle.textContent = formatDate(date);
    if (elements.previousDateInput) {
        elements.previousDateInput.value = date;
        // Limit date picker to past dates
        elements.previousDateInput.max = getYesterday();
    }

    elements.previousTasks.innerHTML = '';
    elements.previousEmpty.classList.toggle('hidden', tasks.length > 0);

    tasks.forEach(task => {
        elements.previousTasks.appendChild(createDailyTaskElement(task, date, true));
    });
}

function navigatePreviousDate(direction) {
    const currentDate = getDateFromString(state.selectedPreviousDate || getYesterday());
    currentDate.setDate(currentDate.getDate() + direction);
    const newDate = getLocalDateString(currentDate);

    // Don't go into the future (beyond yesterday)
    const yesterday = getYesterday();
    if (newDate > yesterday) {
        showToast('Cannot view future dates in Previous view', 'error');
        return;
    }

    state.selectedPreviousDate = newDate;
    renderPreviousView();
}

function selectPreviousDate(dateStr) {
    const yesterday = getYesterday();
    if (dateStr > yesterday) {
        showToast('Cannot view future dates in Previous view', 'error');
        return;
    }

    state.selectedPreviousDate = dateStr;
    renderPreviousView();
}

function renderScheduledView() {
    const today = getToday();
    const scheduled = {};

    // Get scheduled project tasks
    Object.entries(state.data.scheduledItems || {}).forEach(([date, items]) => {
        if (date > today) {
            items.forEach(ref => {
                const task = getTaskFromProject(ref.projectId, ref.taskId, ref.subtaskId);
                if (task && !ref.completedOnDay) {
                    if (!scheduled[date]) scheduled[date] = [];
                    scheduled[date].push({ ...task, scheduledRef: ref });
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

    // Split tasks into active and completed
    const activeTasks = [];
    const completedTasks = [];

    project.tasks.forEach(task => {
        // Task is completed if:
        // 1. The task itself is marked complete, OR
        // 2. All subtasks are complete (if it has subtasks)
        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const allSubtasksComplete = hasSubtasks && task.subtasks.every(st => st.completed);
        const isCompleted = task.completed || allSubtasksComplete;

        if (isCompleted) {
            completedTasks.push(task);
        } else {
            activeTasks.push(task);
        }
    });

    elements.projectTasks.innerHTML = '';

    // Active Tasks Section
    if (activeTasks.length > 0 || completedTasks.length > 0) {
        const activeHeader = document.createElement('div');
        activeHeader.className = 'project-tasks-section-header';
        activeHeader.innerHTML = `<h4>Active Tasks (${activeTasks.length})</h4>`;
        elements.projectTasks.appendChild(activeHeader);
    }

    if (activeTasks.length > 0) {
        activeTasks.forEach(task => {
            elements.projectTasks.appendChild(createProjectTaskElement(task, project));
        });
    } else if (project.tasks.length > 0) {
        const emptyActive = document.createElement('p');
        emptyActive.className = 'empty-state-small';
        emptyActive.textContent = 'All tasks completed';
        elements.projectTasks.appendChild(emptyActive);
    }

    // Completed Tasks Section
    if (completedTasks.length > 0) {
        const completedHeader = document.createElement('div');
        completedHeader.className = 'project-tasks-section-header completed-section';
        completedHeader.innerHTML = `<h4>Completed Tasks (${completedTasks.length})</h4>`;
        elements.projectTasks.appendChild(completedHeader);

        completedTasks.forEach(task => {
            elements.projectTasks.appendChild(createProjectTaskElement(task, project));
        });
    }

    if (project.tasks.length === 0) {
        elements.projectTasks.innerHTML = '<p class="empty-state">No tasks yet</p>';
    }

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

// ============================================
// CALENDAR VIEW
// ============================================

function renderCalendar() {
    if (!elements.calendarGrid || !elements.calendarMonthYear) return;

    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    const today = getToday();

    // Update header
    elements.calendarMonthYear.textContent = new Date(year, month, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Build calendar grid
    let html = `
        <div class="calendar-header-row">
            <div class="calendar-day-name">Sun</div>
            <div class="calendar-day-name">Mon</div>
            <div class="calendar-day-name">Tue</div>
            <div class="calendar-day-name">Wed</div>
            <div class="calendar-day-name">Thu</div>
            <div class="calendar-day-name">Fri</div>
            <div class="calendar-day-name">Sat</div>
        </div>
        <div class="calendar-days">
    `;

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const dateStr = getLocalDateString(new Date(prevYear, prevMonth, day));
        const status = getFilteredDateStatus(dateStr);
        html += `<div class="calendar-day other-month${status ? ' has-tasks' : ''}" data-date="${dateStr}">
            <span class="day-number">${day}</span>
            ${status ? `<span class="day-indicator ${status}"></span>` : ''}
        </div>`;
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = getLocalDateString(new Date(year, month, day));
        const isToday = dateStr === today;
        const status = getFilteredDateStatus(dateStr);
        const tasks = getFilteredTasksForDate(dateStr, true);
        const taskCount = tasks.length;

        html += `<div class="calendar-day${isToday ? ' today' : ''}${status ? ' has-tasks' : ''}" data-date="${dateStr}">
            <span class="day-number">${day}</span>
            ${taskCount > 0 ? `<span class="day-indicator ${status}" title="${taskCount} task${taskCount > 1 ? 's' : ''}">${taskCount}</span>` : ''}
        </div>`;
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateStr = getLocalDateString(new Date(nextYear, nextMonth, day));
        const status = getFilteredDateStatus(dateStr);
        html += `<div class="calendar-day other-month${status ? ' has-tasks' : ''}" data-date="${dateStr}">
            <span class="day-number">${day}</span>
            ${status ? `<span class="day-indicator ${status}"></span>` : ''}
        </div>`;
    }

    html += '</div>';
    elements.calendarGrid.innerHTML = html;

    // Add click handlers
    elements.calendarGrid.querySelectorAll('.calendar-day').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const date = dayEl.dataset.date;
            openDayDetail(date);
        });
    });
}

function navigateCalendar(direction) {
    const newDate = new Date(state.calendarDate);
    newDate.setMonth(newDate.getMonth() + direction);
    state.calendarDate = newDate;
    renderCalendar();
}

function jumpToToday() {
    state.calendarDate = new Date();
    renderCalendar();
}

// ============================================
// CALENDAR FILTERS
// ============================================

function updateCalendarProjectFilter() {
    if (!elements.calendarProjectFilter) return;

    const currentValue = state.calendarFilter.projectId;
    elements.calendarProjectFilter.innerHTML = '<option value="">All Projects</option>';

    state.data.projects
        .filter(p => !p.archived)
        .forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            if (project.id === currentValue) option.selected = true;
            elements.calendarProjectFilter.appendChild(option);
        });
}

function updateCalendarTaskFilter() {
    if (!elements.calendarTaskFilter) return;

    const projectId = state.calendarFilter.projectId;
    elements.calendarTaskFilter.innerHTML = '<option value="">All Tasks</option>';

    if (!projectId) {
        elements.calendarTaskFilter.classList.add('hidden');
        return;
    }

    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    elements.calendarTaskFilter.classList.remove('hidden');

    project.tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.title;
        if (task.id === state.calendarFilter.taskId) option.selected = true;
        elements.calendarTaskFilter.appendChild(option);
    });
}

function handleCalendarProjectFilterChange() {
    const projectId = elements.calendarProjectFilter.value || null;
    state.calendarFilter.projectId = projectId;
    state.calendarFilter.taskId = null;
    updateCalendarTaskFilter();
    updateCalendarFilterResetBtn();
    renderCalendar();

    // Also update day detail if open
    if (state.selectedDate && !elements.dayDetailModal?.classList.contains('hidden')) {
        renderDayDetailTasks(state.selectedDate);
    }
}

function handleCalendarTaskFilterChange() {
    const taskId = elements.calendarTaskFilter.value || null;
    state.calendarFilter.taskId = taskId;
    updateCalendarFilterResetBtn();
    renderCalendar();

    // Also update day detail if open
    if (state.selectedDate && !elements.dayDetailModal?.classList.contains('hidden')) {
        renderDayDetailTasks(state.selectedDate);
    }
}

function resetCalendarFilter() {
    state.calendarFilter.projectId = null;
    state.calendarFilter.taskId = null;
    elements.calendarProjectFilter.value = '';
    elements.calendarTaskFilter.value = '';
    elements.calendarTaskFilter.classList.add('hidden');
    updateCalendarFilterResetBtn();
    renderCalendar();

    if (state.selectedDate && !elements.dayDetailModal?.classList.contains('hidden')) {
        renderDayDetailTasks(state.selectedDate);
    }
}

function updateCalendarFilterResetBtn() {
    if (!elements.calendarFilterReset) return;
    const hasFilter = state.calendarFilter.projectId || state.calendarFilter.taskId;
    elements.calendarFilterReset.classList.toggle('hidden', !hasFilter);
}

function getFilteredTasksForDate(date, includeCompleted = true) {
    let tasks = getTasksForDate(date, includeCompleted);

    // Apply calendar filter
    if (state.calendarFilter.projectId) {
        tasks = tasks.filter(t => t.projectId === state.calendarFilter.projectId);
    }

    if (state.calendarFilter.taskId) {
        tasks = tasks.filter(t => {
            // Match parent task or subtask of the selected task
            const taskId = t.taskId || t.id;
            return taskId === state.calendarFilter.taskId ||
                   (t.isSubtask && t.taskId === state.calendarFilter.taskId);
        });
    }

    return tasks;
}

// Get date status for filtered calendar indicators
function getFilteredDateStatus(date) {
    const today = getToday();
    const tasks = getFilteredTasksForDate(date, true);

    if (tasks.length === 0) return null;

    const completed = tasks.filter(t => t.completedOnDay || t.completed).length;
    const incomplete = tasks.length - completed;

    if (date < today) {
        if (incomplete > 0) return 'past-incomplete';
        return 'past-complete';
    } else if (date === today) {
        return 'today';
    } else {
        return 'future';
    }
}

// ============================================
// DAY DETAIL MODAL
// ============================================

function openDayDetail(date) {
    state.selectedDate = date;

    if (!elements.dayDetailModal) return;

    elements.dayDetailDate.textContent = formatDate(date);
    renderDayDetailTasks(date);

    // Load daily notes
    const notes = (state.data.dailyNotes || {})[date] || '';
    if (elements.dayDetailNotes) {
        elements.dayDetailNotes.value = notes;
    }

    elements.dayDetailModal.classList.remove('hidden');
}

function renderDayDetailTasks(date) {
    const tasks = getFilteredTasksForDate(date, true);

    elements.dayDetailTasks.innerHTML = '';

    if (tasks.length === 0) {
        elements.dayDetailTasks.innerHTML = '<p class="empty-state">No tasks scheduled for this day</p>';
        return;
    }

    tasks.forEach(task => {
        // Enable reschedule for all calendar day views (FEATURE 1)
        elements.dayDetailTasks.appendChild(createDailyTaskElement(task, date, true));
    });
}

function navigateDayDetail(direction) {
    const currentDate = getDateFromString(state.selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    const newDate = getLocalDateString(currentDate);
    state.selectedDate = newDate;
    elements.dayDetailDate.textContent = formatDate(newDate);
    renderDayDetailTasks(newDate);

    // Load notes for new date
    const notes = (state.data.dailyNotes || {})[newDate] || '';
    if (elements.dayDetailNotes) {
        elements.dayDetailNotes.value = notes;
    }
}

async function saveDailyNotes() {
    if (!state.selectedDate) return;

    const notes = elements.dayDetailNotes?.value?.trim() || '';

    if (!state.data.dailyNotes) {
        state.data.dailyNotes = {};
    }

    if (notes) {
        state.data.dailyNotes[state.selectedDate] = notes;
    } else {
        // Remove empty notes entry
        delete state.data.dailyNotes[state.selectedDate];
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    showToast('Notes saved', 'success');
}

// ============================================
// TEXT FORMATTING HELPERS
// ============================================

function linkifyText(text) {
    if (!text) return '';

    // First, handle markdown links: [text](url)
    let result = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="linked-url">$1</a>');

    // Then, handle bare URLs (that are not already part of an anchor tag)
    const urlPattern = /(?<!href="|>)(https?:\/\/[^\s<\)]+)/g;
    result = result.replace(urlPattern,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="linked-url">$1</a>');

    return result;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNotesWithLinks(text) {
    if (!text) return '';
    // First escape HTML to prevent XSS, then linkify
    const escaped = escapeHtml(text);
    return linkifyText(escaped);
}

// ============================================
// TASK ELEMENT CREATION
// ============================================

function createDailyTaskElement(task, date, allowReschedule = true) {
    const div = document.createElement('div');
    const isCompleted = task.completedOnDay || task.completed;
    div.className = `task-item ${isCompleted ? 'completed' : ''} priority-${task.priority || 'medium'}`;

    // Add draggable for reordering
    div.draggable = true;
    div.dataset.taskKey = getTaskKey(task);
    div.dataset.date = date;

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

    const completionInfo = isCompleted && (task.completionNotes || task.completionLinks) ? `
        <div class="task-completion-info">
            ${task.completionNotes ? `<span class="completion-note">${task.completionNotes}</span>` : ''}
            ${task.completionLinks ? `<a href="${task.completionLinks}" target="_blank" class="completion-link">${task.completionLinks}</a>` : ''}
        </div>
    ` : '';

    div.innerHTML = `
        <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-date="${date}"></div>
        <div class="task-content" data-action="view-details">
            <div class="task-title">${task.title}</div>
            <div class="task-meta">
                ${projectTag}
                ${subtaskIndicator}
                ${priorityBadge}
            </div>
            ${completionInfo}
        </div>
        <div class="task-actions">
            <button class="task-action-btn" data-action="view-details" title="View Details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
            ${allowReschedule ? `
                <button class="task-action-btn" data-action="reschedule" title="Reschedule">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </button>
            ` : ''}
            <button class="task-action-btn" data-action="remove-from-day" title="Remove from this day">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;

    // Checkbox click handler
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!isCompleted) {
            openCompleteModal(task, date);
        } else {
            await toggleDailyTaskComplete(task, date, false);
        }
    });

    // Action buttons
    div.querySelectorAll('.task-action-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            if (action === 'remove-from-day') {
                await removeTaskFromDay(task, date);
            } else if (action === 'reschedule') {
                openRescheduleModal(task, date);
            } else if (action === 'view-details') {
                openTaskDetailModal(task, date);
            }
        });
    });

    // Make task content clickable to open details
    const taskContent = div.querySelector('.task-content');
    taskContent.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskDetailModal(task, date);
    });
    taskContent.style.cursor = 'pointer';

    // Drag and drop handlers
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', getTaskKey(task));
        div.classList.add('dragging');
        state.draggedTaskKey = getTaskKey(task);
        state.draggedTaskDate = date;
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        state.draggedTaskKey = null;
        state.draggedTaskDate = null;
        // Remove all drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    div.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // Only show drop indicator if dragging within same date
        if (state.draggedTaskDate === date && state.draggedTaskKey !== getTaskKey(task)) {
            div.classList.add('drag-over');
        }
    });

    div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
    });

    div.addEventListener('drop', async (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');

        if (!state.draggedTaskKey || state.draggedTaskDate !== date) return;
        if (state.draggedTaskKey === getTaskKey(task)) return;

        // Reorder tasks
        await reorderTasks(date, state.draggedTaskKey, getTaskKey(task));
    });

    return div;
}

// Reorder tasks within a day
async function reorderTasks(date, draggedKey, targetKey) {
    const tasks = getTasksForDate(date, true);
    const currentOrder = tasks.map(t => getTaskKey(t));

    const draggedIndex = currentOrder.indexOf(draggedKey);
    const targetIndex = currentOrder.indexOf(targetKey);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedKey);

    // Save new order
    setTaskOrder(date, currentOrder);

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    renderAllViews();

    // Re-render day detail if open
    if (state.selectedDate === date) {
        renderDayDetailTasks(date);
    }
}

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
            <button class="task-action-btn" data-action="view-details" title="View Details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            </button>
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
    checkbox.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!task.completed) {
            openCompleteModal({ ...task, projectId: project.id }, null, true);
        } else {
            await toggleProjectTaskComplete(project.id, task.id, false);
        }
    });

    // Subtask checkbox handlers
    div.querySelectorAll('.subtask-item .task-checkbox').forEach(cb => {
        cb.addEventListener('click', async (e) => {
            e.stopPropagation();
            const subtaskId = cb.dataset.subtaskId;
            await toggleSubtaskComplete(project.id, task.id, subtaskId);
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
    if (!select) return;

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

// ============================================
// NAVIGATION
// ============================================

function switchView(viewName) {
    state.currentView = viewName;

    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Render specific views when switching
    if (viewName === 'calendar') {
        renderCalendar();
    } else if (viewName === 'previous') {
        renderPreviousView();
    }
}

// ============================================
// SCHEDULE MODAL
// ============================================

function openScheduleModal(projectId, taskId, subtaskId = null, taskTitle = '') {
    elements.scheduleProjectId.value = projectId;
    elements.scheduleTaskId.value = taskId;
    elements.scheduleSubtaskId.value = subtaskId || '';
    elements.scheduleTaskTitle.textContent = taskTitle;
    elements.scheduleCustomDate.value = getTomorrow();

    const project = state.data.projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    const hasSubtasks = task?.subtasks && task.subtasks.length > 0 && !subtaskId;

    elements.scheduleSubtasksOption.classList.toggle('hidden', !hasSubtasks);
    if (hasSubtasks) {
        elements.scheduleIncludeSubtasks.checked = true;
    }

    elements.scheduleModal.classList.remove('hidden');
}

// Helper: Compare subtaskId handling null/undefined equivalence
function subtaskIdMatches(a, b) {
    const normalizeId = (id) => (id === null || id === undefined || id === '') ? null : id;
    return normalizeId(a) === normalizeId(b);
}

// Helper: Generate unique key for a task for drag-and-drop
function getTaskKey(task) {
    if (task.isStandalone) {
        return `standalone:${task.id}`;
    }
    const subtaskPart = task.subtaskId ? `:${task.subtaskId}` : '';
    return `project:${task.projectId}:${task.taskId || task.id}${subtaskPart}`;
}

// Helper: Get task order for a date, initializing if needed
function getTaskOrder(date) {
    if (!state.data.taskOrder) {
        state.data.taskOrder = {};
    }
    return state.data.taskOrder[date] || [];
}

// Helper: Set task order for a date
function setTaskOrder(date, order) {
    if (!state.data.taskOrder) {
        state.data.taskOrder = {};
    }
    state.data.taskOrder[date] = order;
}

// Helper: Remove a specific task/subtask from ALL scheduled dates
function removeFromAllScheduledDates(projectId, taskId, subtaskId) {
    Object.keys(state.data.scheduledItems).forEach(date => {
        state.data.scheduledItems[date] = state.data.scheduledItems[date].filter(ref =>
            !(ref.projectId === projectId &&
              ref.taskId === taskId &&
              subtaskIdMatches(ref.subtaskId, subtaskId))
        );
        // Clean up empty date arrays
        if (state.data.scheduledItems[date].length === 0) {
            delete state.data.scheduledItems[date];
        }
    });
}

async function scheduleTaskForDate(date) {
    const projectId = elements.scheduleProjectId.value;
    const taskId = elements.scheduleTaskId.value;
    const subtaskId = elements.scheduleSubtaskId.value || null;
    const includeSubtasks = elements.scheduleIncludeSubtasks?.checked;

    // BUG 1 FIX: Remove from ALL other dates first (single-source-of-truth)
    removeFromAllScheduledDates(projectId, taskId, subtaskId);

    // Ensure the date array exists
    if (!state.data.scheduledItems[date]) {
        state.data.scheduledItems[date] = [];
    }

    // Add to new date
    state.data.scheduledItems[date].push({
        projectId,
        taskId,
        subtaskId,
        scheduledAt: new Date().toISOString(),
        completedOnDay: false
    });

    // Handle subtasks if requested
    if (includeSubtasks && !subtaskId) {
        const project = state.data.projects.find(p => p.id === projectId);
        const task = project?.tasks.find(t => t.id === taskId);
        if (task?.subtasks) {
            task.subtasks.forEach(st => {
                // Remove subtask from all other dates first
                removeFromAllScheduledDates(projectId, taskId, st.id);
                // Add to new date
                state.data.scheduledItems[date].push({
                    projectId,
                    taskId,
                    subtaskId: st.id,
                    scheduledAt: new Date().toISOString(),
                    completedOnDay: false
                });
            });
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();

    // Re-render project detail if open
    if (state.currentProject) {
        renderProjectDetail(state.currentProject);
    }

    showToast(`Task scheduled for ${formatShortDate(date)}`, 'success');
}

// ============================================
// RESCHEDULE MODAL
// ============================================

let rescheduleTask = null;
let rescheduleFromDate = null;

function openRescheduleModal(task, fromDate) {
    rescheduleTask = task;
    rescheduleFromDate = fromDate;

    if (!elements.rescheduleModal) return;

    elements.rescheduleTaskInfo.textContent = task.title;
    elements.rescheduleCustomDate.value = getTomorrow();
    elements.rescheduleModal.classList.remove('hidden');
}

async function rescheduleTaskToDate(newDate) {
    if (!rescheduleTask || !rescheduleFromDate) return;

    const projectId = rescheduleTask.projectId;
    const taskId = rescheduleTask.taskId || rescheduleTask.id;
    const subtaskId = rescheduleTask.subtaskId || null;

    if (rescheduleTask.isStandalone) {
        // Remove standalone task from old date
        if (state.data.dailyLists[rescheduleFromDate]) {
            state.data.dailyLists[rescheduleFromDate] = state.data.dailyLists[rescheduleFromDate].filter(
                t => t.id !== rescheduleTask.id
            );
            if (state.data.dailyLists[rescheduleFromDate].length === 0) {
                delete state.data.dailyLists[rescheduleFromDate];
            }
        }
        // Add to new date
        if (!state.data.dailyLists[newDate]) {
            state.data.dailyLists[newDate] = [];
        }
        // Create clean task object for new date
        const newTask = {
            id: rescheduleTask.id,
            title: rescheduleTask.title,
            description: rescheduleTask.description || '',
            priority: rescheduleTask.priority || 'medium',
            completed: false,
            completedAt: null,
            createdAt: rescheduleTask.createdAt || new Date().toISOString()
        };
        state.data.dailyLists[newDate].push(newTask);
    } else {
        // Project task: Remove from ALL dates (single-source-of-truth), then add to new date
        removeFromAllScheduledDates(projectId, taskId, subtaskId);

        if (!state.data.scheduledItems[newDate]) {
            state.data.scheduledItems[newDate] = [];
        }
        state.data.scheduledItems[newDate].push({
            projectId,
            taskId,
            subtaskId,
            scheduledAt: new Date().toISOString(),
            completedOnDay: false
        });
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();

    // Update day detail if open
    if (state.selectedDate) {
        renderDayDetailTasks(state.selectedDate);
    }

    showToast(`Task rescheduled to ${formatShortDate(newDate)}`, 'success');

    rescheduleTask = null;
    rescheduleFromDate = null;
}

// ============================================
// TASK DETAIL MODAL
// ============================================

let taskDetailTask = null;
let taskDetailDate = null;

function openTaskDetailModal(task, date) {
    taskDetailTask = task;
    taskDetailDate = date;

    if (!elements.taskDetailModal) return;

    // Set title
    elements.taskDetailTitle.textContent = task.title;

    // Set project tag
    if (task.projectName) {
        elements.taskDetailProject.textContent = task.projectName;
        elements.taskDetailProject.style.background = `${task.projectColor}20`;
        elements.taskDetailProject.style.color = task.projectColor;
        elements.taskDetailProject.classList.remove('hidden');
    } else {
        elements.taskDetailProject.classList.add('hidden');
    }

    // Set priority
    elements.taskDetailPriority.className = `task-priority priority-${task.priority || 'medium'}`;
    elements.taskDetailPriorityText.textContent = task.priority || 'medium';

    // Set description (with clickable links)
    elements.taskDetailDescription.innerHTML = formatNotesWithLinks(task.description || '');

    // Set notes and links from the actual task in the project
    let notes = '';
    let links = '';

    if (task.projectId && !task.isStandalone) {
        const actualTask = getActualTaskData(task);
        if (actualTask) {
            notes = actualTask.notes || '';
            links = actualTask.links || '';
        }
    } else if (task.isStandalone) {
        notes = task.notes || '';
        links = task.links || '';
    }

    elements.taskDetailNotes.value = notes;
    elements.taskDetailLinks.value = links;

    // Show completion info if completed
    const isCompleted = task.completedOnDay || task.completed;
    if (isCompleted) {
        elements.taskDetailCompletionInfo.classList.remove('hidden');
        const completedAt = task.completedAt || task.completionAt;
        elements.taskDetailCompletedAt.textContent = completedAt ?
            `Completed: ${formatDate(completedAt)}` : 'Completed';
        const compNotes = task.completionNotes || '';
        elements.taskDetailCompletionNotes.innerHTML = compNotes ?
            `Completion notes: ${formatNotesWithLinks(compNotes)}` : '';
    } else {
        elements.taskDetailCompletionInfo.classList.add('hidden');
    }

    // Store task data for saving
    elements.taskDetailData.value = JSON.stringify({
        projectId: task.projectId,
        taskId: task.taskId || task.id,
        subtaskId: task.subtaskId,
        isStandalone: task.isStandalone,
        date: date
    });

    elements.taskDetailModal.classList.remove('hidden');
}

function getActualTaskData(task) {
    if (!task.projectId) return null;

    const project = state.data.projects.find(p => p.id === task.projectId);
    if (!project) return null;

    const taskId = task.taskId || task.id;
    const actualTask = project.tasks.find(t => t.id === taskId);
    if (!actualTask) return null;

    if (task.subtaskId) {
        return (actualTask.subtasks || []).find(st => st.id === task.subtaskId);
    }

    return actualTask;
}

async function saveTaskNotes() {
    if (!taskDetailTask) return;

    const taskData = JSON.parse(elements.taskDetailData.value);
    const notes = elements.taskDetailNotes.value;
    const links = elements.taskDetailLinks.value;

    if (taskData.isStandalone) {
        // Update standalone task
        const dailyList = state.data.dailyLists[taskData.date] || [];
        const task = dailyList.find(t => t.id === taskData.taskId);
        if (task) {
            task.notes = notes;
            task.links = links;
        }
    } else {
        // Update project task
        const project = state.data.projects.find(p => p.id === taskData.projectId);
        if (project) {
            const task = project.tasks.find(t => t.id === taskData.taskId);
            if (task) {
                if (taskData.subtaskId) {
                    const subtask = (task.subtasks || []).find(st => st.id === taskData.subtaskId);
                    if (subtask) {
                        subtask.notes = notes;
                        subtask.links = links;
                    }
                } else {
                    task.notes = notes;
                    task.links = links;
                }
            }
        }
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    closeAllModals();
    renderAllViews();

    if (state.currentProject) {
        renderProjectDetail(state.currentProject);
    }

    if (state.selectedDate) {
        renderDayDetailTasks(state.selectedDate);
    }

    showToast('Notes saved', 'success');

    taskDetailTask = null;
    taskDetailDate = null;
}

async function removeTaskFromDay(task, date, silent = false) {
    console.log('removeTaskFromDay called:', { task, date, silent }); // Debug log

    if (task.isStandalone) {
        // Remove standalone task from this specific date
        if (state.data.dailyLists[date]) {
            const before = state.data.dailyLists[date].length;
            state.data.dailyLists[date] = state.data.dailyLists[date].filter(t => t.id !== task.id);
            const after = state.data.dailyLists[date].length;
            console.log(`Standalone removal: ${before} -> ${after}`); // Debug log

            // Clean up empty arrays
            if (state.data.dailyLists[date].length === 0) {
                delete state.data.dailyLists[date];
            }
        }
    } else {
        // Project task: Remove from this specific date only
        const projectId = task.projectId;
        const taskId = task.taskId || task.id;
        const subtaskId = task.subtaskId;

        console.log('Removing project task:', { projectId, taskId, subtaskId }); // Debug log

        if (state.data.scheduledItems[date]) {
            const before = state.data.scheduledItems[date].length;
            state.data.scheduledItems[date] = state.data.scheduledItems[date].filter(ref => {
                const matches = ref.projectId === projectId &&
                               ref.taskId === taskId &&
                               subtaskIdMatches(ref.subtaskId, subtaskId);
                console.log('Checking ref:', ref, 'matches:', matches); // Debug log
                return !matches;
            });
            const after = state.data.scheduledItems[date].length;
            console.log(`Project task removal: ${before} -> ${after}`); // Debug log

            // Clean up empty arrays
            if (state.data.scheduledItems[date].length === 0) {
                delete state.data.scheduledItems[date];
            }
        }
    }

    if (!silent) {
        state.data.lastUpdated = new Date().toISOString();
        await saveData();
        renderAllViews();

        if (state.selectedDate) {
            renderDayDetailTasks(state.selectedDate);
        }

        showToast('Task removed from day', 'success');
    }
}

// ============================================
// TASK ACTIONS
// ============================================

function handleProjectTaskAction(action, task, project) {
    switch (action) {
        case 'view-details':
            openTaskDetailModal({
                ...task,
                projectId: project.id,
                projectName: project.name,
                projectColor: project.color
            }, null);
            break;
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
        taskId: task.taskId || task.id,
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
    if (elements.taskProject) {
        elements.taskProject.disabled = false;
    }
    if (elements.taskParentId) {
        elements.taskParentId.value = '';
    }
}

async function saveTask(e) {
    e.preventDefault();

    // Prevent duplicate submission
    if (state.isSubmitting) return;
    state.isSubmitting = true;

    try {
        await saveTaskInternal();
    } finally {
        state.isSubmitting = false;
    }
}

async function saveTaskInternal() {
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
        const project = state.data.projects.find(p => p.id === projectId);
        if (project) {
            const parentTask = project.tasks.find(t => t.id === parentId);
            if (parentTask) {
                if (!parentTask.subtasks) parentTask.subtasks = [];
                parentTask.subtasks.push(taskData);

                if (scheduledDate) {
                    // BUG 2 FIX: Remove subtask from all other dates first
                    removeFromAllScheduledDates(projectId, parentId, taskId);

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

            if (scheduledDate && existingIndex < 0) {
                // BUG 2 FIX: Remove from all other dates first (single day only)
                removeFromAllScheduledDates(projectId, taskId, null);

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

    // Close task modal but keep day detail modal open if it was showing
    const dayDetailWasOpen = state.selectedDate && !elements.dayDetailModal?.classList.contains('hidden');

    closeAllModals();
    renderAllViews();

    if (state.currentProject) {
        renderProjectDetail(state.currentProject);
    }

    // Reopen day detail if it was open when we started
    if (dayDetailWasOpen) {
        openDayDetail(state.selectedDate);
    }

    showToast('Task saved', 'success');
}

async function completeTask(e) {
    e.preventDefault();

    // Prevent duplicate submission
    if (state.isSubmitting) return;
    state.isSubmitting = true;

    try {
        const taskInfo = JSON.parse(elements.completeTaskId.value);
        const notes = elements.completeNotes.value;
        const links = elements.completeLinks.value;

        if (taskInfo.isProjectTask) {
            await toggleProjectTaskComplete(taskInfo.projectId, taskInfo.id, true, notes, links);
        } else if (taskInfo.isStandalone) {
            await toggleStandaloneTaskComplete(taskInfo.id, taskInfo.date, true, notes, links);
        } else {
            await toggleDailyTaskComplete(taskInfo, taskInfo.date, true, notes, links);
        }

        closeAllModals();
    } finally {
        state.isSubmitting = false;
    }
}

async function toggleDailyTaskComplete(task, date, completed, notes = '', links = '') {
    console.log('toggleDailyTaskComplete called:', { task, date, completed }); // Debug log

    if (task.isStandalone) {
        await toggleStandaloneTaskComplete(task.id, date, completed, notes, links);
        return;
    }

    const projectId = task.projectId;
    const taskId = task.taskId || task.id;
    const subtaskId = task.subtaskId;

    const scheduledItems = state.data.scheduledItems[date] || [];
    const ref = scheduledItems.find(r =>
        r.projectId === projectId &&
        r.taskId === taskId &&
        subtaskIdMatches(r.subtaskId, subtaskId)
    );

    console.log('Found ref:', ref); // Debug log

    if (ref) {
        ref.completedOnDay = completed;
        if (completed) {
            ref.completedAt = new Date().toISOString();
            ref.completionNotes = notes;
            ref.completionLinks = links;

            if (task.isSubtask || subtaskId) {
                await markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed);
            } else {
                await markTaskCompleteInProject(projectId, taskId, completed, notes, links);
            }

            state.data.completedTasks.push({
                projectId,
                taskId,
                subtaskId,
                title: task.title,
                completedAt: new Date().toISOString(),
                completionNotes: notes,
                completionLinks: links,
                date: date
            });
        } else {
            ref.completedAt = null;
            ref.completionNotes = null;
            ref.completionLinks = null;

            if (task.isSubtask || subtaskId) {
                await markSubtaskCompleteInProject(projectId, taskId, subtaskId, false);
            } else {
                await markTaskCompleteInProject(projectId, taskId, false);
            }
        }
    } else {
        // Task not found in scheduledItems - might be a project task not scheduled
        // Still allow completion via project
        console.log('Task not in scheduledItems, completing via project directly');
        if (task.isSubtask || subtaskId) {
            await markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed);
        } else {
            await markTaskCompleteInProject(projectId, taskId, completed, notes, links);
        }

        if (completed) {
            state.data.completedTasks.push({
                projectId,
                taskId,
                subtaskId,
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

    if (state.selectedDate) {
        renderDayDetailTasks(state.selectedDate);
    }

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

    if (state.selectedDate) {
        renderDayDetailTasks(state.selectedDate);
    }

    showToast(completed ? 'Task completed!' : 'Task reopened', 'success');
}

async function toggleProjectTaskComplete(projectId, taskId, completed, notes = '', links = '') {
    console.log('toggleProjectTaskComplete called:', { projectId, taskId, completed }); // Debug log

    await markTaskCompleteInProject(projectId, taskId, completed, notes, links);

    if (completed) {
        const project = state.data.projects.find(p => p.id === projectId);
        const task = project?.tasks.find(t => t.id === taskId);

        state.data.completedTasks.push({
            projectId,
            taskId,
            subtaskId: null,
            title: task?.title || 'Unknown task',
            completedAt: new Date().toISOString(),
            completionNotes: notes,
            completionLinks: links
        });
    }

    // Also update any scheduled references for this task (not subtasks)
    Object.entries(state.data.scheduledItems || {}).forEach(([date, items]) => {
        items.forEach(ref => {
            if (ref.projectId === projectId && ref.taskId === taskId && subtaskIdMatches(ref.subtaskId, null)) {
                ref.completedOnDay = completed;
                if (completed) {
                    ref.completedAt = new Date().toISOString();
                    ref.completionNotes = notes;
                    ref.completionLinks = links;
                } else {
                    ref.completedAt = null;
                    ref.completionNotes = null;
                    ref.completionLinks = null;
                }
            }
        });
    });

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

    // Note: Parent task completion is now handled separately - no auto-complete
}

async function toggleSubtaskComplete(projectId, taskId, subtaskId) {
    console.log('toggleSubtaskComplete called:', { projectId, taskId, subtaskId }); // Debug log

    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) {
        console.log('Project not found:', projectId);
        return;
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) {
        console.log('Task or subtasks not found:', taskId);
        return;
    }

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
        console.log('Subtask not found:', subtaskId);
        return;
    }

    const newCompleted = !subtask.completed;
    await markSubtaskCompleteInProject(projectId, taskId, subtaskId, newCompleted);

    // Update all scheduled references for this subtask
    Object.values(state.data.scheduledItems || {}).forEach(items => {
        items.forEach(ref => {
            if (ref.projectId === projectId && ref.taskId === taskId && subtaskIdMatches(ref.subtaskId, subtaskId)) {
                ref.completedOnDay = newCompleted;
                if (newCompleted) {
                    ref.completedAt = new Date().toISOString();
                } else {
                    ref.completedAt = null;
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

    showToast(newCompleted ? 'Subtask completed!' : 'Subtask reopened', 'success');
}

async function deleteProjectTask(projectId, taskId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (project) {
        project.tasks = project.tasks.filter(t => t.id !== taskId);

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

// ============================================
// PROJECT ACTIONS
// ============================================

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

// ============================================
// EXPORT
// ============================================

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

    // Get daily notes for the month
    const dailyNotesForMonth = {};
    if (state.data.dailyNotes) {
        Object.entries(state.data.dailyNotes).forEach(([date, notes]) => {
            const noteDate = getDateFromString(date);
            if (noteDate >= startDate && noteDate <= endDate) {
                dailyNotesForMonth[date] = notes;
            }
        });
    }

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

        // Add daily notes
        const notesDates = Object.keys(dailyNotesForMonth).sort();
        if (notesDates.length > 0) {
            content += `## Daily Notes\n\n`;
            notesDates.forEach(date => {
                content += `### ${formatDate(date)}\n\n`;
                content += `${dailyNotesForMonth[date]}\n\n`;
            });
        }
    } else if (format === 'json') {
        content = JSON.stringify({ month: monthName, tasks: completedInMonth, dailyNotes: dailyNotesForMonth }, null, 2);
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

        // Add daily notes (plain text)
        const notesDatesText = Object.keys(dailyNotesForMonth).sort();
        if (notesDatesText.length > 0) {
            content += `\nDaily Notes\n${'='.repeat(40)}\n\n`;
            notesDatesText.forEach(date => {
                content += `${formatDate(date)}\n${'-'.repeat(20)}\n`;
                content += `${dailyNotesForMonth[date]}\n\n`;
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

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
    // Auth
    elements.authBtn?.addEventListener('click', handleLogin);
    elements.logoutBtn?.addEventListener('click', handleLogout);

    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // Add buttons
    document.getElementById('add-task-btn')?.addEventListener('click', () => openTaskModal());
    document.getElementById('add-project-btn')?.addEventListener('click', () => openProjectModal());
    document.getElementById('add-project-task-btn')?.addEventListener('click', () => {
        openTaskModal(null, state.currentProject);
    });
    document.getElementById('add-progress-btn')?.addEventListener('click', openProgressModal);
    document.getElementById('archive-project-btn')?.addEventListener('click', archiveProject);
    document.getElementById('back-to-projects')?.addEventListener('click', () => switchView('projects'));
    elements.exportBtn?.addEventListener('click', openExportModal);

    // Forms
    elements.taskForm?.addEventListener('submit', saveTask);
    elements.completeForm?.addEventListener('submit', completeTask);
    elements.projectForm?.addEventListener('submit', saveProject);
    elements.progressForm?.addEventListener('submit', saveProgress);
    elements.exportForm?.addEventListener('submit', exportReport);

    // Schedule dropdown
    elements.taskSchedule?.addEventListener('change', () => {
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

    elements.scheduleCustomBtn?.addEventListener('click', () => {
        const date = elements.scheduleCustomDate.value;
        if (date) {
            scheduleTaskForDate(date);
        } else {
            showToast('Please select a date', 'error');
        }
    });

    // Previous date navigation
    elements.previousDatePrev?.addEventListener('click', () => navigatePreviousDate(-1));
    elements.previousDateNext?.addEventListener('click', () => navigatePreviousDate(1));
    elements.previousDateInput?.addEventListener('change', (e) => selectPreviousDate(e.target.value));

    // Calendar navigation
    elements.calendarPrevBtn?.addEventListener('click', () => navigateCalendar(-1));
    elements.calendarNextBtn?.addEventListener('click', () => navigateCalendar(1));
    elements.calendarTodayBtn?.addEventListener('click', jumpToToday);

    // Calendar filters
    elements.calendarProjectFilter?.addEventListener('change', handleCalendarProjectFilterChange);
    elements.calendarTaskFilter?.addEventListener('change', handleCalendarTaskFilterChange);
    elements.calendarFilterReset?.addEventListener('click', resetCalendarFilter);

    // Day detail navigation
    elements.dayDetailPrevBtn?.addEventListener('click', () => navigateDayDetail(-1));
    elements.dayDetailNextBtn?.addEventListener('click', () => navigateDayDetail(1));
    elements.dayDetailSaveNotes?.addEventListener('click', saveDailyNotes);
    elements.dayDetailAddBtn?.addEventListener('click', () => {
        // Open task modal for adding to this specific date
        openTaskModal();
        elements.taskSchedule.value = 'custom';
        elements.customDateGroup.classList.remove('hidden');
        elements.taskCustomDate.value = state.selectedDate;
    });

    // Reschedule modal buttons
    document.querySelectorAll('#reschedule-modal .schedule-option').forEach(btn => {
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
                rescheduleTaskToDate(date);
            }
        });
    });

    elements.rescheduleCustomBtn?.addEventListener('click', () => {
        const date = elements.rescheduleCustomDate.value;
        if (date) {
            rescheduleTaskToDate(date);
        } else {
            showToast('Please select a date', 'error');
        }
    });

    // Task detail save button
    elements.taskDetailSaveBtn?.addEventListener('click', saveTaskNotes);

    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);

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

// ============================================
// INITIALIZE APP
// ============================================

function init() {
    initElements();
    initEventListeners();
    initAuth();
}

document.addEventListener('DOMContentLoaded', init);
