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
    },
    calendarViewMode: 'month', // 'month' or 'week'
    weekStartDate: null
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
        exportIncludeSubtasks: document.getElementById('export-include-subtasks'),
        exportIncludeDailyAppendix: document.getElementById('export-include-daily-appendix'),
        exportIncludeIncomplete: document.getElementById('export-include-incomplete'),
        exportIncludePlanned: document.getElementById('export-include-planned'),
        // AI Summary
        aiSettingsToggle: document.getElementById('ai-settings-toggle'),
        aiSettingsPanel: document.getElementById('ai-settings-panel'),
        anthropicApiKey: document.getElementById('anthropic-api-key'),
        saveApiKeyBtn: document.getElementById('save-api-key-btn'),
        aiSummaryStatus: document.getElementById('ai-summary-status'),
        aiStatusText: document.getElementById('ai-status-text'),
        generateAiSummaryBtn: document.getElementById('generate-ai-summary-btn'),
        aiSummaryContent: document.getElementById('ai-summary-content'),
        aiSummaryText: document.getElementById('ai-summary-text'),
        exportIncludeAiSummary: document.getElementById('export-include-ai-summary'),
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
        // Today and Previous daily notes
        todayNotes: document.getElementById('today-notes'),
        todayNotesPreview: document.getElementById('today-notes-preview'),
        todayNotesSave: document.getElementById('today-notes-save'),
        previousNotes: document.getElementById('previous-notes'),
        previousNotesPreview: document.getElementById('previous-notes-preview'),
        previousNotesSave: document.getElementById('previous-notes-save'),
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
        taskDetailNotesPreview: document.getElementById('task-detail-notes-preview'),
        taskDetailLinks: document.getElementById('task-detail-links'),
        taskDetailLinkPreview: document.getElementById('task-detail-link-preview'),
        taskDetailCompletionInfo: document.getElementById('task-detail-completion-info'),
        taskDetailCompletedAt: document.getElementById('task-detail-completed-at'),
        taskDetailCompletionNotes: document.getElementById('task-detail-completion-notes'),
        taskDetailSaveBtn: document.getElementById('task-detail-save-btn'),
        // Time pickers
        taskTimeGroup: document.getElementById('task-time-group'),
        taskTimeToggle: document.getElementById('task-time-toggle'),
        taskTime: document.getElementById('task-time'),
        scheduleTimeToggle: document.getElementById('schedule-time-toggle'),
        scheduleTime: document.getElementById('schedule-time'),
        rescheduleTimeToggle: document.getElementById('reschedule-time-toggle'),
        rescheduleTime: document.getElementById('reschedule-time'),
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
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(dateInput) {
    let date;
    if (typeof dateInput === 'string') {
        // Check if it's an ISO timestamp (contains 'T') or just a date string (YYYY-MM-DD)
        if (dateInput.includes('T')) {
            date = new Date(dateInput);
        } else {
            date = getDateFromString(dateInput);
        }
    } else {
        date = new Date(dateInput);
    }
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatShortDate(dateInput) {
    let date;
    if (typeof dateInput === 'string') {
        // Check if it's an ISO timestamp (contains 'T') or just a date string (YYYY-MM-DD)
        if (dateInput.includes('T')) {
            date = new Date(dateInput);
        } else {
            date = getDateFromString(dateInput);
        }
    } else {
        date = new Date(dateInput);
    }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// ============================================
// TIME UTILITY FUNCTIONS
// ============================================

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function getTaskTime(task) {
    return task.scheduledRef?.time || task.time || null;
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
        const jsonString = JSON.stringify(state.data, null, 2);
        const content = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));

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

    // Sort tasks: saved order first, then timed items (chronological), then untimed (incomplete first, then priority)
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

        // Timed items come before untimed
        const aTime = getTaskTime(a);
        const bTime = getTaskTime(b);
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;
        // Both timed: sort chronologically
        if (aTime && bTime) return aTime.localeCompare(bTime);

        // Both untimed: incomplete first, then by priority
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
    renderCalendarView();
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

    // Load daily notes for today
    const todayNotes = state.data.dailyNotes?.[today] || '';
    if (elements.todayNotes) {
        elements.todayNotes.value = todayNotes;
    }
    if (elements.todayNotesPreview) {
        elements.todayNotesPreview.innerHTML = todayNotes ? formatNotesWithLinks(todayNotes) : '';
    }
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

    // Load daily notes for the selected previous date
    const previousNotes = state.data.dailyNotes?.[date] || '';
    if (elements.previousNotes) {
        elements.previousNotes.value = previousNotes;
    }
    if (elements.previousNotesPreview) {
        elements.previousNotesPreview.innerHTML = previousNotes ? formatNotesWithLinks(previousNotes) : '';
    }
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

    // Get saved task order for this project
    const savedOrder = getProjectTaskOrder(projectId);

    // Sort tasks by saved order, with unsaved tasks at the end
    const sortByOrder = (tasks) => {
        return tasks.sort((a, b) => {
            const aIndex = savedOrder.indexOf(a.id);
            const bIndex = savedOrder.indexOf(b.id);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0; // Keep original order for unsaved tasks
        });
    };

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

    // Sort both lists by saved order
    sortByOrder(activeTasks);
    sortByOrder(completedTasks);

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

// Helper: Render day cell content (simple view)
function renderDayContent(dateStr, dayNum, isOtherMonth) {
    const tasks = getFilteredTasksForDate(dateStr, true);
    const status = getFilteredDateStatus(dateStr);
    const today = getToday();
    const isToday = dateStr === today;

    let classes = 'calendar-day';
    if (isOtherMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    if (status) classes += ' has-tasks';

    return `<div class="${classes}" data-date="${dateStr}">
        <span class="day-number">${dayNum}</span>
        ${tasks.length > 0 ? `<span class="day-indicator ${status}" title="${tasks.length} task${tasks.length > 1 ? 's' : ''}">${tasks.length}</span>` : ''}
    </div>`;
}

function renderCalendar() {
    if (!elements.calendarGrid || !elements.calendarMonthYear) return;

    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();

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
        html += renderDayContent(dateStr, day, true);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = getLocalDateString(new Date(year, month, day));
        html += renderDayContent(dateStr, day, false);
    }

    // Next month days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const dateStr = getLocalDateString(new Date(nextYear, nextMonth, day));
        html += renderDayContent(dateStr, day, true);
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

// ============================================
// WEEK VIEW
// ============================================

// Get Sunday of the week containing the given date
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
}

// Get array of 7 date strings for the week
function getWeekDates(startDate) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        dates.push(getLocalDateString(d));
    }
    return dates;
}

// Main render function for week view
function renderWeekView() {
    const weekContainer = document.getElementById('week-view-grid');
    if (!weekContainer) return;

    // Initialize weekStartDate if not set
    if (!state.weekStartDate) {
        state.weekStartDate = getWeekStart(state.calendarDate);
    }

    const weekDates = getWeekDates(state.weekStartDate);
    const today = getToday();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Update month/year display to show week range
    const startDate = new Date(weekDates[0]);
    const endDate = new Date(weekDates[6]);
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const year = startDate.getFullYear();

    if (startMonth === endMonth) {
        elements.calendarMonthYear.textContent = `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}, ${year}`;
    } else {
        elements.calendarMonthYear.textContent = `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`;
    }

    let html = '<div class="week-view-grid">';

    // Combined header + column for each day
    weekDates.forEach((dateStr, i) => {
        const d = new Date(dateStr);
        const isToday = dateStr === today;
        const dayNum = d.getDate();
        const tasks = getFilteredTasksForDate(dateStr, true);

        html += `<div class="week-day-wrapper${isToday ? ' today' : ''}" data-date="${dateStr}">
            <div class="week-day-header" data-date="${dateStr}">
                <span class="week-day-name">${dayNames[i]}</span>
                <span class="week-day-number">${dayNum}</span>
            </div>
            <div class="week-day-tasks" data-date="${dateStr}">`;

        tasks.forEach(task => {
            html += createWeekTaskItemHTML(task, dateStr);
        });

        html += `</div>
            <button class="week-add-task-btn" data-date="${dateStr}" title="Add task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </button>
        </div>`;
    });

    html += '</div>';

    weekContainer.innerHTML = html;
    bindWeekViewEvents();
}

// Create HTML for a task item in week view
function createWeekTaskItemHTML(task, date) {
    const isCompleted = task.completedOnDay || task.completed;
    const color = task.projectColor || 'var(--color-primary)';
    const taskKey = getTaskKey(task);
    const taskTime = getTaskTime(task);
    const timePrefix = taskTime ? `<span class="week-task-time">${formatTime(taskTime)}</span>` : '';

    return `<div class="week-task-item${isCompleted ? ' completed' : ''}"
        draggable="true"
        data-task-key="${taskKey}"
        data-date="${date}"
        style="--task-color: ${color}">
        ${timePrefix}
        <span class="week-task-title">${escapeHtml(task.title)}</span>
    </div>`;
}

