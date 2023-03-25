const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');
  const content = await page.content();
  const $ = cheerio.load(content);
  const repositories = [];
  
  $('li[class="Box-row"]').each((i, element) => {
    const repoTitle = $(element).find('h1 > a').text().trim();
    const description = $(element).find('p[class="col-9 color-text-secondary my-1 pr-4"]').text().trim();
    const url = $(element).find('h1 > a').attr('href');
    const stars = $(element).find('a[class="muted-link d-inline-block mr-3"]').eq(0).text().trim();
    const forks = $(element).find('a[class="muted-link d-inline-block mr-3"]').eq(1).text().trim();
    const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim();
    const repository = {
      repoTitle,
      description,
      url,
      stars,
      forks,
      language
    };
    repositories.push(repository);
  });
  
  await page.click('a[href="/trending/developers?since=daily"]');
  await page.waitForSelector('div[class="user-list-item border-bottom border-gray-light py-4"]');
  const developers = [];
  
  $('div[class="user-list-item border-bottom border-gray-light py-4"]').each((i, element) => {
    const name = $(element).find('h2 > a').text().trim();
    const username = $(element).find('span[class="f4 text-normal"]').text().trim().substring(1);
    const repoName = $(element).find('h2 > a').attr('href').split('/').pop();
    const repoDescription = $(element).find('p[class="f5 color-text-secondary mb-0 mt-1"]').text().trim();
    const developer = {
      name,
      username,
      repoName,
      repoDescription
    };
    developers.push(developer);
  });
  
  const data = {
    repositories,
    developers
  };
  
  fs.writeFile('data.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
  
  await browser.close();
})();