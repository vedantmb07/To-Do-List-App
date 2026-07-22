const addTodoBtn = document.getElementById("addTodoBtn");
const inputTag = document.getElementById("todoInput");
const todoListUl = document.getElementById("todoList");
const remaining = document.getElementById("remaining-count");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
let todos = [];
let currentFilter = "all";

const todosString = localStorage.getItem("todos");
if (todosString) {
    todos = JSON.parse(todosString);
}

const getVisibleTodos = () => {
    return todos.filter((todo) => {
        if (currentFilter === "all") return true;
        if (currentFilter === "active") return !todo.isCompleted;
        if (currentFilter === "completed") return todo.isCompleted;
        return true;
    });
};

const updateRemainingCount = () => {
    remaining.innerHTML = todos.filter((item) => !item.isCompleted).length;
};

const updateActiveFilterClass = () => {
    filterButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === currentFilter);
    });
};

const saveTodos = () => {
    localStorage.setItem("todos", JSON.stringify(todos));
};

const renderTodos = () => {
    const visibleTodos = getVisibleTodos();
    let html = "";

    for (const todo of visibleTodos) {
        html += ` <li id="${todo.id}" class="todo-item ${todo.isCompleted ? "completed" : ""}">
                    <input type="checkbox" class="todo-checkbox" ${todo.isCompleted ? "checked" : ""}>
                    <span class="todo-text">${todo.title}</span>
                    <button class="delete-btn">×</button>
                    </li>`;
    }

    todoListUl.innerHTML = html;
    updateRemainingCount();
    updateActiveFilterClass();

    const todoCheckboxes = document.querySelectorAll(".todo-checkbox");
    todoCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            const todoId = checkbox.parentNode.id;
            todos = todos.map((todo) => {
                if (todo.id === todoId) {
                    return { ...todo, isCompleted: checkbox.checked };
                }
                return todo;
            });
            saveTodos();
            renderTodos();
        });
    });

    const deleteBtns = document.querySelectorAll(".delete-btn");
    deleteBtns.forEach((button) => {
        button.addEventListener("click", (e) => {
            const confirmation = confirm("Do you want to delete this task?");
            if (!confirmation) return;
            const todoId = e.target.parentNode.id;
            todos = todos.filter((todo) => todo.id !== todoId);
            saveTodos();
            renderTodos();
        });
    });
};

const setFilter = (filter) => {
    currentFilter = filter;
    renderTodos();
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });
});

clearCompletedBtn.addEventListener("click", () => {
    todos = todos.filter((todo) => !todo.isCompleted);
    saveTodos();
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

    todos.push(todo);
    saveTodos();
    inputTag.value = "";
    renderTodos();
};

addTodoBtn.addEventListener("click", addNewTodo);
inputTag.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addNewTodo();
    }
});

renderTodos();