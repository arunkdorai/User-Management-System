
const isLogin = async(req,res,next)=>{

    try {
        
        if(req.session.userId){

        } else{
            res.redirect('/');
        }
        next();

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{

    try {
        
        if(req.session.userId){
            res.redirect('/home')
        }
        next();

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}