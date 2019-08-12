// Sorry for this shitty code 

const fs = require('fs');
const express = require('express');
const chrono = require('chrono-node');

let finished = false;
let logs = [];


async function parseFiles() {
  for (file of fs.readdirSync('logs')) {
    console.log(`PARSE ${file}`);
    const awanta = await new Promise((resolve, reject) => {
      const lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(`logs/${file}`)
      });
      lineReader.on('line', function(line) {
        fecha = chrono.parseDate(line.substring(0, 50));

        if (fecha) {
          logs.push({ file, message: line, date: fecha.toISOString() });
        } else {
          last = logs.pop();
          if (last) logs.push({ ...last, message: `${last.message}\n${line}` });
        }
      });
      lineReader.on('close', resolve);
    });
    console.log(`FILE PARSED ${file}`);
  }
  console.log('FINISH READING');
  finished = true;
}

parseFiles();


// Order
logs = logs.sort(function(a, b) {
  return new Date(b.date) - new Date(a.date);
});

//Replace with lowercase
String.prototype.replaces = function(str, replace, incaseSensitive) {
    if (!incaseSensitive) {
      return this.split(str).join(replace);
    }
    const strLower = this.toLowerCase();
    const findLower = String(str).toLowerCase();
    let strTemp = this.toString();
  
    let pos = strLower.length;
    while ((pos = strLower.lastIndexOf(findLower, pos)) != -1) {
      strTemp =
        strTemp.substr(0, pos) + replace + strTemp.substr(pos + findLower.length);
      pos--;
    }
    return strTemp;
  };

  
//Express 

const app = express();
const port = 1234;
app.set('view engine', 'ejs');

app.get('/(*)', function(req, res) {
  const query = req.query.query || '';
  const page = parseInt(req.query.page) || 0;

  let filteredLogs;

  if (query) {
    filteredLogs = logs.filter((log) =>
      log.message.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredLogs = logs;
  }

  const pages = Math.ceil(filteredLogs.length / 50);
  filteredLogs = filteredLogs.slice(page * 50, (page + 1) * 50);
  filteredLogs = filteredLogs.map((log) => ({
    ...log,
    message: log.message.replaces(query, `<b class='red'>${query}</b>`)
  }));

  let pagesArray = Array.from(Array(pages).keys());

  pagesArray = [
    ...new Set([...pagesArray.slice(0, 2), page, ...pagesArray.slice(-2)])
  ].sort(function(a, b) {
    return a - b;
  });

  res.render('index', {
    finished,
    logs: filteredLogs,
    query,
    page,
    pages,
    pagesArray
  });
});

app.listen(port, () => console.log(`Server on port ${port}! \nhttp://0.0.0.0:1234\n`));

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
