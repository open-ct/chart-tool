
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function getindicatorData(indicatorname){
  let res = [];
  indicatorname.forEach(value => {
      res.push({name: value,max:100});
  });
  return res;
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
export function SetDuplicateRemoval(arr){
    let set=new Set(arr);    
    let res = [];
    res=Array.from(set);
    return res;
  }
//数据格式[1，2，3，4，5，6，7，8，9]
export function findall(nametext1,value){
    let results=[],len=nametext1.length,pos=0;
    while(pos<len){
        pos=nametext1.indexOf(value,pos);
        if(pos===-1)break;
        results.push(pos);
        pos=pos+1; 
    }
    return results;
  }
  //data是数据，value是每个维度下的对应数据的索引值
  //在data中寻找data中对应value索引的数值
  export function findvalue(data,value){
    let results=[];
    for (var i=0;i<value.length;i++){
        let value_index=value[i];
        results.push(data[value_index]);
    }
    return results;
  }
export function wrapError(error) {
    return (
        <div style={{fontSize: "x-large", color: "red"}}>
            <div>错误：{error}</div>
        </div>
    )
}
