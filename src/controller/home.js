import fs from "fs";
import path from "path";
import logger from "../logger.js";

const homePageRequestHandler = (req, res) => {
  const url = req.url;
  if (url === "/") {
    //if index.html was requested...
    const content = path.join(__dirname, "../", "global", "index.html");

    //reads the file referenced by 'content'
    //and then calls the anonymous function we pass in
    fs.readFile(content, function (err, contents) {
      //if the fileRead was successful...
      if (!err) {
        //send the contents of index.html
        //and then close the request
        res.end(contents);
      } else {
        logger.error(err);
      }
    });
  } else {
    //if the file was not found, set a 404 header...
    res.writeHead(404, { "Content-Type": "text/html" });
    //send a custom 'file not found' message
    res.end("<h1>Sorry, the page you are looking for cannot be found.</h1>");
  }
};

export { homePageRequestHandler };
