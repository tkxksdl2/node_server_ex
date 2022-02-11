const express = require("express");
const router = express.Router();
const User = require("../schemas/user");
const crypto = require("crypto");

//회원가입
router.post("/join", async (req, res) => {
    try{
        let obj = {email:req.body.email};

        let user = await User.findOne(obj);
        console.log(user);

        if (user) {
            res.json({
                message: "이메일이 중복되었습니다. 새로운 이메일을 입려갷주세요.",
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
                                console.log(key.toString("base64"));
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
    try{
        await User.findOne({ email: req.body.email}, async (err, user) => {
            if (err) {
                console.log(err);
            } else {
                console.log(user);
                if (user) {
                    console.log(req.body.password);
                    console.log(user.salt);
                    crypto.pbkdf2(
                        req.body.password,
                        user.salt,
                        10000,
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
                                    await User.updateOne(
                                        {
                                        email: req.body.email
                                        },
                                        { $set: {lginCnt:0 } }
                                    );
                                    req.session.email = user.email;
                                    req.json({
                                        message: "로그인 되었습니다!",
                                        _id: user2._id, // 이값은 쿠키로 들어감
                                        email: user2.email
                                    });
                                } else {
                                    if (user.loginCnt > 4) {
                                        res.json({
                                            message: "아이디나 패스워드가 5회 이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다."
                                        });
                                    } else {
                                        await User.updateOne(
                                            {
                                            email: req.body.email
                                            },
                                            { $set: { loginCnt: user.loginCnt +1 }}
                                        );
                                        if (user.loginCnt >=5) {
                                            await User.updateOne(
                                                { email: req.body.email},
                                                { $set: { lockYn:true } }
                                            );
                                            res.json({
                                                message: "아이디나 패스워드가 5회이상 일치하지 않아 잠겼습니다.\n고객센터에 문의 바랍니다."
                                            });
                                        } else{
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
                    res.json({ message: "아이디가 일치하지 않습니다."});
                }
            }
        });

    }catch (err) {
        console.log(err);
        res.json({ messge: "로그인 실패"});
    }
});

module.exports = router;