// Bind events for week view interactions
function bindWeekViewEvents() {
    const weekContainer = document.getElementById('week-view-grid');
    if (!weekContainer) return;

    // Click on day header to open day detail
    weekContainer.querySelectorAll('.week-day-header').forEach(header => {
        header.addEventListener('click', () => {
            openDayDetail(header.dataset.date);
        });
    });

    // Click on task to view details
    weekContainer.querySelectorAll('.week-task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.week-task-item').classList.contains('dragging')) return;
            const taskKey = item.dataset.taskKey;
            const date = item.dataset.date;
            const task = findTaskByKey(taskKey, date);
            if (task) {
                openTaskDetailModal(task, date);
            }
        });
    });

    // Click add button to open day detail for adding tasks
    weekContainer.querySelectorAll('.week-add-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openDayDetail(btn.dataset.date);
        });
    });

    // Drag and drop handlers
    weekContainer.querySelectorAll('.week-task-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            state.draggedTaskKey = item.dataset.taskKey;
            state.draggedTaskDate = item.dataset.date;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            state.draggedTaskKey = null;
            state.draggedTaskDate = null;
            // Remove all drop-target classes
            weekContainer.querySelectorAll('.drop-target').forEach(el => {
                el.classList.remove('drop-target');
            });
        });
    });

    // Drop zones
    weekContainer.querySelectorAll('.week-day-tasks').forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drop-target');
        });

        zone.addEventListener('dragleave', (e) => {
            // Only remove if leaving the zone entirely
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drop-target');
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drop-target');

            const targetDate = zone.dataset.date;
            const sourceDate = state.draggedTaskDate;
            const taskKey = state.draggedTaskKey;

            if (taskKey && sourceDate !== targetDate) {
                rescheduleTaskByKey(taskKey, sourceDate, targetDate);
            }
        });
    });
}

// Find task by key from a specific date
function findTaskByKey(taskKey, date) {
    const tasks = getFilteredTasksForDate(date, true);
    return tasks.find(t => getTaskKey(t) === taskKey);
}

// Reschedule a task from one date to another
function rescheduleTaskByKey(taskKey, fromDate, toDate) {
    // Parse the task key
    const parts = taskKey.split(':');
    const taskType = parts[0];

    if (taskType === 'standalone') {
        // Handle standalone task
        const taskId = parts[1];
        const fromList = state.data.dailyLists[fromDate] || [];
        const taskIndex = fromList.findIndex(t => t.id === taskId && t.isStandalone);

        if (taskIndex === -1) return;

        const task = fromList.splice(taskIndex, 1)[0];

        if (!state.data.dailyLists[toDate]) {
            state.data.dailyLists[toDate] = [];
        }
        state.data.dailyLists[toDate].push(task);

    } else if (taskType === 'project') {
        // Handle project task or subtask
        const projectId = parts[1];
        const taskId = parts[2];
        const subtaskId = parts[3] || null;

        // Remove from source date's scheduled items
        const fromItems = state.data.scheduledItems[fromDate] || [];
        const itemIndex = fromItems.findIndex(item => {
            if (subtaskId) {
                return item.projectId === projectId && item.taskId === taskId && item.subtaskId === subtaskId;
            }
            return item.projectId === projectId && item.taskId === taskId && !item.subtaskId;
        });

        if (itemIndex === -1) return;

        const item = fromItems.splice(itemIndex, 1)[0];

        // Add to target date's scheduled items
        if (!state.data.scheduledItems[toDate]) {
            state.data.scheduledItems[toDate] = [];
        }
        state.data.scheduledItems[toDate].push(item);
    }

    // Save and re-render
    saveData();
    renderCalendarView();
    showToast('Task rescheduled', 'success');
}

// View switching functions
function setCalendarViewMode(mode) {
    if (mode !== 'month' && mode !== 'week') return;

    state.calendarViewMode = mode;

    // Update toggle buttons
    document.getElementById('calendar-view-month')?.classList.toggle('active', mode === 'month');
    document.getElementById('calendar-view-week')?.classList.toggle('active', mode === 'week');

    // Show/hide appropriate containers
    const monthGrid = elements.calendarGrid;
    const weekGrid = document.getElementById('week-view-grid');

    if (monthGrid) monthGrid.classList.toggle('hidden', mode === 'week');
    if (weekGrid) weekGrid.classList.toggle('hidden', mode === 'month');

    // Sync week start date with current calendar date
    if (mode === 'week') {
        state.weekStartDate = getWeekStart(state.calendarDate);
    }

    renderCalendarView();
}

// Dispatcher that renders the correct view
function renderCalendarView() {
    if (state.calendarViewMode === 'week') {
        renderWeekView();
    } else {
        renderCalendar();
    }
}

function navigateCalendar(direction) {
    if (state.calendarViewMode === 'week') {
        // Navigate by week
        const newDate = new Date(state.weekStartDate);
        newDate.setDate(newDate.getDate() + (direction * 7));
        state.weekStartDate = newDate;
        state.calendarDate = new Date(newDate);
    } else {
        // Navigate by month
        const newDate = new Date(state.calendarDate);
        newDate.setMonth(newDate.getMonth() + direction);
        state.calendarDate = newDate;
    }
    renderCalendarView();
}

function jumpToToday() {
    state.calendarDate = new Date();
    if (state.calendarViewMode === 'week') {
        state.weekStartDate = getWeekStart(state.calendarDate);
    }
    renderCalendarView();
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
    renderCalendarView();

    // Also update day detail if open
    if (state.selectedDate && !elements.dayDetailModal?.classList.contains('hidden')) {
        renderDayDetailTasks(state.selectedDate);
    }
}

