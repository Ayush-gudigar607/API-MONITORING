import mongoose from 'mongoose'
/**
 * MongoDB Schema for Clients and Oraganisation
 * Each client represents a bussiness and organisation using monitoring service
 */

const clientSchema=new mongoose.Schema({
    name:{
        type:string,
        required:true,
        trim:true,
        minlength:2,
        maxlength:100
    },
    //for client we can priovide the different links or url(this is for future use)
    slug:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    description:{
        type:String,
        trim:true,
        maxlength:500,
        default:""
    },
    website:{
        type:String,
        default:""
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", //reference to the user who created the client
        required:true
    } ,
    isActive:{
        type:Boolean,
        default:true
    },
   settings: {
            dataRetentionDays: {
                type: Number,
                default: 30,
                min: 7,
                max: 365,
            },
            alertsEnabled: {
                type: Boolean,
                default: true,
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
},{
    timestamps:true,
    collection:"clients"
});

clientSchema.index({isActive:1});
const Client=mongoose.model('Client',clientSchema);
export default Client