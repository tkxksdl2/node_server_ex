const express = require("express");
const router = express.Router();
const Board = require("../schemas/board");

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
                writer: req.body.writer,
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
        const obj = {
            writer: req.body._id,
            title: req.body.title,
            content: req.body.content
        };
        console.log(obs);
        const board = new Board(obj);
        await board.save();
        req.json({ message: "게시글이 업로드 되었습니다."});
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