function handleCalendarTaskFilterChange() {
    const taskId = elements.calendarTaskFilter.value || null;
    state.calendarFilter.taskId = taskId;
    updateCalendarFilterResetBtn();
    renderCalendarView();

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
    renderCalendarView();

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

async function saveTodayNotes() {
    const today = getToday();
    const notes = elements.todayNotes?.value?.trim() || '';

    if (!state.data.dailyNotes) {
        state.data.dailyNotes = {};
    }

    if (notes) {
        state.data.dailyNotes[today] = notes;
    } else {
        delete state.data.dailyNotes[today];
    }

    // Update preview
    if (elements.todayNotesPreview) {
        elements.todayNotesPreview.innerHTML = notes ? formatNotesWithLinks(notes) : '';
    }

    state.data.lastUpdated = new Date().toISOString();
    await saveData();
    showToast('Notes saved', 'success');
}

async function savePreviousNotes() {
    const date = state.selectedPreviousDate || getYesterday();
    const notes = elements.previousNotes?.value?.trim() || '';

    if (!state.data.dailyNotes) {
        state.data.dailyNotes = {};
    }

    if (notes) {
        state.data.dailyNotes[date] = notes;
    } else {
        delete state.data.dailyNotes[date];
    }

    // Update preview
    if (elements.previousNotesPreview) {
        elements.previousNotesPreview.innerHTML = notes ? formatNotesWithLinks(notes) : '';
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

    const taskTime = getTaskTime(task);
    if (taskTime) console.log('[TaskRender] Task:', task.title, 'Time:', taskTime, 'scheduledRef:', task.scheduledRef, 'task.time:', task.time);
    const formattedTime = taskTime ? formatTime(taskTime) : '';
    const timeBadge = formattedTime ? `
        <span class="task-time-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${formattedTime}
        </span>
    ` : '';
    const timePrefix = formattedTime ? `<span class="task-time-prefix">${formattedTime}</span> ` : '';

    const completionInfo = isCompleted && (task.completionNotes || task.completionLinks) ? `
        <div class="task-completion-info">
            ${task.completionNotes ? `<span class="completion-note">${task.completionNotes}</span>` : ''}
            ${task.completionLinks ? `<a href="${task.completionLinks}" target="_blank" class="completion-link">${task.completionLinks}</a>` : ''}
        </div>
    ` : '';

    div.innerHTML = `
        <div class="task-checkbox ${isCompleted ? 'checked' : ''}" data-date="${date}"></div>
        <div class="task-content" data-action="view-details">
            <div class="task-title">${timePrefix}${task.title}</div>
            <div class="task-meta">
                ${timeBadge}
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
    div.dataset.projectId = project.id;
    div.draggable = true;

    const scheduledDates = getScheduledDatesForTask(project.id, task.id);
    const scheduledBadge = scheduledDates.length > 0 ? `
        <div class="task-scheduled-dates">
            ${scheduledDates.map(d => `<span class="task-scheduled-badge">${formatShortDate(d)}</span>`).join('')}
        </div>
    ` : '';

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0;

    // Sort subtasks by saved order
    let sortedSubtasks = [];
    if (hasSubtasks) {
        const savedSubtaskOrder = getSubtaskOrder(project.id, task.id);
        sortedSubtasks = [...task.subtasks].sort((a, b) => {
            const aIndex = savedSubtaskOrder.indexOf(a.id);
            const bIndex = savedSubtaskOrder.indexOf(b.id);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0;
        });
    }

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
                    ${sortedSubtasks.map(st => createSubtaskHTML(st, task, project)).join('')}
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

    // Subtask view details buttons and title click
    div.querySelectorAll('.subtask-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const subtaskId = btn.dataset.subtaskId;
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                openTaskDetailModal({
                    ...subtask,
                    projectId: project.id,
                    projectName: project.name,
                    projectColor: project.color,
                    taskId: task.id,
                    subtaskId: subtask.id,
                    isSubtask: true
                }, null);
            }
        });
    });

    // Make subtask titles clickable
    div.querySelectorAll('.subtask-title').forEach(title => {
        title.style.cursor = 'pointer';
        title.addEventListener('click', (e) => {
            e.stopPropagation();
            const subtaskItem = title.closest('.subtask-item');
            const subtaskId = subtaskItem.dataset.subtaskId;
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                openTaskDetailModal({
                    ...subtask,
                    projectId: project.id,
                    projectName: project.name,
                    projectColor: project.color,
                    taskId: task.id,
                    subtaskId: subtask.id,
                    isSubtask: true
                }, null);
            }
        });
    });

    // Subtask drag and drop handlers
    div.querySelectorAll('.subtask-item').forEach(subtaskEl => {
        const subtaskId = subtaskEl.dataset.subtaskId;

        subtaskEl.addEventListener('dragstart', (e) => {
            e.stopPropagation(); // Prevent parent task drag
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', subtaskId);
            subtaskEl.classList.add('dragging');
            state.draggedProjectId = project.id;
            state.draggedProjectTaskId = task.id;
            state.draggedSubtaskId = subtaskId;
        });

        subtaskEl.addEventListener('dragend', (e) => {
            e.stopPropagation();
            subtaskEl.classList.remove('dragging');
            state.draggedProjectId = null;
            state.draggedProjectTaskId = null;
            state.draggedSubtaskId = null;
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        subtaskEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            // Only show drop indicator if dragging subtask within same task
            if (state.draggedSubtaskId &&
                state.draggedProjectTaskId === task.id &&
                state.draggedSubtaskId !== subtaskId) {
                subtaskEl.classList.add('drag-over');
            }
        });

        subtaskEl.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            subtaskEl.classList.remove('drag-over');
        });

        subtaskEl.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            subtaskEl.classList.remove('drag-over');

            if (!state.draggedSubtaskId || state.draggedProjectTaskId !== task.id) return;
            if (state.draggedSubtaskId === subtaskId) return;

            await reorderSubtasks(project.id, task.id, state.draggedSubtaskId, subtaskId);
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

    // Drag and drop handlers for task reordering
    div.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        div.classList.add('dragging');
        state.draggedProjectTaskId = task.id;
        state.draggedProjectId = project.id;
        state.draggedSubtaskId = null;
    });

    div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
        state.draggedProjectTaskId = null;
        state.draggedProjectId = null;
        state.draggedSubtaskId = null;
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    div.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // Only show drop indicator if dragging within same project and not same task
        if (state.draggedProjectId === project.id &&
            state.draggedProjectTaskId !== task.id &&
            !state.draggedSubtaskId) {
            div.classList.add('drag-over');
        }
    });

    div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
    });

    div.addEventListener('drop', async (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');

        if (!state.draggedProjectTaskId || state.draggedProjectId !== project.id) return;
        if (state.draggedProjectTaskId === task.id) return;
        if (state.draggedSubtaskId) return; // Don't drop subtasks on tasks

        await reorderProjectTasks(project.id, state.draggedProjectTaskId, task.id);
    });

    return div;
}

function createSubtaskHTML(subtask, parentTask, project) {
    const scheduledDates = getScheduledDatesForTask(project.id, parentTask.id, subtask.id);
    const scheduledBadges = scheduledDates.map(d =>
        `<span class="task-scheduled-badge">${formatShortDate(d)}</span>`
    ).join('');

    return `
        <div class="subtask-item" draggable="true" data-subtask-id="${subtask.id}" data-task-id="${parentTask.id}" data-project-id="${project.id}">
            <div class="task-checkbox ${subtask.completed ? 'checked' : ''}" data-subtask-id="${subtask.id}"></div>
            <span class="subtask-title" style="${subtask.completed ? 'text-decoration: line-through; opacity: 0.6' : ''}">${subtask.title}</span>
            ${scheduledBadges}
            <div class="subtask-actions">
                <button class="subtask-view-btn" data-subtask-id="${subtask.id}" title="View Details">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
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
        renderCalendarView();
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

// Helper: Get task order for a project
function getProjectTaskOrder(projectId) {
    if (!state.data.projectTaskOrder) {
        state.data.projectTaskOrder = {};
    }
    return state.data.projectTaskOrder[projectId] || [];
}

// Helper: Set task order for a project
function setProjectTaskOrder(projectId, order) {
    if (!state.data.projectTaskOrder) {
        state.data.projectTaskOrder = {};
    }
    state.data.projectTaskOrder[projectId] = order;
}

// Helper: Get subtask order for a task within a project
function getSubtaskOrder(projectId, taskId) {
    if (!state.data.subtaskOrder) {
        state.data.subtaskOrder = {};
    }
    const key = `${projectId}:${taskId}`;
    return state.data.subtaskOrder[key] || [];
}

// Helper: Set subtask order for a task within a project
function setSubtaskOrder(projectId, taskId, order) {
    if (!state.data.subtaskOrder) {
        state.data.subtaskOrder = {};
    }
    const key = `${projectId}:${taskId}`;
    state.data.subtaskOrder[key] = order;
}

// Reorder tasks within a project
async function reorderProjectTasks(projectId, draggedTaskId, targetTaskId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const taskIds = project.tasks.map(t => t.id);
    const currentOrder = getProjectTaskOrder(projectId);

    // Build ordered list: use saved order where available, fall back to current order
    let orderedIds;
    if (currentOrder.length > 0) {
        orderedIds = currentOrder.filter(id => taskIds.includes(id));
        // Add any new tasks not in saved order
        taskIds.forEach(id => {
            if (!orderedIds.includes(id)) orderedIds.push(id);
        });
    } else {
        orderedIds = [...taskIds];
    }

    const draggedIndex = orderedIds.indexOf(draggedTaskId);
    const targetIndex = orderedIds.indexOf(targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    orderedIds.splice(draggedIndex, 1);
    orderedIds.splice(targetIndex, 0, draggedTaskId);

    // Save new order
    setProjectTaskOrder(projectId, orderedIds);

    state.data.lastUpdated = new Date().toISOString();
    await saveData();

    if (state.currentProject === projectId) {
        renderProjectDetail(projectId);
    }
}

// Reorder subtasks within a task
async function reorderSubtasks(projectId, taskId, draggedSubtaskId, targetSubtaskId) {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtaskIds = task.subtasks.map(st => st.id);
    const currentOrder = getSubtaskOrder(projectId, taskId);

    // Build ordered list
    let orderedIds;
    if (currentOrder.length > 0) {
        orderedIds = currentOrder.filter(id => subtaskIds.includes(id));
        subtaskIds.forEach(id => {
            if (!orderedIds.includes(id)) orderedIds.push(id);
        });
    } else {
        orderedIds = [...subtaskIds];
    }

    const draggedIndex = orderedIds.indexOf(draggedSubtaskId);
    const targetIndex = orderedIds.indexOf(targetSubtaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged item and insert at target position
    orderedIds.splice(draggedIndex, 1);
    orderedIds.splice(targetIndex, 0, draggedSubtaskId);

    // Save new order
    setSubtaskOrder(projectId, taskId, orderedIds);

    state.data.lastUpdated = new Date().toISOString();
    await saveData();

    if (state.currentProject === projectId) {
        renderProjectDetail(projectId);
    }
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
    const scheduleTime = (elements.scheduleTimeToggle?.checked && elements.scheduleTime?.value) || null;

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
        time: scheduleTime,
        scheduledAt: new Date().toISOString(),
        completedOnDay: false
    });

    // Handle subtasks if requested (subtasks do NOT inherit time)
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
                    time: null,
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

    // Pre-populate time from existing task
    const existingTime = getTaskTime(task);
    if (existingTime) {
        elements.rescheduleTimeToggle.checked = true;
        elements.rescheduleTime.classList.remove('hidden');
        elements.rescheduleTime.value = existingTime;
    } else {
        elements.rescheduleTimeToggle.checked = false;
        elements.rescheduleTime.classList.add('hidden');
        elements.rescheduleTime.value = '';
    }

    elements.rescheduleModal.classList.remove('hidden');
}

async function rescheduleTaskToDate(newDate) {
    if (!rescheduleTask || !rescheduleFromDate) return;

    const projectId = rescheduleTask.projectId;
    const taskId = rescheduleTask.taskId || rescheduleTask.id;
    const subtaskId = rescheduleTask.subtaskId || null;
    const rescheduleTime = (elements.rescheduleTimeToggle?.checked && elements.rescheduleTime?.value) || null;

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
            time: rescheduleTime,
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
            time: rescheduleTime,
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

    // Populate preview elements
    if (notes) {
        elements.taskDetailNotesPreview.innerHTML = formatNotesWithLinks(notes);
    } else {
        elements.taskDetailNotesPreview.innerHTML = '';
    }

    if (links) {
        const linkDomain = (() => {
            try {
                return new URL(links).hostname;
            } catch {
                return links;
            }
        })();
        elements.taskDetailLinkPreview.innerHTML = `
            <a href="${escapeHtml(links)}" target="_blank" rel="noopener noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                ${escapeHtml(linkDomain)}
            </a>
        `;
    } else {
        elements.taskDetailLinkPreview.innerHTML = '';
    }

    // Show completion info if completed
    // Get actual task data to retrieve completion notes from the project data
    const actualTaskForCompletion = task.projectId && !task.isStandalone ? getActualTaskData(task) : task;
    const isCompleted = task.completedOnDay || task.completed || actualTaskForCompletion?.completed;
    if (isCompleted) {
        elements.taskDetailCompletionInfo.classList.remove('hidden');
        const completedAt = task.completedAt || task.completionAt || actualTaskForCompletion?.completedAt;
        elements.taskDetailCompletedAt.textContent = completedAt ?
            `Completed: ${formatDate(completedAt)}` : 'Completed';

        // Get completion notes from multiple sources:
        // 1. Passed task object (from daily view with scheduledRef data)
        // 2. Actual task/subtask data from project
        // 3. completedTasks array as fallback
        // 4. scheduledItems as fallback
        let compNotes = task.completionNotes || actualTaskForCompletion?.completionNotes || '';
        let compLinks = task.completionLinks || actualTaskForCompletion?.completionLinks || '';

        const taskId = task.taskId || task.id;
        const subtaskId = task.subtaskId;

        // If not found, try completedTasks array
        if (!compNotes || !compLinks) {
            const completedEntry = (state.data.completedTasks || []).find(ct =>
                ct.projectId === task.projectId &&
                ct.taskId === taskId &&
                (subtaskId ? ct.subtaskId === subtaskId : !ct.subtaskId)
            );
            if (completedEntry) {
                compNotes = compNotes || completedEntry.completionNotes || '';
                compLinks = compLinks || completedEntry.completionLinks || '';
            }
        }

        // Also check scheduledItems for completion notes (most recent entry)
        if (!compNotes || !compLinks) {
            const allScheduledItems = Object.values(state.data.scheduledItems || {}).flat();
            const scheduledRef = allScheduledItems.find(ref =>
                ref.projectId === task.projectId &&
                ref.taskId === taskId &&
                (subtaskId ? ref.subtaskId === subtaskId : !ref.subtaskId) &&
                ref.completedOnDay
            );
            if (scheduledRef) {
                compNotes = compNotes || scheduledRef.completionNotes || '';
                compLinks = compLinks || scheduledRef.completionLinks || '';
            }
        }
        let completionContent = '';
        if (compNotes) {
            completionContent += `<div class="completion-note-text">${formatNotesWithLinks(compNotes)}</div>`;
        }
        if (compLinks) {
            completionContent += `<a href="${escapeHtml(compLinks)}" target="_blank" rel="noopener noreferrer" class="completion-link">${escapeHtml(compLinks)}</a>`;
        }
        elements.taskDetailCompletionNotes.innerHTML = completionContent;
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
    if (task.isStandalone) {
        // Remove standalone task from this specific date
        if (state.data.dailyLists[date]) {
            state.data.dailyLists[date] = state.data.dailyLists[date].filter(t => t.id !== task.id);

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

        if (state.data.scheduledItems[date]) {
            const before = state.data.scheduledItems[date].length;
            state.data.scheduledItems[date] = state.data.scheduledItems[date].filter(ref => {
                return !(ref.projectId === projectId &&
                         ref.taskId === taskId &&
                         subtaskIdMatches(ref.subtaskId, subtaskId));
            });

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
        // Time group hidden when schedule is 'none'
        elements.taskTimeGroup?.classList.add('hidden');
        elements.taskTimeToggle.checked = false;
        elements.taskTime.classList.add('hidden');
        elements.taskTime.value = '';
    } else {
        elements.taskId.value = '';
        elements.taskProjectId.value = projectId || '';
        elements.taskProject.value = projectId || '';
        elements.taskSchedule.value = 'today';
        // Show time group since schedule defaults to 'today'
        elements.taskTimeGroup?.classList.remove('hidden');
        elements.taskTimeToggle.checked = false;
        elements.taskTime.classList.add('hidden');
        elements.taskTime.value = '';
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
    // Reset time fields
    if (elements.taskTimeToggle) {
        elements.taskTimeToggle.checked = false;
        elements.taskTime.classList.add('hidden');
        elements.taskTime.value = '';
        elements.taskTimeGroup.classList.add('hidden');
    }
    if (elements.scheduleTimeToggle) {
        elements.scheduleTimeToggle.checked = false;
        elements.scheduleTime.classList.add('hidden');
        elements.scheduleTime.value = '';
    }
    if (elements.rescheduleTimeToggle) {
        elements.rescheduleTimeToggle.checked = false;
        elements.rescheduleTime.classList.add('hidden');
        elements.rescheduleTime.value = '';
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

    const taskTime = (elements.taskTimeToggle?.checked && elements.taskTime?.value) || null;
    console.log('[TaskSave] Time toggle checked:', elements.taskTimeToggle?.checked, 'Time value:', elements.taskTime?.value, 'Final taskTime:', taskTime);

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
                        time: taskTime,
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
                    time: taskTime,
                    scheduledAt: new Date().toISOString(),
                    completedOnDay: false
                });
            }
        }
    } else if (scheduledDate) {
        if (!state.data.dailyLists[scheduledDate]) {
            state.data.dailyLists[scheduledDate] = [];
        }
        const standaloneData = { ...taskData, time: taskTime };
        const existingIndex = state.data.dailyLists[scheduledDate].findIndex(t => t.id === taskId);
        if (existingIndex >= 0) {
            state.data.dailyLists[scheduledDate][existingIndex] = {
                ...state.data.dailyLists[scheduledDate][existingIndex],
                ...standaloneData
            };
        } else {
            state.data.dailyLists[scheduledDate].push(standaloneData);
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

    if (ref) {
        ref.completedOnDay = completed;
        if (completed) {
            ref.completedAt = new Date().toISOString();
            ref.completionNotes = notes;
            ref.completionLinks = links;

            if (task.isSubtask || subtaskId) {
                await markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed, notes, links);
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
        // Task not found in scheduledItems - complete via project directly
        if (task.isSubtask || subtaskId) {
            await markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed, notes, links);
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

async function markSubtaskCompleteInProject(projectId, taskId, subtaskId, completed, notes = '', links = '') {
    const project = state.data.projects.find(p => p.id === projectId);
    if (!project) return;

    const task = project.tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(st => st.id === subtaskId);
    if (!subtask) return;

    subtask.completed = completed;
    subtask.completedAt = completed ? new Date().toISOString() : null;

    if (completed) {
        subtask.completionNotes = notes;
        subtask.completionLinks = links;
    } else {
        subtask.completionNotes = null;
        subtask.completionLinks = null;
    }

    // Note: Parent task completion is now handled separately - no auto-complete
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
// AI SUMMARY
// ============================================

let currentAiSummary = null;

function initAiSummary() {
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) {
        updateAiStatus('ready', 'API key configured');
        elements.generateAiSummaryBtn.disabled = false;
    }
}

function updateAiStatus(status, text) {
    elements.aiSummaryStatus.className = 'ai-summary-status ' + status;
    elements.aiStatusText.textContent = text;
}

function toggleAiSettings() {
    elements.aiSettingsPanel.classList.toggle('hidden');
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) {
        elements.anthropicApiKey.value = storedKey;
    }
}

function saveAnthropicApiKey() {
    const key = elements.anthropicApiKey.value.trim();
    if (key) {
        localStorage.setItem('anthropic_api_key', key);
        updateAiStatus('ready', 'API key saved');
        elements.generateAiSummaryBtn.disabled = false;
        elements.aiSettingsPanel.classList.add('hidden');
        showToast('API key saved', 'success');
    } else {
        localStorage.removeItem('anthropic_api_key');
        updateAiStatus('', 'No API key configured');
        elements.generateAiSummaryBtn.disabled = true;
        showToast('API key removed', 'info');
    }
}

async function generateAiSummary() {
    const apiKey = localStorage.getItem('anthropic_api_key');
    if (!apiKey) {
        showToast('Please configure your Anthropic API key first', 'error');
        return;
    }

    const monthStr = elements.exportMonth.value;
    const [year, month] = monthStr.split('-').map(Number);

    const options = {
        includeSubtasks: true,
        includeDailyAppendix: true,
        includeIncomplete: true,
        includePlanned: true
    };

    const reportData = gatherMonthlyReportData(year, month, options);

    if (reportData.totalCount === 0 && (!reportData.dailyBreakdown || reportData.dailyBreakdown.length === 0)) {
        showToast('No data available for this month', 'error');
        return;
    }

    updateAiStatus('loading', 'Generating summary...');
    elements.generateAiSummaryBtn.disabled = true;

    try {
        const prompt = buildAiPrompt(reportData);
        const summary = await callClaudeApi(apiKey, prompt);

        currentAiSummary = summary;
        elements.aiSummaryText.textContent = summary;
        elements.aiSummaryContent.classList.remove('hidden');
        updateAiStatus('ready', 'Summary generated');
        elements.generateAiSummaryBtn.disabled = false;
        showToast('AI summary generated', 'success');
    } catch (error) {
        console.error('AI summary error:', error);
        updateAiStatus('error', 'Failed to generate summary');
        elements.generateAiSummaryBtn.disabled = false;
        showToast(error.message || 'Failed to generate summary', 'error');
    }
}

function buildAiPrompt(reportData) {
    let dataContext = `# Monthly Productivity Report Data for ${reportData.monthName}\n\n`;

    dataContext += `## Summary Statistics\n`;
    dataContext += `- Tasks Completed: ${reportData.taskCount}\n`;
    dataContext += `- Subtasks Completed: ${reportData.subtaskCount}\n`;
    dataContext += `- Total Items: ${reportData.totalCount}\n`;
    dataContext += `- Active Projects: ${reportData.projectCount}\n\n`;

    if (reportData.projectSummaries && reportData.projectSummaries.length > 0) {
        dataContext += `## Project Activity\n`;
        reportData.projectSummaries.forEach(project => {
            dataContext += `\n### ${project.name}\n`;
            dataContext += `- Tasks: ${project.tasks.length}, Subtasks: ${project.subtasks.length}\n`;

            if (project.progressUpdates.length > 0) {
                dataContext += `- Progress Updates:\n`;
                project.progressUpdates.forEach(update => {
                    dataContext += `  - ${update.text}\n`;
                });
            }

            if (project.tasks.length > 0) {
                dataContext += `- Completed Tasks:\n`;
                project.tasks.forEach(task => {
                    const date = new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    dataContext += `  - ${task.title} (${date})`;
                    if (task.completionNotes) {
                        dataContext += ` - Notes: ${task.completionNotes}`;
                    }
                    dataContext += `\n`;
                });
            }
        });
    }

    if (reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0) {
        dataContext += `\n## Daily Activity Patterns\n`;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const activityByDay = {};

        reportData.dailyBreakdown.forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const dayName = dayNames[date.getDay()];
            activityByDay[dayName] = (activityByDay[dayName] || 0) + day.items.length;

            if (day.notes) {
                dataContext += `- ${day.date}: Notes: "${day.notes}"\n`;
            }
        });

        dataContext += `\nActivity by day of week:\n`;
        Object.entries(activityByDay).forEach(([day, count]) => {
            dataContext += `- ${day}: ${count} items\n`;
        });
    }

    if (reportData.incompleteScheduled && reportData.incompleteScheduled.length > 0) {
        dataContext += `\n## Incomplete Items (carried over)\n`;
        reportData.incompleteScheduled.forEach(item => {
            dataContext += `- ${item.title} (scheduled: ${item.scheduledDate})\n`;
        });
    }

    if (reportData.plannedNextMonth && reportData.plannedNextMonth.length > 0) {
        dataContext += `\n## Planned for Next Month\n`;
        reportData.plannedNextMonth.forEach(item => {
            dataContext += `- ${item.title} (${item.scheduledDate})\n`;
        });
    }

    return `You are a productivity coach analyzing a user's monthly work data. Based on the following data, provide a concise but insightful monthly summary that:

1. Highlights key accomplishments and patterns
2. Notes which projects received the most attention
3. Identifies productive days/patterns if visible
4. Offers 1-2 brief, actionable suggestions for the next month
5. Keeps an encouraging but professional tone

Keep the summary to about 150-200 words. Focus on insights, not just restating the data.

${dataContext}

Write the summary now:`;
}

async function callClaudeApi(apiKey, prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your Anthropic API key.');
        } else if (response.status === 429) {
            throw new Error('Rate limited. Please try again in a moment.');
        } else {
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }
    }

    const data = await response.json();
    return data.content[0].text;
}

function resetAiSummary() {
    currentAiSummary = null;
    elements.aiSummaryContent.classList.add('hidden');
    elements.aiSummaryText.textContent = '';
}

// ============================================
// EXPORT
// ============================================

function openExportModal() {
    resetAiSummary();
    elements.aiSettingsPanel?.classList.add('hidden');
    elements.exportModal.classList.remove('hidden');
}

// Data gathering functions for monthly report

function getCompletedItemsForMonth(startDate, endDate) {
    if (!state.data.completedTasks) return [];
    return state.data.completedTasks.filter(task => {
        const taskDate = new Date(task.completedAt);
        return taskDate >= startDate && taskDate <= endDate;
    });
}

function getProgressUpdatesForMonth(startDate, endDate) {
    const updates = [];
    if (!state.data.projects) return updates;

    state.data.projects.forEach(project => {
        if (project.progressUpdates) {
            project.progressUpdates.forEach(update => {
                const updateDate = new Date(update.date);
                if (updateDate >= startDate && updateDate <= endDate) {
                    updates.push({
                        ...update,
                        projectId: project.id,
                        projectName: project.name
                    });
                }
            });
        }
    });
    return updates;
}

function buildProjectSummaries(completedItems, progressUpdates) {
    const projectMap = {};

    // Add completed items
    completedItems.forEach(item => {
        const projectId = item.projectId || 'standalone';
        if (!projectMap[projectId]) {
            const project = state.data.projects?.find(p => p.id === projectId);
            projectMap[projectId] = {
                id: projectId,
                name: project?.name || 'Standalone Tasks',
                tasks: [],
                subtasks: [],
                progressUpdates: [],
                totalItems: 0
            };
        }
        if (item.subtaskId) {
            projectMap[projectId].subtasks.push(item);
        } else {
            projectMap[projectId].tasks.push(item);
        }
        projectMap[projectId].totalItems++;
    });

    // Add progress updates
    progressUpdates.forEach(update => {
        const projectId = update.projectId;
        if (!projectMap[projectId]) {
            projectMap[projectId] = {
                id: projectId,
                name: update.projectName,
                tasks: [],
                subtasks: [],
                progressUpdates: [],
                totalItems: 0
            };
        }
        projectMap[projectId].progressUpdates.push(update);
    });

    // Sort by activity volume
    return Object.values(projectMap).sort((a, b) => b.totalItems - a.totalItems);
}

function buildDailyBreakdown(completedItems, dailyNotes, startDate, endDate) {
    const days = {};

    // Group completed items by date
    completedItems.forEach(item => {
        const dateStr = new Date(item.completedAt).toISOString().split('T')[0];
        if (!days[dateStr]) {
            days[dateStr] = { items: [], notes: null };
        }
        days[dateStr].items.push(item);
    });

    // Add daily notes
    if (dailyNotes) {
        Object.entries(dailyNotes).forEach(([date, notes]) => {
            const noteDate = getDateFromString(date);
            if (noteDate >= startDate && noteDate <= endDate) {
                if (!days[date]) {
                    days[date] = { items: [], notes: null };
                }
                days[date].notes = notes;
            }
        });
    }

    // Sort by date
    return Object.entries(days)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));
}

function getIncompleteScheduledForMonth(startDate, endDate) {
    const incomplete = [];
    if (!state.data.scheduledItems) return incomplete;

    Object.entries(state.data.scheduledItems).forEach(([date, items]) => {
        const scheduleDate = getDateFromString(date);
        if (scheduleDate >= startDate && scheduleDate <= endDate) {
            items.forEach(item => {
                // Check if task is still incomplete
                const project = state.data.projects?.find(p => p.id === item.projectId);
                if (project) {
                    const task = project.tasks?.find(t => t.id === item.taskId);
                    if (task && !task.completed) {
                        incomplete.push({
                            ...item,
                            scheduledDate: date,
                            title: task.title,
                            projectName: project.name
                        });
                    }
                }
            });
        }
    });
    return incomplete;
}

function getPlannedForNextMonth(nextMonthStart, nextMonthEnd) {
    const planned = [];
    if (!state.data.scheduledItems) return planned;

    Object.entries(state.data.scheduledItems).forEach(([date, items]) => {
        const scheduleDate = getDateFromString(date);
        if (scheduleDate >= nextMonthStart && scheduleDate <= nextMonthEnd) {
            items.forEach(item => {
                const project = state.data.projects?.find(p => p.id === item.projectId);
                if (project) {
                    const task = project.tasks?.find(t => t.id === item.taskId);
                    if (task && !task.completed) {
                        planned.push({
                            ...item,
                            scheduledDate: date,
                            title: task.title,
                            projectName: project.name
                        });
                    }
                }
            });
        }
    });
    return planned;
}

function gatherMonthlyReportData(year, month, options) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const nextMonthStart = new Date(year, month, 1);
    const nextMonthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    const completedItems = getCompletedItemsForMonth(startDate, endDate);
    const progressUpdates = getProgressUpdatesForMonth(startDate, endDate);
    const projectSummaries = buildProjectSummaries(completedItems, progressUpdates);

    const taskCount = completedItems.filter(i => !i.subtaskId).length;
    const subtaskCount = completedItems.filter(i => i.subtaskId).length;

    const data = {
        year,
        month,
        monthName: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate,
        endDate,
        taskCount,
        subtaskCount,
        totalCount: completedItems.length,
        projectCount: projectSummaries.filter(p => p.id !== 'standalone').length,
        projectSummaries
    };

    if (options.includeDailyAppendix) {
        data.dailyBreakdown = buildDailyBreakdown(
            completedItems,
            state.data.dailyNotes,
            startDate,
            endDate
        );
    }

    if (options.includeIncomplete) {
        data.incompleteScheduled = getIncompleteScheduledForMonth(startDate, endDate);
    }

    if (options.includePlanned) {
        data.plannedNextMonth = getPlannedForNextMonth(nextMonthStart, nextMonthEnd);
    }

    return data;
}

