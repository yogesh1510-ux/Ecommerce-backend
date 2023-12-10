const { model } = require("mongoose");

class ApiFeatures{

    constructor(query,querystr){
        this.query=query;
        this.querystr=querystr;
    }

    search(){
        const keyword= this.querystr.keyword ? {
            name:{
                $regex:this.querystr.keyword,
                $options:"i"
            },
        } : {}; 

      this.query=  this.query.find({...keyword});
        return this;

    }

    filter(){
       // console.log(this.querystr["keyword"]);
        const querystrCopy = {...this.querystr};

        const removeFields= ["keyword","page","limit"];

       

        removeFields.forEach((key) => delete querystrCopy[key]);

        //same functions;;iti using filter
        // const filteredQuerystrCopy = Object.fromEntries(
        //     Object.entries(querystrCopy).filter(([key]) => !removeFields.includes(key))
        //   );


        //filter for price and ratings
       // console.log(querystrCopy);
        let tempquerystr=JSON.stringify(querystrCopy);

       
        
         tempquerystr=tempquerystr.replace(/\b(gt|gte|lt|lte)\b/g , (match) => `$${match}`);

        // console.log(tempquerystr);
         this.query=this.query.find(JSON.parse(tempquerystr));
          
         

        return this;

        
    }

    pagination(resultPerPage) {
        const currentpage= Number(this.querystr.page) || 1;
        const skip=resultPerPage * (currentpage -1 );
        this.query=this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}


module.exports=ApiFeatures;