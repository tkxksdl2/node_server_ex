const express = require("express");
const router = express.Router();
const Board = require("../schemas/board");
const User = require("../schemas/user");


router.post("/delete", async (req, res) =>{
    try {
        await Board.remove({
            _id: req.body._id
        });
        res.json({ message: true});
    } catch (err) {
        console.log(err);
        res.json({ message: flase});
    }
});

router.post("/update", async (req, res) => {
    try{
        await Board.updateOne(
            {_id: req.body._id},
            {$set:{
                title: req.body.title,
                content: req.body.content
            }});
        res.json({ message: "게시글이 수정 되었습니다."});
    } catch (err) {
        console.log(err);
        res.json({ message: false});
    }
});

router.post("/write", async (req, res) => {
    try{
        let user = await User.findOne({_id : req.body._id})
        const obj = {
            writer: req.body._id,
            title: req.body.title,
            name: user.name,
            content: req.body.content
        };
        console.log(obj);
        const board = new Board(obj);
        await board.save();
        res.json({ message: "게시글이 업로드 되었습니다."});
    } catch (err) {
        console.log(err);
        res.json({ message: false });
    }
});

router.post("/getBoardList", async (req, res) => {
    try {
        const _id = req.body._id;
        const board = await Board.find({ writer: _id }, null, {sort : {createdAt:-1}});
        res.json({ list: board });
    } catch (err) {
        console.log(err);
        res.json({ message: false });
    }
});

router.post("/detail", async (req, res) => {
    try{
        const _id = req.body._id;
        const board = await Board.find({_id});
        res.json({board});
    } catch(err){
        console.log(err);
        res.json({ message: false });
    }
});

module.exports = router;