const express = require('express');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_EXPIRE
} = require('../config');
const router = express.Router();

const generateAccessToken = (user) => {
    const accessToken = jwt.sign({
        id : user._id}, ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_EXPIRE}
    );
  
}
const refreshToken = jwt.sign({
    id : user._id}, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_EXPIRE}
);
return {accessToken, refreshToken};
router.post('/register', async (req, res) => {
    try {
        const {email, password} = req.body;
        const exist = await User.findOne({email});
        if (exist) {
            return res.status(400).json({message: 'User already exists'});
        }
        const hashedPassword = await bycrypt.hash(password, 10);
        const newUser = new User({email, password: hashedPassword});
        await newUser.save();
        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
});
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const valid = await bycrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const { accessToken, refreshToken } = generateAccessToken(user);
        user.refreshToken = refreshToken;
        await user.save();
        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({message: 'Server error'});
    }
});
router.post('/refresh-token', async (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(401).json({message: 'Refresh Token required'});
    }
    try {
    const user = await User.findOne({refreshToken});
    if (!user) {
        return res.status(403).json({message: 'Invalid Refresh Token'});
    }
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({message: 'Invalid Refresh Token'});
        const { accessToken, refreshToken: newRefreshToken } = generateAccessToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();
        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    });
    } catch (error) {
        res.status(500).json({error: 'Server error'});

    }
});
module.exports = router;
        

