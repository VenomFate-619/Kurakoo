const Comment = require("../models/comments.model");
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user.model")
const Answer = require("../models/answers.model")
const ObjectID = require('mongodb').ObjectID;


const postComment = async(req, res) => {
    try 
    {
        const {answerId, text} = req.body
        const user = await User.findById(req.user._id)
        if(!answerId || !text || !ObjectID.isValid(answerId)){
            return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "please enter all the fields correctly!",
                )
            );
        }
        const ans = await Answer.findById(answerId)
        if(ans)
        {
            const comment = new Comment({
                answerId,
                text,
                createdBy: req.user._id,
                updatedAt: new Date().toISOString()
            })
            await comment.save()
            return res
                .status(200)
                .json(
                    responseHandler(
                        true,
                        200,
                        "comment saved!",
                        {answerId, text, updatedAt:new Date().toISOString(), created_by: user.firstName + user.lastName}
                    )
                );
        }
        else{
            return res
                .status(200)
                .json(
                    responseHandler(
                        true,
                        200,
                        "invalid answerID!"
                    )
                );
        }
    } 
    catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong!"));
    }
};

const updateComment = async (req, res) => {
    try 
    {
        if(!ObjectID.isValid(req.params.id)){
            return res
            .status(400)
            .json(responseHandler(false, 400, "invalid comment id"));
        }

        const comment = await Comment.findOne({_id: req.params.id})
        if(!comment){
            return res
            .status(400)
            .json(responseHandler(false, 400, "comment does not exist!"));
        }
        if(comment.createdBy!=req.user._id){
            return res
            .status(400)
            .json(responseHandler(false, 400, "you have not written this comment originally, so no edit rights!"));
        }

        const edit = Object.keys(req.body)
        if(edit!='text'){
            res.status(400).send({error: 'Invalid edit!'})
        }
        comment[edit] = req.body[edit]  
        await comment.save()
        return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "comment updated!",
                    {'updatedComment': comment.text}
                )
            );
    } catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong"));
    }
};

const deleteComment = async (req, res) => {
    try 
    {
        if(!ObjectID.isValid(req.params.id)){
            return res
            .status(400)
            .json(responseHandler(false, 400, "invalid comment id"));
        }
        const comment = await Comment.findByIdAndDelete({_id: req.params.id})
        if(!comment){
            return res
            .status(400)
            .json(responseHandler(false, 400, "comment does not exist!"));
        }
        if(comment.createdBy!=req.user._id){
            return res
            .status(400)
            .json(responseHandler(false, 400, "you have not written this comment originally, so you cannot delete this!"));
        }
        
        return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "comment deleted!",
                    {'deletedComment': comment.text}
                )
            );
    } catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong", null));
    }
};

const getCommentById = async(req, res) => {
    try 
    {
        if(!ObjectID.isValid(req.params.id)){
            return res
            .status(400)
            .json(responseHandler(false, 400, "invalid comment id"));
        }

        const comment = await Comment.findOne({_id: req.params.id})
        if(!comment){
            return res
            .status(400)
            .json(responseHandler(false, 400, "comment does not exist!"));
        }
        return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "comment found!",
                    {comment}
                )
            );
    }
    catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong!"));
    }
};

const getMyComments = async(req, res) => {
    try 
    {

        const comments = await Comment.find({createdBy: req.user._id})
        if(!comments || comments.length===0){
            return res
            .status(400)
            .json(responseHandler(false, 400, "you have not commented on any answer!"));
        }
        return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "comments found!",
                    {comments}
                )
            );
    }
    catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong!"));
    }
};

const getCommentsForAnswer = async(req, res) => {
    try 
    {
        if(!ObjectID.isValid(req.params.id)){
            return res
            .status(400)
            .json(responseHandler(false, 400, "invalid answer id"));
        }
        const ans = await Answer.findById(req.params.id)
        if(!ans){
            return res
            .status(400)
            .json(responseHandler(false, 400, "invalid answer id, no such answer exists in the database!"));
        }
        const comments = await Comment.find({answerId: req.params.id})
        if(!comments || comments.length===0){
            return res
            .status(400)
            .json(responseHandler(false, 400, "no comments for this particular answer yet!"));
        }
        return res
            .status(200)
            .json(
                responseHandler(
                    true,
                    200,
                    "comments found!",
                    {comments}
                )
            );
    }
    catch (e) {
        console.log(e);
        return res
            .status(400)
            .json(responseHandler(false, 400, "something went wrong!"));
    }
};

module.exports = commentController = {
    postComment,
    updateComment,
    deleteComment,
    getCommentById,
    getMyComments,
    getCommentsForAnswer
};

