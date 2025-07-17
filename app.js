document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const taskInput = document.getElementById('task-input');
    const isDailyHabitCheckbox = document.getElementById('daily-habit-checkbox');
    const addTaskBtn = document.getElementById('add-task-btn');
    const dailyHabitsList = document.getElementById('daily-habits-list');
    const oneTimeTasksList = document.getElementById('one-time-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');

    // Calendar Elements
    const calendarGrid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('month-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDateDisplay = document.getElementById('selected-date-display');

    // Modal Elements
    const dayDetailModal = document.getElementById('day-detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalDateHeader = document.getElementById('modal-date-header');
    const modalTaskList = document.getElementById('modal-task-list');

    // --- Data Management ---
    let tasks = JSON.parse(localStorage.getItem('momentumTasks')) || [];
    let nav = 0; // Calendar month navigation
    let selectedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const saveTasks = () => {
        localStorage.setItem('momentumTasks', JSON.stringify(tasks));
    };
    
    // --- Calendar Functions ---
    const renderCalendar = () => {
        const dt = new Date();
        if (nav !== 0) {
            dt.setMonth(new Date().getMonth() + nav, 1); // Set to day 1 to avoid month-end issues
        }

        const year = dt.getFullYear();
        const month = dt.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        });
        const paddingDays = new Date(year, month, 0).getDay(); // Days from prev month

        monthDisplay.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
        calendarGrid.innerHTML = '';

        const tasksByDate = groupTasksByDate();

        for (let i = 1; i <= paddingDays + daysInMonth; i++) {
            const daySquare = document.createElement('div');
            daySquare.classList.add('calendar-day');

            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;

            if (i > paddingDays) {
                daySquare.innerText = i - paddingDays;

                if (i - paddingDays === new Date().getDate() && nav === 0) {
                    daySquare.classList.add('today');
                }
                
                if (tasksByDate[dayString]) {
                    const taskIndicator = document.createElement('div');
                    taskIndicator.classList.add('task-indicator');
                    daySquare.appendChild(taskIndicator);
                }

                if (dayString === selectedDate) {
                    daySquare.classList.add('selected');
                }

                daySquare.addEventListener('click', () => {
                    if (tasksByDate[dayString]) {
                        openDayModal(dayString);
                    } else {
                        selectedDate = dayString;
                        updateSelectedDateDisplay();
                        renderCalendar();
                    }
                });

            } else {
                daySquare.classList.add('other-month');
            }

            calendarGrid.appendChild(daySquare);
        }
    };

    const groupTasksByDate = () => {
        return tasks.reduce((acc, task) => {
            const date = task.dueDate.split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(task);
            return acc;
        }, {});
    };

    const updateSelectedDateDisplay = () => {
        if (selectedDate) {
            const date = new Date(selectedDate + 'T00:00:00'); // Ensure correct timezone interpretation
            const today = new Date();
            today.setHours(0,0,0,0);

            if (date.getTime() === today.getTime()) {
                selectedDateDisplay.innerText = "Deadline: Today";
            } else {
                selectedDateDisplay.innerText = `Deadline: ${date.toLocaleDateString('en-us', { month: 'long', day: 'numeric' })}`;
            }
        } else {
            selectedDateDisplay.innerText = '';
        }
    };

    // --- Modal Functions ---
    const openDayModal = (dateString) => {
        const tasksForDay = groupTasksByDate()[dateString] || [];
        modalTaskList.innerHTML = ''; // Clear previous tasks

        tasksForDay.forEach(task => {
            modalTaskList.appendChild(createTaskListItem(task));
        });

        const modalDate = new Date(dateString + 'T00:00:00');
        modalDateHeader.innerText = modalDate.toLocaleDateString('en-us', { weekday: 'long', month: 'long', day: 'numeric' });
        
        dayDetailModal.classList.remove('hidden');
    };

    const closeDayModal = () => {
        dayDetailModal.classList.add('hidden');
    };

    // --- Core Task Functions ---
    const addTask = () => {
        const taskName = taskInput.value.trim();
        if (taskName === '') return;

        const newTask = {
            id: self.crypto.randomUUID(),
            name: taskName,
            isDailyHabit: isDailyHabitCheckbox.checked,
            isCompleted: false,
            dueDate: new Date(selectedDate + 'T00:00:00').toISOString(), // Use selected date
            completedAt: null
        };

        tasks.push(newTask);
        saveTasks();
        renderEverything();

        taskInput.value = '';
        isDailyHabitCheckbox.checked = false;
        taskInput.focus();
    };

    const deleteTask = (taskId) => {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderEverything();
        // If modal is open, refresh it
        if (!dayDetailModal.classList.contains('hidden')) {
            const date = modalDateHeader.innerText; // This is a bit fragile, better to store date
            // For simplicity, we just close it. A better implementation would refresh it.
            closeDayModal();
        }
    };

    const toggleTaskComplete = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            task.completedAt = task.isCompleted ? new Date().toISOString() : null;
            saveTasks();
            renderEverything();
             // If modal is open, refresh it
             if (!dayDetailModal.classList.contains('hidden')) {
                const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
                openDayModal(dateKey);
            }
        }
    };

    const createTaskListItem = (task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
        li.dataset.taskId = task.id;

        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox';
        checkbox.addEventListener('click', () => toggleTaskComplete(task.id));

        const taskName = document.createElement('span');
        taskName.className = 'task-name';
        taskName.textContent = task.name;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(taskName);
        li.appendChild(deleteBtn);
        return li;
    };


    const renderTaskLists = () => {
        // Clear all lists before rendering
        dailyHabitsList.innerHTML = '';
        oneTimeTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        // Sort tasks: uncompleted first, then by due date
        tasks.sort((a, b) => a.isCompleted - b.isCompleted || new Date(a.dueDate) - new Date(b.dueDate));

        tasks.forEach(task => {
            const taskItem = createTaskListItem(task);

            // Append to the correct list
            if (task.isCompleted) {
                completedTasksList.prepend(taskItem); // Show most recently completed first
            } else if (task.isDailyHabit) {
                dailyHabitsList.appendChild(taskItem);
            } else {
                oneTimeTasksList.appendChild(taskItem);
            }
        });
    };

    const stackDailyHabits = () => {
        const todayStr = new Date().toDateString();
        const lastStackedDate = localStorage.getItem('momentumLastStacked');

        if (lastStackedDate !== todayStr) {
            const uniqueHabitNames = [...new Set(tasks.filter(t => t.isDailyHabit).map(t => t.name))];

            uniqueHabitNames.forEach(habitName => {
                const hasTaskForToday = tasks.some(t =>
                    t.name === habitName && t.isDailyHabit && new Date(t.dueDate).toDateString() === todayStr
                );

                if (!hasTaskForToday) {
                    tasks.push({
                        id: self.crypto.randomUUID(),
                        name: habitName,
                        isDailyHabit: true,
                        isCompleted: false,
                        dueDate: new Date().toISOString(),
                        completedAt: null
                    });
                }
            });

            localStorage.setItem('momentumLastStacked', todayStr);
            saveTasks();
        }
    };

    const renderEverything = () => {
        renderCalendar();
        renderTaskLists();
        updateSelectedDateDisplay();
    };


    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        nav--;
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        nav++;
        renderCalendar();
    });

    modalCloseBtn.addEventListener('click', closeDayModal);
    dayDetailModal.addEventListener('click', (e) => {
        if (e.target === dayDetailModal) {
            closeDayModal();
        }
    });

    // --- PWA & Notification Logic ---
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered successfully.');
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    };

    // --- Initial Load ---
    const initializeApp = () => {
        stackDailyHabits();
        renderEverything();
        registerServiceWorker();
    };

    initializeApp();
});
