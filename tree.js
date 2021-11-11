const uuid = require('uuid');
const { MongoClient } = require('mongodb');

const username = encodeURIComponent("admin");
const password = encodeURIComponent("123456");
const clusterUrl = "localhost:27017";
const authMechanism = "DEFAULT";
// Replace the following with your MongoDB deployment's connection string.

const uri = `mongodb://${username}:${password}@${clusterUrl}/?authMechanism=${authMechanism}`;
// Create a new MongoClient
// Database Name
/**
 * 生成树状结构的数据
 * levelOne 代表一级节点的数量
 * childSize  子节点的最少和最多的个数
 * depth 代表该一级节点往下的最小和最大深度，如果只有一级节点，那么深度就是1
 */
function genernateTree(levelOne=100,childSize=[0,10],depthArr=[1,5]) {
    let id0 = uuid.v4();
    let res = [];
    for(let i = 0 ;i< levelOne; i++)  {
        let id1 = uuid.v4(); // 一级节点
        let b1 = { id:id1, parent:null, content:'levelOne'+i, createAt: new Date() };
        res.push(b1);
        let depth = Math.floor(Math.random() *(depthArr[1] - depthArr[0])) + depthArr[0];
        for(let j = 1; j < depth; j++) {
           // 每一级有多少个字节点 
            let size = Math.floor(Math.random() *(childSize[1] - childSize[0])) + childSize[0];
            for(let k = 0; k< size; k++) {
                // 生成一个子节点

            }
        }
    }
}

function getRandomText() {
    eval("var word=" + '"\\u' + (Math.round(Math.random() * 20901) + 19968).toString(16) + '"');
    return word ;
}

function getRandomEmoji() {
    //eval("var emoji=" + '"\\u' + (Math.round(Math.random() * 2000) + 127744).toString(16) + '"');
    //return emoji;
    let str='😄😫😭🤦‍♂️🈚️😄☔️🌈🌧️🐟';
    let arr= Array.from(str);
    return arr[(Math.floor(Math.random() * arr.length))];
}

function getStr(min=10,max=100) {
   let len1 = Math.floor(Math.random() * (max - min))  + min;
   let len2 = Math.floor(Math.random() * (max - min))  + min;
   let res = '';
   for(let i= 0;i <len1; i++) {
       res = res + getRandomText();
   }
   for(let i=0;i <len2; i++) {
       res = res + getRandomEmoji();
   }
   return res;
}

function createChildren(parent,childSize,depth=5,max=5) {
    let parentId = parent ? parent.id:null;
    let repoId = parent ? parent.repoId:null;
    let userId = parent ? parent.userId:null;
    if(depth < 1) {
        return [];
    }
    let res1 = [];
    for(let i=0;i<childSize;i++) {
        let child = {
            id:uuid.v4(),
            content:[['child-'+(max-depth)+'-'+i],[getStr()]],
            contentInnerText:getStr(),
            type:'text',
            repoId:repoId,
            userId:userId,
            parentId:parentId,
            prevId:uuid.v4(),
            createAt:new Date().toISOString(),
            updateAt:new Date().toISOString(),
            attributes: {page_cover: "/images/page-cover/gradients_"+i+"_"+i+".jpg", page_cover_position: i*i},
            resources:[{userId:userId,aIndex:i*i},{uIndex:i}]
        };
        res1 = res1.concat([child],createChildren(child,childSize,depth-1,max));
    }
    return res1;
}

async function mockData(userNum = 10*10000, articleNumArr=[10,80]) {
    for (let i = 0; i < userNum; i++) {
        let articleNum = Math.floor(Math.random() * (articleNumArr[1] - articleNumArr[0])) + articleNumArr[0];
        console.log(articleNum,'articleNum');
        let userId = uuid.v4();
        let repoId = uuid.v4();
        for (let j = 0; j < articleNum; j++) {
            let blocks = [];
            let articleBlock = {
                id: uuid.v4(),
                content: [['aritlce_title' + i + '-' + j]],
                contentInnerText: '标题' + i + '_' + j,
                type: 'page',
                repoId: repoId,
                userId: userId,
                parentId: null,
                prevId: uuid.v4(),
                createAt: (new Date()).toISOString(),
                updateAt: (new Date()).toISOString(),
                attributes: { page_cover: "/images/page-cover/gradients_" + i + "_" + j + ".jpg", page_cover_position: i * j },
                resources: [{ userId: userId, aIndex: j }, { uIndex: i }]
            };
            blocks = createChildren(articleBlock, 5, 3, 3);
            blocks.unshift(articleBlock);
            saveToMongo(blocks);
        }
    }

}
//let res = createChildren(null,2,3,3);
//console.log(res);
//mockData(1,[1,1]);

//const dbName = 'myProject';

async function saveToMongo(data,collection='blocks',dbName='myProject') {
  // Use connect method to connect to the server
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const collect= db.collection(collection);
  await collect.insertMany(data)
  // the following code examples can be pasted here...
  return 'done.';
}
mockData(5);
console.log('ffff');

async function getArticleById(articleId='78f7f979-06b9-48bd-8a99-60208a482b12',collection='blocks',dbName='myProject') {
   await client.connect();
    const db = client.db(dbName);
    let res = await db.collection(collection).aggregate([
        {
            $graphLookup: {
                from: "blocks",
                startWith: "$id",
                connectFromField: "id",
                connectToField: "parentId",
                as: "children",
            }
        },
        { $match: { parentId: articleId } }
    ]);
    res.forEach(console.dir);
}

//getArticleById().then().catch(e=>{console.log(e)});

