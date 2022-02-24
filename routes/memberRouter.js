const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const crypto = require("crypto");

//회원가입
router.post("/join", async (req, res) => {
    try{
        let obj = {email:req.body.email};
        let user = await User.findOne(obj);

        if (user) {
            res.json({
                message: "이메일이 중복되었습니다. 새로운 이메일을 입력해주세요.",
                dupYn: "1"
            });
        } else {
            crypto.randomBytes(64, (err, buf) => {
                if (err) {
                    console.log(err);
                } else {
                    crypto.pbkdf2(// 비밀번호, salt, 반복횟수, 길이, 해시 알고리즘, 콜백
                        req.body.password,
                        buf.toString("base64"),
                        100000,
                        64,
                        "sha512",
                        async (err, key) => {
                            if (err) {
                                console.log(err);
                            } else {
                                buf.toString("base64");
                                obj = {
                                    email: req.body.email,
                                    name: req.body.name,
                                    password: key.toString("base64"),
                                    salt: buf.toString("base64")
                                };
                                user = new User(obj);
                                await user.save();
                                res.json({ message: "회원가입 되었습니다!", dupYn: "0"});
                            }
                        }
                    );
                }
            });
        }
    } catch(err) {
        console.log(err);
        res.json({ message: false });
    }
});

router.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            //아이디가 존재할 경우 이메일과 패스워드가 일치하는 회원이 있는지 확인
            console.log('user 확인')
            crypto.pbkdf2(
                req.body.password,
                user.salt,
                100000,
                64,
                "sha512",
                async (err, key) => {
                    if (err) {
                        console.log(err);
                    } else {
                        const obj = {
                            email: req.body.email,
                            password: key.toString("base64")
                        };
    
                        const user2 = await User.findOne(obj);
                        console.log(user2);
                        if (user2) {
                            // 있으면 로그인 처리
                            res.json({
                                message: "로그인 되었습니다!",
                                _id: user2._id,
                                email: user2.email
                            });
                            
                            await User.updateOne(
                            {
                                email: req.body.email
                            },
                            { $set: { loginCnt: 0 } }
                            );
                            req.session.email = user.email;
                        } else {
                            //없으면 로그인 실패횟수 추가
                            if (user.loginCnt > 4) {
                                res.json({
                                    message:
                                    "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다."
                                });
                            } else {
                                await User.updateOne(
                                    {
                                    email: req.body.email
                                    },
                                    { $set: { loginCnt: user.loginCnt + 1 } }
                                );
                                if (user.loginCnt >= 5) {
                                    await User.updateOne(
                                    {
                                        email: req.body.email
                                    },
                                    { $set: { lockYn: true } }
                                    );
                                    res.json({
                                    message:
                                        "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다."
                                    });
                                } else {
                                    res.json({
                                    message: "아이디나 패스워드가 일치하지 않습니다."
                                    });
                                }
                            }
                        }
                    }
                }
            );
        } else {
        res.json({ message: "아이디나 패스워드가 일치하지 않습니다." });
        }
    } catch (err) {
    console.log(err);
    res.json({ message: "로그인 실패" });
    }
});

router.get("/logout", (req, res) => {
    console.log("/logout" + req.sessionID);
    req.session.destroy(() => {
        res.json({message:true});
    });
});

router.post("/getEmail", async (req, res) => {
    try{
        const _id = req.body._id;
        let user = await User.findOne({_id:_id});
        res.json({email:user.email});
    }catch(err){
        console.log(err);
    }
});

router.post("/update", async (req, res) => {
    try{
        let user = await User.findOne({ email: req.body.email });
        crypto.pbkdf2(
            req.body.password,
            user.salt,
            100000,
            64,
            "sha512",
            async (err, key) => {
                if (err){
                    console.log(err);
                } else {
                    const obj = {
                        email: req.body.email,
                        password: key.toString("base64")
                    };
                    let user2 = await User.findOne(obj);
                    if (user2) {
                        crypto.randomBytes(64, (err, buf) => {
                            if (err){
                                console.log(err);
                            } else {
                                crypto.pbkdf2(
                                    req.body.newpass,
                                    buf.toString("base64"),
                                    100000,
                                    64,
                                    "sha512",
                                    async (err, key) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            await User.updateOne(
                                                obj,
                                                {$set:
                                                    {
                                                    name:req.body.name,
                                                    password:key.toString("base64"),
                                                    salt:buf.toString("base64")
                                                    }
                                                }
                                            );
                                            res.json({
                                                message: "수정이 완료되었습니다.\n다시 로그인해주세요.",
                                                check: true
                                            });
                                        }
                                    }
                                );
                            }
                        });
                    } else{
                        res.json({
                            check: false,
                            message: "비밀번호가 일치하지 않습니다."
                        });
                    }
                }
            }
        );
    } catch (err){
        console.log(err);    
    }
});

router.post("/delete", async (req, res) => {
    try{
        await User.remove(
            {_id: req.body._id}
        );
        res.json({
            message:"회원 탈퇴되었습니다."
        })
    } catch (err){
        console.log(err);
    }
});

module.exports = router;