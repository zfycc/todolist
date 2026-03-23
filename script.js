// 存储键名
const STORAGE_KEY = 'todo-list';
let todos = [];
let currentFilter = 'all';
let editingTodoId = null;
let deletingTodoId = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  setupEventListeners();
});

// 加载任务
function loadTodos() {
  const storedTodos = localStorage.getItem(STORAGE_KEY);
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
  renderTodos();
  updateStats();
}

// 保存任务
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 渲染任务列表
function renderTodos() {
  const todoList = document.getElementById('todo-list');
  const emptyTip = document.getElementById('empty-tip');
  
  // 筛选任务
  const filteredTodos = filterTodos(todos, currentFilter);
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = '';
    emptyTip.classList.remove('hidden');
  } else {
    emptyTip.classList.add('hidden');
    todoList.innerHTML = filteredTodos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''} flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 rounded-md">
        <div class="flex items-center flex-1">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                 class="mr-3 h-5 w-5 text-green-500 rounded focus:ring-green-500"
                 data-id="${todo.id}"
                 onchange="toggleTodo('${todo.id}')">
          <span class="todo-content text-gray-800">${todo.content}</span>
        </div>
        <div class="flex space-x-2">
          <button class="text-blue-500 hover:text-blue-700"
                  onclick="editTodo('${todo.id}')">
            <i class="fa fa-pencil"></i>
          </button>
          <button class="text-red-500 hover:text-red-700"
                  onclick="confirmDelete('${todo.id}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </li>
    `).join('');
  }
}

// 筛选任务
function filterTodos(todos, filter) {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed);
    case 'completed':
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
}

// 更新统计信息
function updateStats() {
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;
  
  document.getElementById('total-count').textContent = totalCount;
  document.getElementById('completed-count').textContent = completedCount;
}

// 添加任务
function addTodo() {
  const input = document.getElementById('todo-input');
  const content = input.value.trim();
  
  if (content) {
    const newTodo = {
      id: Date.now().toString(),
      content,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
    input.value = '';
  }
}

// 切换任务完成状态
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    saveTodos();
    renderTodos();
    updateStats();
  }
}

// 编辑任务
function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    editingTodoId = id;
    document.getElementById('edit-input').value = todo.content;
    document.getElementById('edit-modal').classList.remove('hidden');
  }
}

// 保存编辑
function saveEdit() {
  const content = document.getElementById('edit-input').value.trim();
  if (content && editingTodoId) {
    const todo = todos.find(t => t.id === editingTodoId);
    if (todo) {
      todo.content = content;
      todo.updatedAt = new Date().toISOString();
      saveTodos();
      renderTodos();
      updateStats();
    }
    closeEditModal();
  }
}

// 确认删除
function confirmDelete(id) {
  deletingTodoId = id;
  document.getElementById('delete-modal').classList.remove('hidden');
}

// 执行删除
function deleteTodo() {
  if (deletingTodoId) {
    todos = todos.filter(t => t.id !== deletingTodoId);
    saveTodos();
    renderTodos();
    updateStats();
    closeDeleteModal();
  }
}

// 关闭编辑模态框
function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingTodoId = null;
}

// 关闭删除模态框
function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  deletingTodoId = null;
}

// 设置筛选
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  renderTodos();
}

// 设置事件监听器
function setupEventListeners() {
  // 添加任务按钮
  document.getElementById('add-btn').addEventListener('click', addTodo);
  
  // 输入框回车事件
  document.getElementById('todo-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
  
  // 筛选按钮
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setFilter(e.target.dataset.filter);
    });
  });
  
  // 编辑模态框
  document.getElementById('save-edit').addEventListener('click', saveEdit);
  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  
  // 删除模态框
  document.getElementById('confirm-delete').addEventListener('click', deleteTodo);
  document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
}