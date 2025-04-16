const { Builder, By, until } = require("selenium-webdriver");
const path = require("path");

const USERNAME = "";
const PASSWORD = "";
const USER_DATA_DIR = path.join(__dirname, "userdata");

function normalizeInstagramUrl(url) {
  const match = url.match(
    /https?:\/\/www\.instagram\.com\/(?:[\w.]+\/)?p\/([^/]+)\//
  );
  return match ? `https://www.instagram.com/p/${match[1]}/` : null;
}

const BuildDriver = async () => {
  const chrome = require("selenium-webdriver/chrome");
  const options = new chrome.Options();
  options.addArguments(`--user-data-dir=${USER_DATA_DIR}`);
  //.addArguments("--headless");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  return driver;
};

const LogIn = async (driver) => {
  await driver.get("https://www.instagram.com");
  await driver.wait(until.elementLocated(By.tagName("body")), 10000);

  let isLoggedIn = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await driver.findElement(By.xpath("//span[text()='Explore']"));
    isLoggedIn = true;
  } catch (err) {
    isLoggedIn = false;
  }

  if (!isLoggedIn) {
    const username = USERNAME;
    const password = PASSWORD;

    await driver.findElement(By.name("username")).sendKeys(username);
    await driver.findElement(By.name("password")).sendKeys(password);
    await driver.findElement(By.xpath('//button[@type="submit"]')).click();
    await driver.wait(
      until.elementLocated(By.xpath("//span[text()='Explore']")),
      10000
    );
  }
};

const FetchUserPosts = async (driver, username) => {
  await driver.get(`https://www.instagram.com/${username}/`);
  await driver.wait(until.elementLocated(By.tagName("header")), 10000);
  // let bio;
  // try {
  //   const bioElement = await driver.findElement(
  //     By.xpath("//span[contains(@class, '_aade') and contains(@class, '_aaco')]")
  //   );
  //   bio = await bioElement.getText();
  // } catch (error) {
  //   bio = "";
  //   console.error("Bio error: ", error);
  // }

  const totalPostsElement = await driver.findElement(
    By.css(
      "li.xl565be.x1m39q7l.x1uw6ca5.x2pgyrj span.html-span.xdj266r.x11i5rnm"
    )
  );
  const totalPosts = await totalPostsElement.getText();

  console.log("Total Posts: ", totalPosts);

  let posts = new Set();

  if (totalPosts != "0") {
    let initial_height = await driver.executeScript(
      "return document.body.scrollHeight;"
    );
    let current_height = 0;
    while (true) {
      driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const newPosts = await driver.findElements(By.css('a[href*="/p/"]'));
      await newPosts.forEach(async (post) => {
        const href = await post.getAttribute("href");
        console.log(href);
        posts.add(href);
      });

      current_height = await driver.executeScript(
        "return document.body.scrollHeight;"
      );
      if (current_height == initial_height) {
        break;
      }
      initial_height = current_height;
    }
  }

  let postsArr = Array.from(posts);

  console.log(postsArr);
  return { bio: "", postsArr };
};