// Report generation functions

function formatTaskMarkdown(task) {
    const date = new Date(task.completedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    let line = `- [x] ${task.title} *(${date})*\n`;
    if (task.completionNotes) {
        line += `  - Notes: ${task.completionNotes}\n`;
    }
    if (task.completionLinks) {
        const links = task.completionLinks.split('\n').filter(l => l.trim());
        links.forEach(link => {
            line += `  - Link: [${link.trim()}](${link.trim()})\n`;
        });
    }
    return line;
}

function formatSubtaskMarkdown(subtask) {
    const date = new Date(subtask.completedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    const parentTask = findTaskById(subtask.projectId, subtask.taskId);
    const parentTitle = parentTask?.title || 'Unknown Task';
    let line = `- [x] ${parentTitle} > ${subtask.title} *(${date})*\n`;
    if (subtask.completionNotes) {
        line += `  - Notes: ${subtask.completionNotes}\n`;
    }
    return line;
}

function findTaskById(projectId, taskId) {
    const project = state.data.projects?.find(p => p.id === projectId);
    return project?.tasks?.find(t => t.id === taskId);
}

function generateMarkdownReport(reportData, options) {
    let md = `# Monthly Report - ${reportData.monthName}\n\n`;

    // AI Summary (if available)
    if (options.includeAiSummary && options.aiSummary) {
        md += `## AI-Generated Summary\n\n`;
        md += `${options.aiSummary}\n\n`;
        md += `---\n\n`;
    }

    // Executive Summary
    md += `## Executive Summary\n\n`;
    md += `- Tasks Completed: ${reportData.taskCount}\n`;
    if (options.includeSubtasks) {
        md += `- Subtasks Completed: ${reportData.subtaskCount}\n`;
    }
    md += `- Projects with Activity: ${reportData.projectCount}\n\n`;

    // Top projects by activity
    if (reportData.projectSummaries.length > 0) {
        md += `### Top Projects by Activity\n\n`;
        reportData.projectSummaries.slice(0, 5).forEach((project, index) => {
            if (project.id !== 'standalone') {
                md += `${index + 1}. ${project.name} - ${project.totalItems} items\n`;
            }
        });
        md += '\n';
    }

    // Project Progress sections
    md += `## Project Progress\n\n`;

    reportData.projectSummaries.forEach(project => {
        md += `### ${project.name}\n\n`;

        // Progress updates
        if (project.progressUpdates.length > 0) {
            md += `**Summary:**\n`;
            project.progressUpdates.forEach(update => {
                md += `- ${update.text}\n`;
            });
            md += '\n';
        }

        // Completed items
        if (project.tasks.length > 0 || (options.includeSubtasks && project.subtasks.length > 0)) {
            md += `**Completed Items:**\n`;
            project.tasks.forEach(task => {
                md += formatTaskMarkdown(task);
            });
            if (options.includeSubtasks) {
                project.subtasks.forEach(subtask => {
                    md += formatSubtaskMarkdown(subtask);
                });
            }
            md += '\n';
        }
    });

    // Daily Log Appendix
    if (options.includeDailyAppendix && reportData.dailyBreakdown) {
        md += `## Daily Log (Appendix)\n\n`;
        reportData.dailyBreakdown.forEach(day => {
            const dayDate = new Date(day.date + 'T00:00:00');
            const dateStr = dayDate.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
            });
            md += `### ${dateStr}\n\n`;

            day.items.forEach(item => {
                const project = state.data.projects?.find(p => p.id === item.projectId);
                const projectName = project?.name || 'Standalone';
                md += `- [x] ${item.title} *(${projectName})*\n`;
            });

            if (day.notes) {
                md += `\n**Notes:** ${day.notes}\n`;
            }
            md += '\n';
        });
    }

    // Incomplete Scheduled Items
    if (options.includeIncomplete && reportData.incompleteScheduled?.length > 0) {
        md += `## Incomplete Scheduled Items\n\n`;
        reportData.incompleteScheduled.forEach(item => {
            md += `- [ ] ${item.title} (scheduled: ${formatDate(item.scheduledDate)})\n`;
        });
        md += '\n';
    }

    // Planned for Next Month
    if (options.includePlanned && reportData.plannedNextMonth?.length > 0) {
        md += `## Planned for Next Month\n\n`;
        reportData.plannedNextMonth.forEach(item => {
            md += `- ${item.title} (${formatDate(item.scheduledDate)})\n`;
        });
        md += '\n';
    }

    return md;
}

