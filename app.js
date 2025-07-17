document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        tasks: JSON.parse(localStorage.getItem('momentumTasksV2')) || [],
        calendarNav: 0, // Month offset from current month
        selectedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    // --- ELEMENT SELECTORS ---
    const elements = {
        taskInput: document.getElementById('task-input'),
        isDailyHabitCheckbox: document.getElementById('daily-habit-checkbox'),
        addTaskBtn: document.getElementById('add-task-btn'),
        dailyHabitsList: document.getElementById('daily-habits-list'),
        oneTimeTasksList: document.getElementById('one-time-tasks-list'),
        upcomingTasksList: document.getElementById('upcoming-tasks-list'),
        completedTasksList: document.getElementById('completed-tasks-list'),
        calendarGrid: document.getElementById('calendar-grid'),
        monthDisplay: document.getElementById('month-display'),
        prevMonthBtn: document.getElementById('prev-month-btn'),
        nextMonthBtn: document.getElementById('next-month-btn'),
        selectedDateHeader: document.getElementById('selected-date-header'),
        clearSelectionBtn: document.getElementById('clear-selection-btn'),
        targetsTitle: document.getElementById('targets-title'),
    };

    // --- DATA PERSISTENCE ---
    const saveTasks = () => {
        localStorage.setItem('momentumTasksV2', JSON.stringify(state.tasks));
    };

    // --- CALENDAR LOGIC ---
    const renderCalendar = () => {
        elements.calendarGrid.style.opacity = '0'; // Start fade out

        setTimeout(() => {
            const dt = new Date();
            if (state.calendarNav !== 0) {
                dt.setMonth(new Date().getMonth() + state.calendarNav, 1);
            }

            const year = dt.getFullYear();
            const month = dt.getMonth();
            
            elements.monthDisplay.innerText = `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
            elements.calendarGrid.innerHTML = '';
            
            const firstDayOfMonth = new Date(year, month, 1);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const paddingDays = firstDayOfMonth.getDay(); // 0 = Sunday

            const tasksByDate = groupTasksByDate();

            for (let i = 1; i <= paddingDays + daysInMonth; i++) {
                const daySquare = document.createElement('div');
                daySquare.classList.add('calendar-day');
                const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i - paddingDays).padStart(2, '0')}`;

                if (i > paddingDays) {
                    daySquare.innerText = i - paddingDays;
                    
                    if (i - paddingDays === new Date().getDate() && state.calendarNav === 0) daySquare.classList.add('today');
                    if (dayString === state.selectedDate) daySquare.classList.add('selected');
                    if (tasksByDate[dayString]?.some(t => !t.isCompleted)) daySquare.classList.add('has-tasks');

                    daySquare.addEventListener('click', () => {
                        state.selectedDate = dayString;
                        renderAll();
                    });
                } else {
                    daySquare.classList.add('other-month');
                }
                elements.calendarGrid.appendChild(daySquare);
            }
            elements.calendarGrid.style.opacity = '1'; // Fade in
        }, 300); // Match CSS transition duration
    };

    // --- TASK LOGIC ---
    const groupTasksByDate = () => state.tasks.reduce((acc, task) => {
        const date = task.dueDate.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(task);
        return acc;
    }, {});

    const addTask = () => {
        const taskName = elements.taskInput.value.trim();
        if (taskName === '') return;

        state.tasks.push({
            id: self.crypto.randomUUID(),
            name: taskName,
            isDailyHabit: elements.isDailyHabitCheckbox.checked,
            isCompleted: false,
            dueDate: new Date(state.selectedDate + 'T00:00:00').toISOString(),
            completedAt: null
        });

        saveTasks();
        renderAll();
        elements.taskInput.value = '';
        elements.isDailyHabitCheckbox.checked = false;
        elements.taskInput.focus();
    };

    const deleteTask = (taskId) => {
        state.tasks = state.tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderAll();
    };

    const toggleTaskComplete = (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            task.completedAt = task.isCompleted ? new Date().toISOString() : null;
            saveTasks();
            renderAll();
        }
    };

    // --- UI RENDERING ---
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
        // Clear all lists
        Object.values(elements).forEach(el => {
            if (el.classList?.contains('task-list')) el.innerHTML = '';
        });

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const sortedTasks = [...state.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        const tasksForSelectedDate = sortedTasks.filter(t => t.dueDate.split('T')[0] === state.selectedDate && !t.isCompleted);
        
        tasksForSelectedDate.forEach(task => elements.oneTimeTasksList.appendChild(createTaskListItem(task)));

        sortedTasks.forEach(task => {
            const taskDate = new Date(task.dueDate);
            if (task.isCompleted) {
                elements.completedTasksList.prepend(createTaskListItem(task));
            } else if (task.isDailyHabit) {
                elements.dailyHabitsList.appendChild(createTaskListItem(task));
            } else if (taskDate > today && taskDate <= nextWeek) {
                elements.upcomingTasksList.appendChild(createTaskListItem(task));
            }
        });
    };

    const updateUIForSelectedDate = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const date = new Date(state.selectedDate + 'T00:00:00');
        
        if (state.selectedDate === todayStr) {
            elements.selectedDateHeader.innerText = "Today";
            elements.targetsTitle.innerText = "Today's Targets";
            elements.taskInput.placeholder = "Add a new target for Today...";
            elements.clearSelectionBtn.classList.add('hidden');
        } else {
            const dayName = date.toLocaleDateString('en-us', { weekday: 'long' });
            const dateString = date.toLocaleDateString('en-us', { month: 'long', day: 'numeric' });
            elements.selectedDateHeader.innerText = `${dayName}, ${dateString}`;
            elements.targetsTitle.innerText = `Targets for ${dateString}`;
            elements.taskInput.placeholder = `Add a new target for ${dateString}...`;
            elements.clearSelectionBtn.classList.remove('hidden');
        }
    };
    
    const stackDailyHabits = () => {
        const todayStr = new Date().toDateString();
        const lastStackedDate = localStorage.getItem('momentumLastStackedV2');

        if (lastStackedDate !== todayStr) {
            const uniqueHabitNames = [...new Set(state.tasks.filter(t => t.isDailyHabit).map(t => t.name))];
            uniqueHabitNames.forEach(habitName => {
                state.tasks.push({
                    id: self.crypto.randomUUID(),
                    name: habitName,
                    isDailyHabit: true,
                    isCompleted: false,
                    dueDate: new Date().toISOString(),
                    completedAt: null
                });
            });
            localStorage.setItem('momentumLastStackedV2', todayStr);
            saveTasks();
        }
    };

    const renderAll = () => {
        renderCalendar();
        renderTaskLists();
        updateUIForSelectedDate();
    };

    // --- EVENT LISTENERS ---
    const initEventListeners = () => {
        elements.addTaskBtn.addEventListener('click', addTask);
        elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        elements.prevMonthBtn.addEventListener('click', () => {
            state.calendarNav--;
            renderCalendar();
        });

        elements.nextMonthBtn.addEventListener('click', () => {
            state.calendarNav++;
            renderCalendar();
        });
        
        elements.clearSelectionBtn.addEventListener('click', () => {
            state.selectedDate = new Date().toISOString().split('T')[0];
            renderAll();
        });
    };

    // --- INITIALIZATION ---
    const initializeApp = () => {
        stackDailyHabits();
        initEventListeners();
        renderAll();
        // Service worker registration can be added here if needed
    };

    initializeApp();
});
