
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
