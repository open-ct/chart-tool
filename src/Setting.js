
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
export function random2dArrayBetween(min,max,count) {   
    let res = [];
    for (let i = 0; i < count; i ++) {
        res.push(randomsBetween(min,max,10));
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
