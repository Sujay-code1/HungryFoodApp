const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('database connected sucessfully')
    }catch(error){
        console.log('db error')
    }
}

export default connectDb;