function generateHtmlReport(reportData, options) {
    // Calculate max items for progress bar scaling
    const maxItems = Math.max(...reportData.projectSummaries.map(p => p.totalItems), 1);

    // Format generation date
    const genDate = new Date();
    const genDateStr = genDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Helper to create ASCII progress bar
    const createProgressBar = (value, max, width = 20) => {
        const filled = Math.round((value / max) * width);
        return '▓'.repeat(filled) + '░'.repeat(width - filled);
    };

    // Helper to format short date
    const shortDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const styles = `
        <style>
            /* Reset CSS variables to light theme values */
            :root, html, body {
                --color-bg: #ffffff !important;
                --color-surface: #f8fafc !important;
                --color-text: #0f172a !important;
                --color-text-secondary: #64748b !important;
                --color-border: #e2e8f0 !important;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; color: inherit; background-color: inherit; }

            html {
                background-color: #ffffff !important;
                color: #0f172a !important;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px 30px;
                color: #0f172a !important;
                line-height: 1.5;
                background-color: #ffffff !important;
                font-size: 12px;
            }

            /* Header */
            .report-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #1e293b;
            }

            .report-title {
                font-size: 28px;
                font-weight: 700;
                color: #1e293b;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 4px;
            }

            .report-author {
                font-size: 18px;
                color: #64748b;
                font-weight: 400;
                margin-bottom: 8px;
            }

            .report-subtitle {
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .report-generated {
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 10px;
                color: #94a3b8;
                margin-top: 8px;
            }

            /* Metrics Dashboard */
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin: 25px 0;
            }

            .metric-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 20px;
                text-align: center;
            }

            .metric-value {
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 32px;
                font-weight: 700;
                color: #1e293b;
                line-height: 1;
            }

            .metric-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-top: 8px;
            }

            /* Section Headers */
            .section-header {
                font-size: 14px;
                font-weight: 700;
                color: #1e293b;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 30px 0 15px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
            }

            /* Project Breakdown Chart */
            .project-chart {
                background: #f8fafc;
                padding: 20px;
                margin: 15px 0;
            }

            .chart-row {
                display: flex;
                align-items: center;
                margin: 8px 0;
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 11px;
            }

            .chart-bar {
                color: #334155;
                margin-right: 12px;
                letter-spacing: -1px;
            }

            .chart-label {
                flex: 1;
                color: #1e293b;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .chart-count {
                color: #64748b;
                margin-left: 10px;
                white-space: nowrap;
            }

            /* Project Sections */
            .project-section {
                margin: 25px 0;
                padding: 20px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
            }

            .project-name {
                font-size: 14px;
                font-weight: 700;
                color: #1e293b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
            }

            .progress-notes {
                background: #f8fafc;
                border-left: 3px solid #0ea5e9;
                padding: 12px 15px;
                margin-bottom: 15px;
            }

            .progress-notes-title {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-bottom: 8px;
            }

            .progress-notes ul {
                list-style: none;
                padding: 0;
            }

            .progress-notes li {
                padding: 3px 0;
                color: #334155;
            }

            .progress-notes li::before {
                content: "• ";
                color: #0ea5e9;
            }

            .completed-title {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-bottom: 10px;
            }

            /* Task Items */
            .task-item {
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                flex-wrap: wrap;
                align-items: baseline;
            }

            .task-item:last-child {
                border-bottom: none;
            }

            .task-check {
                color: #16a34a;
                font-weight: 600;
                margin-right: 8px;
            }

            .task-title {
                flex: 1;
                color: #1e293b;
                font-weight: 500;
            }

            .task-date {
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 10px;
                color: #94a3b8;
                margin-left: 10px;
            }

            .task-notes-row {
                width: 100%;
                padding-left: 22px;
                margin-top: 4px;
            }

            .task-notes {
                font-size: 11px;
                color: #64748b;
                font-style: italic;
            }

            .task-link {
                font-size: 11px;
                color: #0ea5e9;
                text-decoration: none;
            }

            .task-link:hover {
                text-decoration: underline;
            }

            /* Subtask styling */
            .subtask-item {
                padding: 6px 0 6px 22px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                flex-wrap: wrap;
                align-items: baseline;
            }

            .subtask-item:last-child {
                border-bottom: none;
            }

            .subtask-connector {
                color: #cbd5e1;
                margin-right: 8px;
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
            }

            .subtask-parent {
                color: #94a3b8;
                font-size: 11px;
            }

            /* Daily Activity Log */
            .daily-log {
                margin-top: 30px;
            }

            .daily-row {
                display: flex;
                align-items: center;
                padding: 6px 0;
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 11px;
                border-bottom: 1px solid #f1f5f9;
            }

            .daily-date {
                width: 60px;
                color: #64748b;
            }

            .daily-bar {
                color: #0ea5e9;
                margin: 0 10px;
                letter-spacing: -2px;
            }

            .daily-count {
                color: #1e293b;
            }

            .daily-detail {
                padding: 10px 0 10px 70px;
                border-bottom: 1px solid #f1f5f9;
            }

            .daily-detail ul {
                list-style: none;
                padding: 0;
            }

            .daily-detail li {
                padding: 2px 0;
                color: #64748b;
                font-size: 11px;
            }

            .daily-detail li::before {
                content: "✓ ";
                color: #16a34a;
            }

            .daily-notes-block {
                background: #f8fafc;
                border-left: 2px solid #0ea5e9;
                padding: 8px 12px;
                margin: 8px 0 8px 70px;
                font-style: italic;
                color: #64748b;
                font-size: 11px;
            }

            /* Incomplete & Planned Sections */
            .status-section {
                margin-top: 25px;
            }

            .status-header-incomplete {
                color: #d97706;
            }

            .status-header-planned {
                color: #0ea5e9;
            }

            .status-list {
                list-style: none;
                padding: 0;
            }

            .status-list li {
                padding: 6px 0;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                align-items: center;
            }

            .status-list li:last-child {
                border-bottom: none;
            }

            .status-incomplete::before {
                content: "○ ";
                color: #d97706;
                font-weight: 600;
            }

            .status-planned::before {
                content: "→ ";
                color: #0ea5e9;
                font-weight: 600;
            }

            .status-date {
                font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
                font-size: 10px;
                color: #94a3b8;
                margin-left: auto;
            }

            /* AI Summary */
            .ai-summary-box {
                margin: 25px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 1px solid #7dd3fc;
                border-radius: 8px;
            }

            .ai-summary-box .section-header {
                color: #0369a1;
                border-bottom-color: #7dd3fc;
            }

            .ai-summary-content {
                font-size: 12px;
                line-height: 1.7;
                color: #334155;
            }

            /* Print styles */
            @media print {
                body {
                    padding: 20px;
                }

                .project-section {
                    break-inside: avoid;
                }
            }
        </style>
    `;

    let html = `<!DOCTYPE html>
<html lang="en" style="background-color: #ffffff !important;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Report - ${reportData.monthName}</title>
    ${styles}
</head>
<body style="background-color: #ffffff !important; color: #0f172a !important;">
    <header class="report-header">
        <div class="report-title">${reportData.monthName}</div>
        <div class="report-author">Samuel Little</div>
        <div class="report-subtitle">Monthly Engineering Report</div>
        <div class="report-generated">Generated: ${genDateStr}</div>
    </header>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">${reportData.taskCount}</div>
            <div class="metric-label">Tasks</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${reportData.subtaskCount || 0}</div>
            <div class="metric-label">Subtasks</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${reportData.projectCount}</div>
            <div class="metric-label">Projects</div>
        </div>
    </div>`;

    // AI Summary (if available)
    if (options.includeAiSummary && options.aiSummary) {
        html += `
        <div class="ai-summary-box">
            <div class="section-header">AI-Generated Summary</div>
            <div class="ai-summary-content">${options.aiSummary.replace(/\n/g, '<br>')}</div>
        </div>`;
    }

    // Project Breakdown Chart
    if (reportData.projectSummaries.length > 0) {
        html += `<div class="section-header">Project Breakdown</div>
        <div class="project-chart">`;

        reportData.projectSummaries.slice(0, 8).forEach(project => {
            if (project.id !== 'standalone' || project.totalItems > 0) {
                const bar = createProgressBar(project.totalItems, maxItems);
                html += `<div class="chart-row">
                    <span class="chart-bar">${bar}</span>
                    <span class="chart-label">${project.name}</span>
                    <span class="chart-count">${project.totalItems} items</span>
                </div>`;
            }
        });

        html += `</div>`;
    }

    html += `<div class="section-header">Project Details</div>`;

    // Project sections
    reportData.projectSummaries.forEach(project => {
        // Skip empty standalone projects
        if (project.id === 'standalone' && project.tasks.length === 0 && project.subtasks.length === 0) {
            return;
        }

        html += `<div class="project-section">
            <div class="project-name">${project.name}</div>`;

        if (project.progressUpdates.length > 0) {
            html += `<div class="progress-notes">
                <div class="progress-notes-title">Progress Notes</div>
                <ul>`;
            project.progressUpdates.forEach(update => {
                html += `<li>${update.text}</li>`;
            });
            html += `</ul></div>`;
        }

        if (project.tasks.length > 0 || (options.includeSubtasks && project.subtasks.length > 0)) {
            html += `<div class="completed-title">Completed</div>`;

            project.tasks.forEach(task => {
                const date = shortDate(task.completedAt);
                html += `<div class="task-item">
                    <span class="task-check">✓</span>
                    <span class="task-title">${task.title}</span>
                    <span class="task-date">${date}</span>`;

                if (task.completionNotes) {
                    html += `<div class="task-notes-row">
                        <span class="task-notes">└─ ${task.completionNotes}</span>
                    </div>`;
                }

                if (task.completionLinks) {
                    const links = task.completionLinks.split('\n').filter(l => l.trim());
                    links.forEach(link => {
                        html += `<div class="task-notes-row">
                            <a href="${link.trim()}" class="task-link" target="_blank">└─ ${link.trim()}</a>
                        </div>`;
                    });
                }

                html += `</div>`;
            });

            if (options.includeSubtasks) {
                project.subtasks.forEach(subtask => {
                    const date = shortDate(subtask.completedAt);
                    const parentTask = findTaskById(subtask.projectId, subtask.taskId);
                    const parentTitle = parentTask?.title || 'Task';
                    html += `<div class="subtask-item">
                        <span class="task-check">✓</span>
                        <span class="subtask-parent">${parentTitle} ›</span>
                        <span class="task-title" style="margin-left: 5px;">${subtask.title}</span>
                        <span class="task-date">${date}</span>`;

                    if (subtask.completionNotes) {
                        html += `<div class="task-notes-row">
                            <span class="task-notes">└─ ${subtask.completionNotes}</span>
                        </div>`;
                    }

                    html += `</div>`;
                });
            }
        }

        html += `</div>`;
    });

    // Daily Log Appendix
    if (options.includeDailyAppendix && reportData.dailyBreakdown && reportData.dailyBreakdown.length > 0) {
        // Calculate max for daily bars
        const maxDaily = Math.max(...reportData.dailyBreakdown.map(d => d.items.length), 1);

        html += `<div class="daily-log">
            <div class="section-header">Daily Activity Log</div>`;

        reportData.dailyBreakdown.forEach(day => {
            const dayDate = new Date(day.date + 'T00:00:00');
            const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const barWidth = Math.max(1, Math.round((day.items.length / maxDaily) * 8));
            const bar = '█'.repeat(barWidth);

            html += `<div class="daily-row">
                <span class="daily-date">${dateStr}</span>
                <span class="daily-bar">${bar}</span>
                <span class="daily-count">${day.items.length} item${day.items.length !== 1 ? 's' : ''}</span>
            </div>`;

            html += `<div class="daily-detail"><ul>`;
            day.items.forEach(item => {
                const project = state.data.projects?.find(p => p.id === item.projectId);
                const projectName = project?.name || '';
                const projectSuffix = projectName ? ` (${projectName})` : '';
                html += `<li>${item.title}${projectSuffix}</li>`;
            });
            html += `</ul></div>`;

            if (day.notes) {
                html += `<div class="daily-notes-block">${day.notes}</div>`;
            }
        });

        html += `</div>`;
    }

    // Incomplete Scheduled Items
    if (options.includeIncomplete && reportData.incompleteScheduled?.length > 0) {
        html += `<div class="status-section">
            <div class="section-header status-header-incomplete">Incomplete Scheduled Items</div>
            <ul class="status-list">`;
        reportData.incompleteScheduled.forEach(item => {
            html += `<li class="status-incomplete">
                <span>${item.title}</span>
                <span class="status-date">${shortDate(item.scheduledDate)}</span>
            </li>`;
        });
        html += `</ul></div>`;
    }

    // Planned for Next Month
    if (options.includePlanned && reportData.plannedNextMonth?.length > 0) {
        html += `<div class="status-section">
            <div class="section-header status-header-planned">Planned for Next Month</div>
            <ul class="status-list">`;
        reportData.plannedNextMonth.forEach(item => {
            html += `<li class="status-planned">
                <span>${item.title}</span>
                <span class="status-date">${shortDate(item.scheduledDate)}</span>
            </li>`;
        });
        html += `</ul></div>`;
    }

    html += `</body></html>`;
    return html;
}

