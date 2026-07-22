const addTodoBtn = document.getElementById("addTodoBtn");
let inputTag = document.getElementById("todoInput");
const todoListUl = document.getElementById("todoList");
const remaining = document.getElementById("remaining-count");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
let todoText;
let todos = [];

let todosString = localStorage.getItem("todos");
if(todosString){
    todos = JSON.parse(todosString);
    remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
}

const populatedTodos = () => {
    let string = "";
    for (const todo of todos) {
        string += ` <li id="${todo.id}" class="todo-item ${todo.isCompleted ? "completed" : ""}">
                    <input type="checkbox" class="todo-checkbox" ${todo.isCompleted ? "checked": ""}>
                    <span class="todo-text">${todo.title}</span>
                    <button class="delete-btn">×</button>
                    </li>`
    }
    todoListUl.innerHTML = string;


    //CHECKBOXES BUTTON
    const todoCheckboxes = document.querySelectorAll(".todo-checkbox");

    todoCheckboxes.forEach((element) => {
        element.addEventListener("click", (e) => {
            if(e.target.checked){
                element.parentNode.classList.add("completed")

                todos = todos.map(todo => {
                    if(todo.id == element.parentNode.id){
                        return {...todo, isCompleted: true}
                    } else {
                        return todo;
                    }
                })
                remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
                localStorage.setItem("todos", JSON.stringify(todos));
            } else {
                element.parentNode.classList.remove("completed")
                todos = todos.map(todo => {
                    if(todo.id == element.parentNode.id){
                        return {...todo, isCompleted: false}
                    } else {
                        return todo;
                    }
                })
                remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
                localStorage.setItem("todos", JSON.stringify(todos))
            }
        })
    })


    clearCompletedBtn.addEventListener("click", () => {
        todos = todos.filter((todo) => {todo.isCompleted == false})
        populatedTodos()
        remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
        localStorage.setItem("todos", JSON.stringify(todos))
    })

    //DELETE BUTTON 
    let deleteBtns = document.querySelectorAll(".delete-btn");

    deleteBtns.forEach((element) => {
        element.addEventListener("click", (e) => {
            const confirmation = confirm("Do you want to delete this task?");
            if(confirmation){
                todos = todos.filter((todo) => {
                    return (todo.id) !== (e.target.parentNode.id);
                })
                remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
                localStorage.setItem("todos", JSON.stringify(todos));
                populatedTodos();
            }
        })
    });
}


addTodoBtn.addEventListener("click", () => {
    todoText = inputTag.value;

    if(todoText.trim().length < 4) {
        alert("Add a task with minimum 5 characters.")
        return;
    }
    inputTag.value = "";

    let todo = {
        title: todoText,
        id: "todo-" + Date.now(),
        isCompleted: false
    }
    
    todos.push(todo);
    remaining.innerHTML = todos.filter((item) => {return item.isCompleted != true}).length;
    localStorage.setItem("todos", JSON.stringify(todos));
    populatedTodos();
})

populatedTodos();