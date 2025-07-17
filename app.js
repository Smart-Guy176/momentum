:root {
    --bg-color: #1a1a1a;
    --glass-bg: rgba(44, 44, 44, 0.6);
    --primary-color: #00f2ea;
    --text-primary: #f0f0f0;
    --text-secondary: #a0a0a0;
    --border-color: rgba(255, 255, 255, 0.1);
    --error-color: #ff453a;
    --shadow-color: rgba(0, 0, 0, 0.2);
}

*, *::before, *::after {
    box-sizing: border-box;
}

body {
    font-family: 'Nunito', sans-serif;
    background-color: var(--bg-color);
    background-image: radial-gradient(circle at top left, var(--primary-color), transparent 30%), radial-gradient(circle at bottom right, #5b21b6, transparent 40%);
    background-attachment: fixed;
    color: var(--text-primary);
    margin: 0;
    overflow-x: hidden;
}

.app-container {
    display: flex;
    height: 100vh;
    padding: 20px;
    gap: 20px;
}

/* --- Calendar Panel (Left) --- */
.calendar-panel {
    flex-basis: 40%;
    max-width: 450px;
    padding: 30px;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px var(--shadow-color);
    display: flex;
    flex-direction: column;
}

.calendar-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary-color);
    margin: 0;
}

.calendar-header p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 4px 0 32px 0;
}

.calendar-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.calendar-controls h2 {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    flex-grow: 1;
    color: var(--text-primary);
}

.calendar-controls button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 2.2rem;
    cursor: pointer;
    transition: color 0.3s;
}

.calendar-controls button:hover {
    color: var(--primary-color);
}

#weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 12px;
}

#calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    transition: opacity 0.4s ease;
}

.calendar-day {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1 / 1;
    font-size: 1rem;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    border: 2px solid transparent;
}
.calendar-day.other-month {
    color: #555;
    cursor: default;
}
.calendar-day:not(.other-month):hover {
    background-color: var(--border-color);
}
.calendar-day.today {
    border-color: var(--primary-color);
}
.calendar-day.selected {
    background-color: var(--primary-color);
    color: #000;
    font-weight: 700;
}
.calendar-day.has-tasks::after {
    content: '';
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: var(--primary-color);
    border-radius: 50%;
}
.calendar-day.selected.has-tasks::after {
    background-color: #000;
}


/* --- Tasks Panel (Right) --- */
.tasks-panel {
    flex-grow: 1;
    overflow-y: auto;
    background: var(--glass-bg);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px var(--shadow-color);
}
.tasks-panel-inner {
    padding: 30px 40px;
}

/* Custom scrollbar */
.tasks-panel::-webkit-scrollbar { width: 6px; }
.tasks-panel::-webkit-scrollbar-track { background: transparent; }
.tasks-panel::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
.tasks-panel::-webkit-scrollbar-thumb:hover { background: var(--text-secondary); }

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}
.task-header h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
}
#clear-selection-btn {
    background: var(--border-color);
    border: none;
    color: var(--text-primary);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}
#clear-selection-btn:hover { background-color: var(--primary-color); color: #000; }
#clear-selection-btn.hidden { display: none; }


.add-task-form {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}
#task-input {
    flex-grow: 1;
    padding: 14px;
    font-size: 1.1rem;
    font-family: 'Nunito', sans-serif;
    background-color: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    transition: border-color 0.2s, box-shadow 0.2s;
}
#task-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(0, 242, 234, 0.2);
}
#add-task-btn {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    background-color: var(--primary-color);
    color: #000;
    border: none;
    border-radius: 12px;
    font-size: 2rem;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s;
}
#add-task-btn:hover { transform: scale(1.1) rotate(90deg); }

.daily-habit-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1rem;
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: 32px;
}

/* --- Task Lists --- */
.task-section-title {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
    margin: 24px 0 12px 0;
}

.task-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.task-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 8px;
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;
    opacity: 1;
    transform: translateX(0);
}
.task-item:last-child { border-bottom: none; }
.task-item.completed { opacity: 0.4; }
.task-item.completed .task-name { text-decoration: line-through; }

.checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.3s;
}
.task-item.completed .checkbox {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}
.task-name {
    flex-grow: 1;
    font-size: 1.1rem;
    word-break: break-word;
}
.delete-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.8rem;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s, color 0.2s;
}
.task-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { color: var(--error-color); }


/* --- Responsive Design --- */
@media (max-width: 1024px) {
    body { height: auto; }
    .app-container { flex-direction: column; height: auto; }
    .calendar-panel { max-width: 100%; }
    .tasks-panel { overflow-y: visible; }
    .tasks-panel-inner { padding: 25px; }
}
@media (max-width: 600px) {
    .app-container { padding: 8px; gap: 8px; }
    .calendar-panel, .tasks-panel-inner { padding: 16px; }
    .calendar-header h1 { font-size: 2rem; }
    .task-header h2 { font-size: 1.5rem; }
    #add-task-btn { width: 44px; height: 44px; font-size: 1.5rem; }
    #task-input { padding: 12px; font-size: 1rem; }
    .delete-btn { opacity: 1; }
}
