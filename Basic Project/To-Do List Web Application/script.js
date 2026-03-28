//Select Dom Elements
const input = document.getElementById('todo-input')
const addBtn = document.getElementById('add-btn')
const list = document.getElementById('todo-list')

//Try To Load Saved Todos From LocalStorages
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

function saveTodos(){
    //Save Current Todos Array To LocalStorage
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Creat The Whole Todo List From Array
function createTodoNode(todo,index){

    const li = document.createElement('li');

    //check box to Toggle Complition
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!todo.completed;
    checkbox.addEventListener("change",()=>{
        todo.completed = checkbox.checked;

        //todo : Visual Feedback: Strike-Through When Completed
        textSpan.style.textDecoration = 'line-through';
        saveTodos();
    })

    //TextOf The Todo
    const textSpan = document.createElement("span");
    textSpan.textContent = todo.text;
    textSpan.style.margin = '0 8px';
    if(todo.completed){
        textSpan.style.textDecoration = 'line-through';
    }

    //Add Double-Click Event Listener
    textSpan.addEventListener("dblclick",()=>{
        const newText = prompt("Edit todo",todo.text);
        if(newText){
            todo.text = newText;
            textSpan.textContent = newText;
            saveTodos();
        }
    })

    //Delete Todo Button
    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.addEventListener('click',()=>{
        todos.splice(index,1);
        render();
        saveTodos();
    })

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(delBtn);
    return li
}

//Render The Whole Todo List From Todo Array
function render(){
    list.innerHTML = '';

    //Recreate Each Item
    todos.forEach((todo,index) => {
        const node = createTodoNode(todo,index);
        console.log(node,todo)
        list.appendChild(node)
    });
}

function addTodo(){
    const text = input.value.trim();
    if(!text){
        return
    }

    //push A New Todo Object
    todos.push({ text: text, completed: false });

    input.value = '';

    render();
    saveTodos();
}

// Button Click Event
addBtn.addEventListener('click', addTodo);

//Press Enter TO Add Todo
addBtn.addEventListener("click",addTodo);
input.addEventListener('keydown',(e) => {
    if(e.key == 'Enter'){
        addTodo();
    }
})


// Initial Render
render();