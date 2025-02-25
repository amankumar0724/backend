const asyncHandler = (requestHandler) => {
    return (req,res,next) => { 
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
};  

export {asyncHandler};

// OTHER WAY OF WRITING asyncHandler using higher order functions


// const asyncHandler = () => {}
// const asyncHandler = (func) => {() => {}}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (fnc) => async(req,res,next) => {
//     try {
//         await fnc(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
