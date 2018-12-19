const fetch = require('isomorphic-fetch');

module.exports = function (url, options, ms = 7000) {
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in '+ ms + 'ms.');
    }, ms)
  })

  return Promise.race([
    fetch(url, options),
    timeout,
  ]);
}