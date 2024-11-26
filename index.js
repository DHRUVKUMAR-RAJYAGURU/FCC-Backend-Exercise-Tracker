const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
//Modified below till..
const mongoose=require('mongoose');
let bodyParser=require('body-parser');
let bodyParserMiddleware=bodyParser.urlencoded({extended:false});
const Exercises=require('/workspace/boilerplate-project-exercisetracker/db_init/Exercise_init.js');
const Users=require('/workspace/boilerplate-project-exercisetracker/db_init/User_init.js');
const res = require('express/lib/response');

app.use(bodyParserMiddleware);
//..till HERE.

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//Modified until..
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

function validData(mode,data,id){
  if(mode=='exercise'){
    //console.log('is obj frozen?:'+Object.isFrozen(data))
    //console.log('is obj sealed?:'+Object.isSealed());
    // let data2={};
    // for(k in data){
    //   data2[k]=data[k];
    // }
    //let data2=Object.create(data,{date:{writable:true}});
    //console.log('is obj2 seal?:'+Object.isSealed(data2));
   // console.log('old data:'+data2);
    data2=data.toObject();
    rcvdate2=data2['date'];
    rcvdate=new Date(rcvdate2).toDateString();
    rcvdate=new String(rcvdate);
    data2['date']=rcvdate;
    data2['_id']=id;
    let {__v,...data3}=data2;
    data2=data3;
    //data2=JSON.stringify(data2);

   // console.log('rcvdate:'+rcvdate);
    //console.log('#valid1:'+data2+',type:'+typeof(data2));
    //console.log('type date:'+typeof(data2['date']));
    //data=JSON.parse(data2);
   // console.log('data2 json:'+JSON.stringify(data2));
    data=data2;
  }
  else if(mode=='log'){
    let data2=new Object(data);//.toObject();
  //console.log('data2:'+JSON.stringify(data2));
    data2=data2[0];
    c=data2['count'];
    //console.log('c='+c);
    for(i=0;i<c;i++){
     // console.log('old '+i+':'+data2['log'][i]['date']);
      rcvdate=data2['log'][i]['date'];
      rcvdate=rcvdate.toDateString();
      data2['log'][i]['date']=rcvdate;
      //console.log('new '+i+':'+data2['log'][i]['date']);
    }
    data=data2;
  }
  return data;
}

app.post('/api/users',(req,res)=>{
  let givenbody=req.body;
  //console.log(givenbody);
  let givenuname=givenbody.username;
  givenuname=new String(givenuname);
 // console.log("uname:"+givenuname);
 // console.log("req.body:"+typeof(req.body));
  let userInstance=new Users({
    username:givenuname
  });
  //console.log("uinstance"+userInstance);
  userInstance.save().then((data)=>{
    //#complete-2
   // console.log('Success:Added:'+data);
    res.send(data);//#complete-3
  });
});

app.get('/api/users',(req,res)=>{
  //#complete-4
  Users.find().then((userlist)=>{
    res.json(userlist);//#complete-5&6
  });
});

app.post('/api/users/:_id/exercises',(req,res)=>{
  exerciseInstance={};
  /*console.log('------');
  console.log('url:'+req.originalUrl);
  console.log(JSON.stringify(req.body));*/
  givenid=new String(req.params['_id']);//.toString();
  //console.log("givenid:"+givenid);
  Users.findOne({_id:givenid}).then((data)=>{
    //uname=data[0].username;
   // console.log(data);
    uname=data.username;
    exerciseInstance.username=uname;
    exerciseInstance.description=req.body.description;
    exerciseInstance.duration=req.body.duration;
    //exerciseInstance.date=new Date(req.body.date;
    
    givendate=req.body.date;
  //  console.log('givendate:'+givendate+',type:'+typeof(givendate));
    if(givendate==''||givendate==undefined)//||givendate==null||givendate==undefined)
    {
      givendate=new Date();
      exerciseInstance.date=givendate.toDateString();
      //console.log('#1');
    }
    else{
      givendate=new Date(new String(givendate));
      exerciseInstance.date=givendate.toDateString();
      //console.log('#2');
    }
    exerciseInstance2=new Exercises(exerciseInstance);
    exerciseInstance2.save().then((data)=>{
      //#complete-7
      //console.log("Success:Added:"+data);
      data=validData('exercise',data,givenid);
    //  console.log('validdata:',JSON.stringify(data));
      res.json(data);//#complete-8
    });
  });
});
//  api/users/:id/logs?(from)?(to)?(limit)?
app.get('/api/users/:id/logs',(req,res)=>{
  //console.log(req.params);
  givenid=req.params['id'].toString();
  fromdate=req.query.from;
  todate=req.query.to;
  givenlimit=req.query.limit;
 // console.log('logs#1:from:'+fromdate);
  if(fromdate==undefined) fromdate="0000-01-01";
  if(todate==undefined) todate="9999-12-31";
  if(givenlimit==undefined) {givenlimit=Number.MAX_SAFE_INTEGER;}
  else{givenlimit=new Number(givenlimit);}
  fromdate=new Date(fromdate);
  todate=new Date(todate);
  /*if(fromdate2.toISOString()!=fromdate) {fromdate=fromdate2;}
  else {return console.log('Error:From date not in ISO format.');}
  if(todate2.toISOString()!=todate) {todate=todate2;}
  else {return console.log('Error:To date not in ISO format.');}*/
  fromdate=new Date(fromdate);//.toDateString();
  todate=new Date(todate);//.toDateString();
  givenlimit=parseInt(givenlimit);
  /*console.log("logs#2");
  console.log('givenid:'+givenid);
  console.log('fromdate:'+fromdate+",todate:"+todate);
  console.log('limit:'+givenlimit+typeof(givenlimit));*/
  Users.findById(givenid).then((data)=>{
    //console.log('data:'+data);
    Users.aggregate([
      { 
        $lookup:{
          from: "exercises",
          pipeline:[
            {
              $project:{
                description:1,
                duration:1,
                date:1,
                '_id':0
              }
            },
            {
              $match:{
                $expr:{
                  $and:[{$gte:['$date',fromdate]},{$lte:['$date',todate]}]
                }
              }
              //,'$lte':todate
            },
            {
              $limit:givenlimit
            }
          ] ,
          localField: "username",
          foreignField: "username",
          as: "log"
        }
      }/*,
      {
        $project:{from:1,username:1,log:1,count:'$log.length'}
      }*/
      ,
      {
        $match:{username:data['username']} 
      }
      ,
      {
        $addFields:{count:{'$size':'$log'}}  
      }/*,
      {
        $group:{
          _id:'$username',
          count: {$sum:1}
        }
      }*/
      /*,
      {
        $match:{date:{$and:[$gte:fromdate,$lte:todate]}}
      },
      {
        $limit:5
      }*/
    ]).then((collections)=>{
      //console.log('collections:'+collections.toString());
      data=validData('log',collections);
      //console.log('logs:'+JSON.stringify(data));
      res.send(data);
    });
   //#complete-[9-15]&16
  });
});

//#complete-1

//.. until HERE.

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
