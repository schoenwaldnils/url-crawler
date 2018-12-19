const ProgressBar = require('progress');
const json2csv = require('json2csv').parse;
const { readJson, outputFile } = require('fs-extra');
const isUrl = require('is-url');

const fetch = require('./fetchWithTimeout.js');
const extractRootDomain = require('./extractRootDomain.js');;

async function crawl(url = 'schoenwald.media') {
  const response = {
    originUrl: url,
    result: undefined,
    reason: undefined,
  }
 
  const validUrl = isUrl(url);

  if (!url.startsWith('http://') && !validUrl.startsWith('https://')) {
    url = `http://${url}`;
  }

  if (!validUrl) {
    response.result = false;
    response.reason = 'Invalid URL';

    return response;
  }


  try {
    const result = await fetch(validUrl, {
      method: 'GET',
    }, 5000);

    console.log(result.status);

    if (result.status < 200 || result.status >= 300) {
      response.result = false;
      response.reason = `Invalid Server Response (${result.status})`;
      return response;
    }

    if (result.url.startsWith('https://')) {
      response.result = true;
      response.validUrl = result.url;
      return response;
    }

    response.result = false;
    response.reason = 'No SSL';
    return response;
  } catch (error) {
    // console.log(error);
    response.result = false;
    response.reason = `Fetch error`;
    return response;
  }
}

(async () => {
  const part = 'part1';
  const urls = await readJson(`./data-${part}.json`) || [];
  
  console.log(`Urls: ${urls.length}`);

  const bar = new ProgressBar('fetching [:bar] :percent :etas', { 
    total: urls.length,
    width: 200,
  });
  
  Promise.all(urls.map(async (url) => {
    result = await crawl(url);
    console.log(result);
    bar.tick();
    return result;
  }))
  .then(results => {
    console.log(results);

    outputFile('result.json', JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.log(`The file result.json has errored!`);
        throw err;
      }
      console.log(`The file result.json has been saved!`);
      process.exit(0);
    });
  })
  .catch(err => {
    console.error(err);
  });

  if (bar.complete) {
    console.log('\ncomplete\n');
  };
})()
