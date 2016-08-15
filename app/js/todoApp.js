
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

