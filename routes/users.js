const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcrypt');

//Update user
router.put('/:id', async (req,res)=>{
	if(req.body.userId === req.params.id || req.body.isAdmin){
		if(req.body.password){
			try{
				const salt = await bcrypt.genSalt(10);
				req.body.password = await bcrypt.hash(req.body.password, salt);
			}catch(err){
				return res.status(500).json(err);
			}
		}
		try {
			const user = await User.findByIdAndUpdate(req.params.id,{
				$set: req.body,
			});
			res.status(200).json('Update Successful')
		} catch(err) {
			return res.status(500).json(err);
		}
	}else {
		return res.status(403).json('You can only update your account');
	}
});
//Delete
router.delete('/:id', async (req,res)=>{
	if(req.body.userId === req.params.id || req.body.isAdmin){
		try {
			const user = await User.findByIdAndDelete(req.params.id,);
			res.status(200).json('Successful Deleted')

		} catch(err) {
			return res.status(500).json(err);
		}
	}else {
		return res.status(403).json('You can only delete your account');
	}
});

//Get user
router.get('/:id', async (req,res)=>{
	try {
		const user = await User.findById(req.params.id);
		const {password,updatedAt, ...other} = user._doc;
		res.status(200).json(other);
	} catch(err) {
		return res.status(500).json(err)
	}
})

//Follow user
router.put('/:id/follow', async(req,res)=>{
	if(req.body.userId !== req.params.id){
		try {
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);

		if(!user.followers.includes(req.body.userId)){
			await user.updateOne({ $push:{followers:req.body.userId}});
			await currentUser.updateOne({ $push:{followings:req.params.id}});
			res.status(200).json('account followed');
		}else {
			res.status(403).json('You already follow this Gee')
		}
		} catch(err) {
			return res.status(500).json(err)
		}

	}else {
		res.status(403).json('You cant follow Urself')
	}
});
//Unfollow user
router.put('/:id/unfollow', async(req,res)=>{
	if(req.body.userId !== req.params.id){
		try {
			const user = await User.findById(req.params.id);
			const currentUser = await User.findById(req.body.userId);

		if(user.followers.includes(req.body.userId)){
			await user.updateOne({ $pull:{followers:req.body.userId}});
			await currentUser.updateOne({ $pull:{followings:req.params.id}});
			res.status(200).json('account unfollowed');
		}else {
			res.status(403).json("You don't follow this Gee")
		}
		} catch(err) {
			return res.status(500).json(err)
		}

	}else {
		res.status(403).json('You cant unfollow Urself')
	}
});


module.exports = router;