const FetchPost = async (driver, post_url) => {
  try {
    await driver.get(normalizeInstagramUrl(post_url));
    const isVideo = await driver.executeScript(
      'return document.querySelector("video.x1lliihq.x5yr21d.xh8yej3") ? true : false'
    );
    if (isVideo) {
      return { postImgUrl: "", captionText: "", comments: {}, postOwner: "" };
    }
    const imgElement = await driver.wait(
      until.elementLocated(
        By.css("img.x5yr21d.xu96u03.x10l6tqk.x13vifvy.x87ps6o.xh8yej3")
      ),
      10000
    );
    const postImgUrl = await imgElement.getAttribute("src");

    let captionText = "";

    try {
      const captionElementOne = await driver.wait(
        until.elementLocated(
          By.css(
            "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1 > span"
          )
        ),
        10000
      );

      captionText += await captionElementOne.getAttribute("innerText");
      cssSelector =
        "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1cy8zhl.x1oa3qoh.x1nhvcw1 > span";
    } catch (err) {}

    try {
      const captionElementTwo = await driver.wait(
        until.elementLocated(By.css("h1._ap3a._aaco._aacu._aacx._aad7._aade")),
        10000
      );

      captionText += await captionElementTwo.getAttribute("innerText");
      cssSelector = "._ap3a._aaco._aacu._aacx._aad7._aade";
    } catch (error) {}

    let comments = {};
    let postOwner = "";
    let cssSelector;
    let initCommentLength = 0;

    let initCommentStart = 0;

    postOwner = await driver.executeScript(
      `return document.getElementsByClassName("_ap3a _aaco _aacw _aacx _aad7 _aade")[0].innerText`
    );

    try {
      let initCommentLength1 = await driver.executeScript(
        'return document.querySelectorAll("div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1cy8zhl.x1oa3qoh.x1nhvcw1 > span").length;'
      );

      let initCommentLength2 = await driver.executeScript(
        'return document.querySelectorAll("._ap3a._aaco._aacu._aacx._aad7._aade").length;'
      );

      if (initCommentLength2 > 0) {
        initCommentLength = initCommentLength2;
        initCommentStart = 1;
        cssSelector = "._ap3a._aaco._aacu._aacx._aad7._aade";
      } else {
        initCommentLength = initCommentLength1;
        cssSelector =
          "div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1cy8zhl.x1oa3qoh.x1nhvcw1 > span";
      }
    } catch (err) {}

    if (initCommentLength > 0) {
      for (let i = initCommentStart; i < initCommentLength; i++) {
        const comment = await driver.executeScript(
          `return document.querySelectorAll("${cssSelector}")[${i}].innerText;`
        );

        const commentUser = await driver.executeScript(
          `return document.querySelectorAll("${cssSelector}")[${i}].parentElement.parentElement.querySelector("a").href`
        );

        if (!comments[commentUser]) {
          comments[commentUser] = [];
          comments[commentUser].push(comment);
        } else {
          comments[commentUser].push(comment);
        }
      }
    }

    console.log(postOwner);

    captionText =
      captionText === "Start the conversation."
        ? "No Caption Available"
        : captionText;

    return { postImgUrl, captionText, comments, userProfile: postOwner };
  } catch (err) {
    console.error(err);
  }
};

const SearchPost = async (driver, keyword) => {
  url_to_visit = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(
    keyword
  )}`;
  let posts = new Set();
  try {
    let noSearchElement;
    await driver.get(url_to_visit);
    try {
      noSearchElement = await driver.findElement(
        By.css(
          "span.x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x1ji0vk5.x18bv5gf.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.x1ms8i2q.xo1l8bm.x5n08af.x2b8uid.x4zkp8e.xw06pyt.x10wh9bi.x1wdrske.x8viiok.x18hxmgj"
        )
      );
    } catch (err) {
      console.log("Search Posts Found!");
    }
    if (noSearchElement == undefined) {
      // there are posts from search result
      let initial_height = await driver.executeScript(
        "return document.body.scrollHeight;"
      );
      let current_height = 0;
      let counter = 0;
      while (counter < 12 /* 4 scrolls */) {
        driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const newPosts = await driver.findElements(By.css('a[href*="/p/"]'));
        newPosts.forEach(async (post) => {
          try {
            const href = await post.getAttribute("href");
            posts.add(href);
          } catch (err) {
            console.log("Fetching... something got staled... nvm");
          }
        });

        current_height = await driver.executeScript(
          "return document.body.scrollHeight;"
        );
        if (current_height == initial_height) {
          break;
        }
        initial_height = current_height;
        counter += 3;
      }
    }
  } catch (err) {
    console.error(err);
  }

  let postsArr = Array.from(posts);
  return postsArr;
};

/*
(async function anon() {
  const driver = await BuildDriver();
  await LogIn(driver);
  // const userTimeline = await FetchUserPosts(driver, "rockstargames");
  // let url = "https://www.instagram.com/p/DCHpHdhyGLI";
  let url = "https://www.instagram.com/p/DFgAhx7gVIu";
  // let url = "https://www.instagram.com/p/DGDOy6yyqsg";
  const postDetails = await FetchPost(driver, url);
  // const searchPosts = await SearchPost(driver, "vitbhopal");
  console.log(postDetails);
})();
*/

module.exports = {
  FetchPost,
  FetchUserPosts,
  SearchPost,
  BuildDriver,
  LogIn,
};
