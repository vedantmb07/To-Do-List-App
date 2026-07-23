const addTodoBtn = document.getElementById("addTodoBtn");
const inputTag = document.getElementById("todoInput");
const todoListUl = document.getElementById("todoList");
const remaining = document.getElementById("remaining-count");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
const daySelector = document.getElementById("daySelector");
const confirmModal = document.getElementById("confirmModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

let currentFilter = "all";
let pendingDeleteId = null;
let appState = {
    selectedDay: getTodayName(),
    lists: {},
};

function getTodayName() {
    return dayNames[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
}

function loadState() {
    const storedState = localStorage.getItem("dailyTodoState");
    const legacyTodos = localStorage.getItem("todos");

    if (storedState) {
        appState = JSON.parse(storedState);
    }

    if (legacyTodos && (!storedState || !appState.lists || Object.keys(appState.lists).length === 0)) {
        appState.lists[appState.selectedDay] = JSON.parse(legacyTodos);
    }

    appState.selectedDay = dayNames.includes(appState.selectedDay) ? appState.selectedDay : getTodayName();
    dayNames.forEach((day) => {
        if (!appState.lists[day]) {
            appState.lists[day] = [];
        }
    });
}

function saveState() {
    localStorage.setItem("dailyTodoState", JSON.stringify(appState));
}

function getCurrentDayTodos() {
    return appState.lists[appState.selectedDay] || [];
}

function getVisibleTodos() {
    const todos = getCurrentDayTodos();
    return todos.filter((todo) => {
        if (currentFilter === "all") return true;
        if (currentFilter === "active") return !todo.isCompleted;
        if (currentFilter === "completed") return todo.isCompleted;
        return true;
    });
}

function updateRemainingCount() {
    const currentTodos = getCurrentDayTodos();
    remaining.innerHTML = currentTodos.filter((item) => !item.isCompleted).length;
}

function updateActiveFilterClass() {
    filterButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === currentFilter);
    });
}

function openDeleteModal(todoId) {
    pendingDeleteId = todoId;
    confirmModal.classList.remove("hidden");
}

function closeDeleteModal() {
    pendingDeleteId = null;
    confirmModal.classList.add("hidden");
}

function renderDaySelector() {
    daySelector.innerHTML = "";

    dayNames.forEach((day) => {
        const button = document.createElement("button");
        const dayTasks = appState.lists[day] || [];
        const activeTaskCount = dayTasks.filter((task) => !task.isCompleted).length;

        button.type = "button";
        button.className = `day-chip ${appState.selectedDay === day ? "selected" : ""}`;
        button.innerHTML = `
            <span>${day}</span>
            <span class="day-count">${activeTaskCount} task${activeTaskCount === 1 ? "" : "s"}</span>
        `;

        button.addEventListener("click", () => {
            appState.selectedDay = day;
            saveState();
            renderDaySelector();
            renderTodos();
        });

        daySelector.appendChild(button);
    });
}

function renderTodos() {
    const visibleTodos = getVisibleTodos();
    let html = "";

    if (visibleTodos.length === 0) {
        html = `<li class="empty-state">No tasks for ${appState.selectedDay} yet.</li>`;
    } else {
        for (const todo of visibleTodos) {
            html += ` <li id="${todo.id}" class="todo-item ${todo.isCompleted ? "completed" : ""}">
                        <input type="checkbox" class="todo-checkbox" ${todo.isCompleted ? "checked" : ""}>
                        <span class="todo-text">${todo.title}</span>
                        <button class="delete-btn" type="button">×</button>
                      </li>`;
        }
    }

    todoListUl.innerHTML = html;
    updateRemainingCount();
    updateActiveFilterClass();
    renderDaySelector();

    const todoCheckboxes = document.querySelectorAll(".todo-checkbox");
    todoCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            const todoId = checkbox.parentNode.id;
            appState.lists[appState.selectedDay] = (appState.lists[appState.selectedDay] || []).map((todo) => {
                if (todo.id === todoId) {
                    return { ...todo, isCompleted: checkbox.checked };
                }
                return todo;
            });
            saveState();
            renderTodos();
        });
    });

    const deleteBtns = document.querySelectorAll(".delete-btn");
    deleteBtns.forEach((button) => {
        button.addEventListener("click", () => {
            const todoId = button.closest(".todo-item").id;
            openDeleteModal(todoId);
        });
    });
}

const setFilter = (filter) => {
    currentFilter = filter;
    renderTodos();
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });
});

confirmDeleteBtn.addEventListener("click", () => {
    if (!pendingDeleteId) return;

    appState.lists[appState.selectedDay] = (appState.lists[appState.selectedDay] || []).filter((todo) => todo.id !== pendingDeleteId);
    saveState();
    renderTodos();
    closeDeleteModal();
});

cancelDeleteBtn.addEventListener("click", closeDeleteModal);
confirmModal.addEventListener("click", (event) => {
    if (event.target === confirmModal) {
        closeDeleteModal();
    }
});

clearCompletedBtn.addEventListener("click", () => {
    appState.lists[appState.selectedDay] = (appState.lists[appState.selectedDay] || []).filter((todo) => !todo.isCompleted);
    saveState();
    renderTodos();
});

const addNewTodo = () => {
    const todoText = inputTag.value.trim();
    if (todoText.length < 5) {
        alert("Add a task with minimum 5 characters.");
        return;
    }

    const todo = {
        title: todoText,
        id: "todo-" + Date.now(),
        isCompleted: false,
    };

    appState.lists[appState.selectedDay] = appState.lists[appState.selectedDay] || [];
    appState.lists[appState.selectedDay].push(todo);
    saveState();
    inputTag.value = "";
    renderTodos();
};

addTodoBtn.addEventListener("click", addNewTodo);
inputTag.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addNewTodo();
    }
});

loadState();
renderTodos();