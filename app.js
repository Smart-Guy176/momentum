document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const taskInput = document.getElementById('task-input');
    const isDailyHabitCheckbox = document.getElementById('daily-habit-checkbox');
    const addTaskBtn = document.getElementById('add-task-btn');
    const dailyHabitsList = document.getElementById('daily-habits-list');
    const oneTimeTasksList = document.getElementById('one-time-tasks-list');
    const completedTasksList = document.getElementById('completed-tasks-list');

    // --- Data Management ---
    let tasks = JSON.parse(localStorage.getItem('momentumTasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('momentumTasks', JSON.stringify(tasks));
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
            dueDate: new Date().toISOString(),
            completedAt: null
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        isDailyHabitCheckbox.checked = false;
        taskInput.focus();
    };

    const deleteTask = (taskId) => {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    };

    const toggleTaskComplete = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.isCompleted = !task.isCompleted;
            task.completedAt = task.isCompleted ? new Date().toISOString() : null;
            saveTasks();
            renderTasks();
        }
    };

    const renderTasks = () => {
        // Clear all lists before rendering
        dailyHabitsList.innerHTML = '';
        oneTimeTasksList.innerHTML = '';
        completedTasksList.innerHTML = '';

        // Sort tasks: uncompleted first, then by due date
        tasks.sort((a, b) => a.isCompleted - b.isCompleted || new Date(a.dueDate) - new Date(b.dueDate));

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.isCompleted ? 'completed' : ''}`;
            li.dataset.taskId = task.id;

            // Checkbox
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox';
            checkbox.addEventListener('click', () => toggleTaskComplete(task.id));

            // Task Name
            const taskName = document.createElement('span');
            taskName.className = 'task-name';
            taskName.textContent = task.name;

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.setAttribute('aria-label', 'Delete task');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(taskName);
            li.appendChild(deleteBtn);

            // Append to the correct list
            if (task.isCompleted) {
                completedTasksList.prepend(li); // Show most recently completed first
            } else if (task.isDailyHabit) {
                dailyHabitsList.appendChild(li);
            } else {
                oneTimeTasksList.appendChild(li);
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

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
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
        renderTasks();
        registerServiceWorker();
    };

    initializeApp();
});
