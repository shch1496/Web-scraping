const puppeteer = require("puppeteer");
const fs = require("fs");
const data = {
  list: [],
};
async function main(skill) {
  // Launches chromium
  // headless: false - > We will see the browser opeing
  const browser = await puppeteer.launch({ headless: false });
  // Open new tab
  const page = await browser.newPage();

  // access indeed.com page by provinding a skill
  await page.goto(`https://in.indeed.com/jobs?q=${skill}&l=Banglore`, {
    timeout: 0,
    waitUntil: "networkidle0",
  });

  console.log(`in.indeed.com/jobs?q=${skill}&l=Banglore`);
  const jobData = await page.evaluate(async (data) => {
    const items = document.querySelectorAll("td.resultContent");
    items.forEach((item, index) => {
      const title = item.querySelector("h2.jobTitle>a")?.innerText;
      const link = item.querySelector("h2.jobTitle>a")?.href;
      let salary = item.querySelector(
        "div.metadata.salary-snipped-container > div"
      )?.innerText;
      const companyName = item.querySelector("span.companyName")?.innerText;

      if (salary === null) {
        salary = "not defined";
      }

      data.list.push({
        title,
        salary,
        companyName,
        link,
      });
    });

    return data;
  }, data);

  let response = await jobData;
  let json = JSON.stringify(jobData, null, 2);
  fs.writeFile("job.json", json, "utf-8", () => {
    console.log("Written in job.json");
  });
  // Closes browser
  browser.close();

  return response;
}

module.exports = main;
