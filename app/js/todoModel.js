
////////////////////////////////////////////////////
// Модель
////////////////////////////////////////////////////

var TodoModel = function (key) {
  this.key = key;
  this.todos = Utils.store(key);
  this.onChanges = [];
};
// Заполняет подписки
TodoModel.prototype.subscribe = function (onChange) {
  this.onChanges.push(onChange);
};
// cb - callback
// Выполняет все колбэки из подписок
TodoModel.prototype.inform = function () {
  Utils.store(this.key, this.todos);
  this.onChanges.forEach(function (cb) { 
    cb(); 
  });
};
// Добавляет новый элемент списка с параметрами
TodoModel.prototype.addTodo = function (title) {
  this.todos = this.todos.concat({
    id: Utils.uuid(),
    title: title,
    completed: false,
    priority: "High",
    state: "New",
    deadline: ""
  });
  this.inform();
};
// Выбирает все элементы списка
TodoModel.prototype.toggleAll = function (checked) {
  this.todos = this.todos.map(function (todo) {
    return Utils.extend({}, todo, {completed: checked});
  });
  this.inform();
};

// Выбор одного элемента
TodoModel.prototype.toggle = function (todoToToggle) {
  this.todos = this.todos.map(function (todo) {
    return todo !== todoToToggle ?
      todo :
      Utils.extend({}, todo, {completed: !todo.completed});
  });
  this.inform();
};
// Удаляет элемент списка
TodoModel.prototype.destroy = function (todo) {
  var answer = confirm('Delete item: "' + todo.title + '"?');
  if (!answer) {
    return;
  }
  this.todos = this.todos.filter(function (candidate) {
    return candidate !== todo;
  }); 
  this.inform();
};

// Сохраняет изменения
TodoModel.prototype.save = function (todoToSave, text, priority, state, deadline) {
  if (!priority && !state) {
    priority = "High";
    state = "New"; 
  }
  this.todos = this.todos.map(function (todo) {
    if (todo !== todoToSave) {
      return todo;
    } else {
      return Utils.extend({}, todo, {title: text, priority: priority, state: state, deadline: deadline});
    }
  });
  this.inform();
};