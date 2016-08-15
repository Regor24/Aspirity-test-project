
var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
// Набор функций для работы с данными
var Utils = {
// Возвращает уникальный идентификатор для хранилища
uuid: function () {
  var i, random;
  var uuid = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-';
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16);
  }

  return uuid;
},
// Вносит в локальное хранилище значение пункта списка
store: function (namespace, data) {
  if (data) {
    return localStorage.setItem(namespace, JSON.stringify(data));
  }

  var store = localStorage.getItem(namespace);
  return (store && JSON.parse(store)) || [];
},
// Ограничитель максимальной длины записи
maxStrLen: function(str, max) {
  return str.substr(0, max);
},
// Возвращает новый объект из элементов todo со свойствами типа ID, completed, title
extend: function () {
  var newObj = {};
  for (var i = 0; i < arguments.length; i++) {
    var obj = arguments[i];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
}
};


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

///////////////////////////////////////////////////////////
// Todo list item
///////////////////////////////////////////////////////////

var TodoItem = React.createClass({displayName: "TodoItem",
  getInitialState: function () {
    return {
      editText: this.props.todo.title,
      selectPriority: this.props.todo.priority,
      selectState: this.props.todo.state,
      deadline: this.props.todo.deadline
    };
  },
  handleSubmit: function (event) {
    var val = this.state.editText.trim();
    var currPriority = this.state.selectPriority;
    var currState = this.state.selectState;
    var deadline = this.state.deadline;
    if (val) {
      this.props.onSave(val, currPriority, currState, deadline);
      this.setState({editText: val});
    } else {
      this.props.onDestroy();
    }
  },
  handleEdit: function () {
    this.props.onEdit();
    this.setState({editText: this.props.todo.title});
  },
  // Обработка подтверждения или отмены измений
  handleKeyDown: function (event) {
    if (event.which === ESCAPE_KEY) {
      this.setState({editText: this.props.todo.title});
      this.props.onCancel(event);
    } else if (event.which === ENTER_KEY) {
      this.handleSubmit(event);
    }
  },
  handleChange: function (event) {
    if (this.props.editing) {
  // Максимум 50 символов в тексте задачи
       this.setState({
         editText: Utils.maxStrLen(event.target.value, 50)
        });
    }
  },
  // Селект приоритета
  handleSelPriorityChange: function(event) {
    this.setState({
      selectPriority: event.target.value
    }, function(){
        this.handleSubmit();
    });
  },
  // Селект статуса
  handleSelStateChange: function(event) {
    // Асинхронность setState иногда не позволяет сразу использовать новый state, поэтому
    // используется второй параметр - функция, выполняющаяся сразу после ре-рендеринга
    this.setState({
      selectState: event.target.value
    }, function(){
        this.handleSubmit();
    });
  },
  handleDateChange: function(event) {
    this.setState({
      deadline: event.target.value
    }, function(){
        this.handleSubmit();
    });  
  },
  // После вызова this.props.onEdit() в методе handleEdit - безопасно обновляет ДОМ
  componentDidUpdate: function (prevProps) {
    if (!prevProps.editing && this.props.editing) {
      var node = ReactDOM.findDOMNode(this.refs.editField);
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  },
  render: function () {
    return (
      // Доп. библиотека classNames - позволяет задавать несколько классов для элемента по условию
      React.createElement("li", {className: classNames({
					completed: this.props.todo.completed,
					editing: this.props.editing
				})}, 
        React.createElement("div", {className: "view"}, 
          React.createElement("input", {
            className: "toggle", 
            type: "checkbox", 
            checked: this.props.todo.completed, 
            onChange: this.props.onToggle}
          ), 
          React.createElement("label", {onDoubleClick: this.handleEdit}, 
            this.props.todo.title
          ), 
          React.createElement("span", {className: "view-sub-label"}, "Priority:"), 
          React.createElement("select", {
            className: "view-sub-property", 
            onChange: this.handleSelPriorityChange, 
            value: this.state.selectPriority, 
            ref: "selectingComponent"
            }, 
            React.createElement("option", {value: "High"}, "High"), 
            React.createElement("option", {value: "Middle"}, "Middle"), 
            React.createElement("option", {value: "Low"}, "Low")
          ), 
          React.createElement("span", {className: "view-sub-label"}, "State:"), 
          React.createElement("select", {
            className: "view-sub-property", 
            onChange: this.handleSelStateChange, 
            value: this.state.selectState
            }, 
            React.createElement("option", {value: "New"}, "New"), 
            React.createElement("option", {value: "Active"}, "Active"), 
            React.createElement("option", {value: "Resolved"}, "Resolved"), 
            React.createElement("option", {value: "Closed"}, "Closed")
          ), 
          React.createElement("span", {className: "view-sub-label"}, "Deadline:"), 
          React.createElement("input", {
            className: "view-sub-date", 
            type: "date", 
            min: new Date().toISOString().split('T')[0], 
            value: this.state.deadline, 
            onChange: this.handleDateChange}
          ), 
          React.createElement("button", {className: "destroy", onClick: this.props.onDestroy})
        ), 
        React.createElement("input", {
          ref: "editField", 
          className: "edit", 
          value: this.state.editText, 
          onBlur: this.handleSubmit, 
          onChange: this.handleChange, 
          onKeyDown: this.handleKeyDown}
        )
      )
    );
  }
});


///////////////////////////////////////////////////////////
// Main module
///////////////////////////////////////////////////////////

var TodoApp = React.createClass({displayName: "TodoApp",
  getInitialState: function () {
    return {
      editing: null,
      newTodo: ''
    };
  },
  // устанавливаем значение для нового элемента списка через состояние
  handleChange: function (event) {
  // Максимум 50 символов
    this.setState({newTodo: Utils.maxStrLen(event.target.value, 50)});
  },
  // Создает новый элемент списка по нажатию энтер
  handleNewTodoKeyDown: function (event) {
    if (event.keyCode !== ENTER_KEY) {
      return;
    }
    event.preventDefault();
    var val = this.state.newTodo.trim();
    if (val) {
      this.props.model.addTodo(val);
      this.setState({newTodo: ''});
    }
  },
  toggleAll: function (event) {
    var checked = event.target.checked;
    this.props.model.toggleAll(checked);
  },
  toggle: function (todoToToggle) {
    this.props.model.toggle(todoToToggle);
  },
  destroy: function (todo) {
    this.props.model.destroy(todo);
  },
  edit: function (todo) {
    this.setState({editing: todo.id});
  },
  // Сохраняет параметры записи в локальном хранилище через методы модели
  save: function (todoToSave, text, priority, state, deadline) {
    this.props.model.save(todoToSave, text, priority, state, deadline);
    this.setState({editing: null});
  },
  cancel: function () {
    this.setState({editing: null});
  },
  render: function () {
    var main;
    var todos = this.props.model.todos;
    var todoItems = todos.map(function (todo) {
      return (
        React.createElement(TodoItem, {
          key: todo.id, 
          todo: todo, 
          onToggle: this.toggle.bind(this, todo), 
          onDestroy: this.destroy.bind(this, todo), 
          onEdit: this.edit.bind(this, todo), 
          editing: this.state.editing === todo.id, 
          onSave: this.save.bind(this, todo), 
          onCancel: this.cancel}
        )
      );
    }, this);
    // Если в списке есть элементы, генерирует его в рендере
    if (todos.length) {
      main = (
        React.createElement("section", {className: "main"}, 
          React.createElement("input", {
            className: "toggle-all", 
            type: "checkbox", 
            onChange: this.toggleAll}
          ), 
          React.createElement("ul", {className: "todo-list"}, 
            todoItems
          )
        )
      );
    }
    return (
      React.createElement("div", null, 
        React.createElement("header", {className: "header"}, 
          React.createElement("h1", null, "Task manager"), 
          React.createElement("input", {
            className: "new-todo", 
            placeholder: "Type and click ENTER", 
            value: this.state.newTodo, 
            onKeyDown: this.handleNewTodoKeyDown, 
            onChange: this.handleChange, 
            autoFocus: true}
          )
        ), 
        main
      )
    );
  }
});

var model = new TodoModel('react-todos');

// Рендерит результат 
function render() {
  ReactDOM.render(
    // Задаем props из модели
    React.createElement(TodoApp, {model: model}),
    document.querySelector('.todoapp')
  );
}

// render() выполнится при изменениях в модели 
model.subscribe(render);

// Запускает рендер
render();

