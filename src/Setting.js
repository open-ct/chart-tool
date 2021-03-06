
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomsBetween(min, max, count) {
    let res = [];
    for (let i = 0; i < count; i ++) {
        res.push(randomBetween(min, max));
    }
    return res;
}
export function pieDataProcess(legendData, data) {
    let res = [];
    for (var i = 0; i < legendData.length; i++) {
      var item = { value: data[i], name: legendData[i] };
      res.push(item);
    }
    return res;
}
  export function randomsfloorBetween(count) {
    let res = [];
    for (let i = 0; i < count; i++) {
      res.push(Math.random());
    }
    return res;
  }
export function transpose2dArray(array) {
    if (array.length === 0) {
        return array;
    }
    return array[0].map((r, i) => array.map(c => c[i]));
}

export function wrapError(error) {
    return (
        <div style={{fontSize: "x-large", color: "red"}}>
            <div>错误：{error}</div>
        </div>
    )
}
