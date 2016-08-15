
///////////////////////////////////////////////////////////
// Todo list item
///////////////////////////////////////////////////////////

var TodoItem = React.createClass({
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
      <li className={classNames({
					completed: this.props.todo.completed,
					editing: this.props.editing
				})}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            // onChange={this.props.onToggle}
          />
          <label onDoubleClick={this.handleEdit}>
            {this.props.todo.title}
          </label>
          <span className="view-sub-label">Priority:</span>
          <select 
            className="view-sub-property"
            onChange={this.handleSelPriorityChange}
            value={this.state.selectPriority}
            ref="selectingComponent"
            >
            <option value="High">High</option>
            <option value="Middle">Middle</option>
            <option value="Low">Low</option>
          </select>
          <span className="view-sub-label">State:</span>
          <select 
            className="view-sub-property"
            onChange={this.handleSelStateChange}
            value={this.state.selectState}
            >
            <option value="New">New</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <span className="view-sub-label">Deadline:</span>
          <input 
            className="view-sub-date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={this.state.deadline}
            onChange={this.handleDateChange}
          />
          <button className="destroy" onClick={this.props.onDestroy} />
        </div>
        <input
          ref="editField"
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </li>
    );
  }
});