function exportReport(e) {
    e.preventDefault();

    const monthStr = elements.exportMonth.value;
    const format = elements.exportFormat.value;
    const [year, month] = monthStr.split('-').map(Number);

    const options = {
        includeSubtasks: elements.exportIncludeSubtasks?.checked ?? true,
        includeDailyAppendix: elements.exportIncludeDailyAppendix?.checked ?? true,
        includeIncomplete: elements.exportIncludeIncomplete?.checked ?? false,
        includePlanned: elements.exportIncludePlanned?.checked ?? false,
        includeAiSummary: elements.exportIncludeAiSummary?.checked && currentAiSummary
    };

    // Add AI summary to options if available
    if (options.includeAiSummary) {
        options.aiSummary = currentAiSummary;
    }

    const reportData = gatherMonthlyReportData(year, month, options);

    // Handle PDF export separately
    if (format === 'pdf') {
        const htmlContent = generateHtmlReport(reportData, options);
        generatePdfReport(htmlContent, monthStr);
        return;
    }

    let content = '';
    let extension = '';
    let mimeType = 'text/plain';

    if (format === 'markdown') {
        content = generateMarkdownReport(reportData, options);
        extension = 'md';
    } else if (format === 'html') {
        content = generateHtmlReport(reportData, options);
        extension = 'html';
        mimeType = 'text/html';
    } else if (format === 'json') {
        // Include AI summary in JSON export
        if (options.includeAiSummary) {
            reportData.aiSummary = currentAiSummary;
        }
        content = JSON.stringify(reportData, null, 2);
        extension = 'json';
        mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${monthStr}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);

    closeAllModals();
    showToast('Report exported', 'success');
}

