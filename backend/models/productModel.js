const moongose = require("mongoose");


const productSchema = new moongose.Schema({
    name:{
        type:String,
        required:[true,"pleae enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"pleae enter product description"]
    },
    price:{
        type:Number,
        required:[true,"pleae enter product price"],
        maxLength:[8,"price cannot exceed 8 characters"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"pleae enter product category"]
    },
    stocks:{
        type: Number,
        required:[true,"pleae enter product stocks"],
        maxLength:[4,"stock cannot exceeds 4 charecters"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:moongose.Schema.ObjectId,
                ref:"User",
                required:true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:moongose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    createdAt :{
        type:Date,
        default:Date.now
    }

})


module.exports= new moongose.model("Product",productSchema);