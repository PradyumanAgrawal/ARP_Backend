const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const middleware = require('./utils/middleware.js');
const studyResRouter = require('./controllers/studyResources.js');
const studyResources = require('./models/firebasedb.js').studyResources;
const check = require('./models/firebasedb.js').check;
const admin = require('./utils/config.js').admin;
//const firestore = require('../models/firebasedb.js').firestore;

// var corsOptions = {
//     origin: 'https://arpiitbbs.firebaseapp.com',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }



app.use(cors());
app.use(bodyParser.json());
app.use(middleware.requestLogger);

app.use('/studyResources/branches',studyResRouter);

//get all flagged resources
app.get('/admin/flagged', async (req,res,next)=>{
    try{
        let globalList = [];
        let branches = await studyResources.get();
        for (const branch of branches.docs) {
            let subjects = await studyResources.doc(branch.id).listCollections();
            for (const subject of subjects) {
                let resources = await subject.get();
                for (const resource of resources.docs) {
                    if (resource.data().flags > 0)
                        globalList.push(resource.data());
                }
            }
        }
        res.status(200).send(globalList);
    }catch(err){
        next(err);
    }
});

//get all unreviewed resources
app.get('/admin/unreviewed', async (req,res,next)=>{
    try{
        let globalList = [];
        let branches = await studyResources.get();
        for (const branch of branches.docs) {
            let subjects = await studyResources.doc(branch.id).listCollections();
            for (const subject of subjects) {
                let resources = await subject.get();
                for (const resource of resources.docs) {
                    if (resource.data().review === false)
                        globalList.push(resource.data());
                }
            }
        }
        res.status(200).send(globalList);
    }catch(err){
        next(err);
    }
});

//get all subject-subjectCode pairs for search implementation
app.get('/search', async (req,res,next)=>{
      let mainlist = [];
      try{
             let branches = await check.doc("list").get();
                  for(let j =0;j<branches.data().branches.length;j++)
                  {
                        let branchData={};
                        let list=[];
                        let temp=branches.data().branches[j];
                        for(let i=0;i<branches.data()[temp].length;++i)
                        {     let data=await branches.data()[temp][i];
                              let subCode = data.substring(0,7);
                              let subName = data.substring(7);
                              list.push({subjectName: subName, subjectCode: subCode});
                        }
                        branchData.branchName=temp;
                        branchData.data=list;
                        mainlist.push(branchData);
                  }
             res.status(200).send(mainlist).end();
         }catch(error){
             next(error)
         }
});

//admin review implementation




app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
module.exports = app;