function generatePdfReport(htmlContent, monthStr) {
    // Close modal and show loading state
    closeAllModals();
    showToast('Generating PDF...', 'info');

    // Create an iframe to render the complete HTML document
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: fixed; top: 0; left: 0; width: 850px; height: 100vh; z-index: 9999; background: white; border: none;';
    document.body.appendChild(iframe);

    // Wait for iframe to be ready
    iframe.onload = function() {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Give styles time to apply
        setTimeout(() => {
            const pdfOptions = {
                margin: [10, 10, 10, 10],
                filename: `monthly-report-${monthStr}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(pdfOptions).from(iframeDoc.body).save().then(() => {
                document.body.removeChild(iframe);
                showToast('PDF exported', 'success');
            }).catch(err => {
                document.body.removeChild(iframe);
                console.error('PDF generation failed:', err);
                showToast('PDF export failed', 'error');
            });
        }, 300);
    };

    // Write the HTML content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
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

    // AI Summary
    elements.aiSettingsToggle?.addEventListener('click', toggleAiSettings);
    elements.saveApiKeyBtn?.addEventListener('click', saveAnthropicApiKey);
    elements.generateAiSummaryBtn?.addEventListener('click', generateAiSummary);
    elements.exportMonth?.addEventListener('change', resetAiSummary);

    // Schedule dropdown
    elements.taskSchedule?.addEventListener('change', () => {
        elements.customDateGroup.classList.toggle('hidden', elements.taskSchedule.value !== 'custom');
        const isScheduled = elements.taskSchedule.value !== 'none';
        elements.taskTimeGroup?.classList.toggle('hidden', !isScheduled);
        if (!isScheduled) {
            elements.taskTimeToggle.checked = false;
            elements.taskTime.classList.add('hidden');
            elements.taskTime.value = '';
        }
    });

    // Time toggle handlers
    elements.taskTimeToggle?.addEventListener('change', () => {
        elements.taskTime.classList.toggle('hidden', !elements.taskTimeToggle.checked);
        if (!elements.taskTimeToggle.checked) elements.taskTime.value = '';
    });
    elements.scheduleTimeToggle?.addEventListener('change', () => {
        elements.scheduleTime.classList.toggle('hidden', !elements.scheduleTimeToggle.checked);
        if (!elements.scheduleTimeToggle.checked) elements.scheduleTime.value = '';
    });
    elements.rescheduleTimeToggle?.addEventListener('change', () => {
        elements.rescheduleTime.classList.toggle('hidden', !elements.rescheduleTimeToggle.checked);
        if (!elements.rescheduleTimeToggle.checked) elements.rescheduleTime.value = '';
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

    // Today and Previous daily notes save
    elements.todayNotesSave?.addEventListener('click', saveTodayNotes);
    elements.previousNotesSave?.addEventListener('click', savePreviousNotes);

    // Calendar navigation
    elements.calendarPrevBtn?.addEventListener('click', () => navigateCalendar(-1));
    elements.calendarNextBtn?.addEventListener('click', () => navigateCalendar(1));
    elements.calendarTodayBtn?.addEventListener('click', jumpToToday);

    // Calendar view toggle
    document.getElementById('calendar-view-month')?.addEventListener('click', () => setCalendarViewMode('month'));
    document.getElementById('calendar-view-week')?.addEventListener('click', () => setCalendarViewMode('week'));

    // Calendar filters
    elements.calendarProjectFilter?.addEventListener('change', handleCalendarProjectFilterChange);
    elements.calendarTaskFilter?.addEventListener('change', handleCalendarTaskFilterChange);
    elements.calendarFilterReset?.addEventListener('click', resetCalendarFilter);

    // Day detail navigation
    elements.dayDetailPrevBtn?.addEventListener('click', () => navigateDayDetail(-1));
    elements.dayDetailNextBtn?.addEventListener('click', () => navigateDayDetail(1));
    elements.dayDetailSaveNotes?.addEventListener('click', saveDailyNotes);
    elements.dayDetailAddBtn?.addEventListener('click', () => {
        // Store the selected date before closing the modal
        const dateForTask = state.selectedDate;
        // Close the day detail modal first so task modal is visible
        elements.dayDetailModal.classList.add('hidden');
        // Open task modal for adding to this specific date
        openTaskModal();
        elements.taskSchedule.value = 'custom';
        elements.customDateGroup.classList.remove('hidden');
        elements.taskCustomDate.value = dateForTask;
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
    initAiSummary();
}

document.addEventListener('DOMContentLoaded', init);
