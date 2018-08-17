module.exports = () => {
  var random, value;
  var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    random = Math.random() * 16 | 0;
    value = (c === 'x') ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });

  return id;
};