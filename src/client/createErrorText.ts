export default (ex: any, file: string) => {
  let result = ''

  result += "Parse error at " + ex.line + "," + ex.col + '\n';
  var col = ex.col;
  var lines = file.split(/\r?\n/);
  var line = lines[ex.line - 1];
  if (!line && !col) {
    line = lines[ex.line - 2];
    col = line.length;
  }
  if (line) {
    var limit = 70;
    if (col > limit) {
      line = line.slice(col - limit);
      col = limit;
    }
    result += (line.slice(0, 80)) + '\n';
    result += (line.slice(0, col).replace(/\S/g, " ") + "^") + '\n';
  }

  return result
}