import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import dayjs from 'dayjs';
import User from '../models/user.js';
import UserForgotPassword from '../models/users_forgot_password.js';
import UserRefreshToken from '../models/user_refresh_token.js';
import { NextFunction ,Request, Response} from 'express';

type JwtVerifyPayload = {
  email: string;
  sub: string;
	userId:string;
	userName:string;
};

dotenv.config();

const generateRefreshToken =async(userId:number|string, email:string,  userName:string)=>{
	const expiresIn = dayjs().add(30, "day").unix()
	const refreshToken = jwt.sign({ email, userId, userName }, process.env.JWT_REFRESH_TOKEN_SECRET, {
		 subject: userId.toString(),
		 expiresIn: '30d'
	});

	await UserRefreshToken.create({
		user_id: userId,
		expires_in: expiresIn,
		refresh_token: refreshToken
	})

	return refreshToken
}


// const generateToken=(email:string,id:string,name:string)=>{	
// 	return jwt.sign({ email, userId:id, userName:name }, 'secret', { expiresIn: '1h' });
// }

export const signup = (req, res, next) => {
	User.findOne({ where : {
		email: req.body.email, 
	}})
	.then(dbUser => {
		if (dbUser) {
			return res.status(409).json({message: "email already exists"});
		} else if (req.body.email && req.body.password) {
			// password hash
			bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
				if (err) {
					return res.status(500).json({message: "couldnt hash the password"}); 
				} else if (passwordHash) {
					return User.create(({
						email: req.body.email,
						name: req.body.name,
						password: passwordHash,
					}))
					.then(() => {
						res.status(200).json({message: "user created"});
					})
					.catch(err => {
						console.log(err);
						res.status(502).json({message: "error while creating the user"});
					});
				};
			});
		} else if (!req.body.password) {
			return res.status(400).json({message: "password not provided"});
		} else if (!req.body.email) {
			return res.status(400).json({message: "email not provided"});
		};
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const login = (req, res, next) => {
	User.findOne({ where : {
		email: req.body.email, 
	}})
	.then(dbUser => {
		if (!dbUser) {
			return res.status(404).json({message: "user not found"});
		} else {
			bcrypt.compare(req.body.password, dbUser.password, async (err, compareRes) => {
				if (err) {
					res.status(502).json({message: "error while checking user password"});
				} else if (compareRes) {				
					await UserRefreshToken.destroy({
						where: {
							user_id: dbUser.id,
						}
					})

					const refreshToken = await generateRefreshToken(dbUser.id, req.body.email)
				
					// const token =generateToken(dbUser.email,dbUser.id,dbUser.name)

					res.status(200).json({
						message: "user logged in", 
						// token: token,
						refreshToken,
						email: dbUser.email,
						userId: dbUser.id,
						userName: dbUser.name
					});
				} else {
					res.status(403).json({message: "invalid credentials"});
				};
			});
		};
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const logout = (req, res, next) => {
	const token = req.headers.authorization;
	res.status(200).json({ message: 'success' });
};

export const resetPass = async (req, res, next) => {
	try {
	  const dbUser = await User.findOne({ where: { email: req.body.email } });
	  if (!dbUser) {
		return res.status(404).json({ message: "User not found" });
	  } else {
		const id = uuidv4();
  
		const verifyLink = `${process.env.BASE_URL}/changepass/${id}`;
		const clientDirection = `${req.body.clientHost}/changepass/${id}`;

		const currentDate = new Date();
		currentDate.setMinutes(currentDate.getMinutes() + 15);
		const formattedExpireDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

		UserForgotPassword.create({
			user_id: dbUser.id,
			recover_id: id,
			client_direction: clientDirection,
			expire_date: formattedExpireDate,
		}, {
			fields: ['user_id', 'recover_id', 'client_direction', 'expire_date']
		});

		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		const msg = {
		  to: dbUser.email,
		  from: process.env.SENDGRID_SENDER,
		  templateId: process.env.SENDGRID_TEMPLATE_ID,
		  dynamic_template_data: {
			subject: 'Reset Your Password',
			name: dbUser.name,
			link: verifyLink,
		  },
		};
		await sgMail.send(msg);
		return res.status(200).json({ message: "Reset password link is sent. Please check your email" });
	  }
	} catch (err) {
	  console.error('An error occurred:', err);
	  return res.status(500).send("An error occurred");
	}
};

export const verifyChangePass = (req, res, next) => {
	const recoveryId = req.params.id;
	const currentDate = new Date();
	UserForgotPassword.findOne({
		where: {
			recover_id: recoveryId
		}
	}).then((result) => {
		if (result) {
			const expireDate = new Date(result.expire_date);
			if (result.is_expired == 1 || expireDate < currentDate) {
				res.status(400).json({ error: "The link is expired" });
			} else {
				res.redirect(result.client_direction);
			}
		} else {
			res.status(404).json({ error: "Record not found" });
		}
	}).catch((error) => {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	});
};

export const newPass = (req, res, next) => {
	const currentDate = new Date();
	UserForgotPassword.findOne({
		where: {
			recover_id: req.body.recoveryId
		}
	}).then((result) => {
		if (result) {
			const expireDate = new Date(result.expire_date);
			if (result.is_expired == 1 || expireDate < currentDate) {
				res.status(400).json({ error: "The link is expired" });
			} else {
				bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
					if (passwordHash) {
						User.update(
						  { password: passwordHash },
						  { where: { id: result.user_id } }
						).then((result) => {
							UserForgotPassword.update(
								{ is_expired: 1 },
								{ where: { recover_id: req.body.recoveryId } }
							)
							res.status(200).json({ error: "Password updated successfully" });
						}).catch((error) => {
							res.status(500).json({ error: "Internal server error" });
						});
					};
				});
			}
		} else {
			res.status(404).json({ error: "Record not found" });
		}
	}).catch((error) => {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	});
};

export const isAuth = (req, res, next) => {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		return res.status(401).json({ message: 'not authenticated' });
	};
	const token = authHeader.split(' ')[1];
	let decodedToken; 
	try {
		decodedToken = jwt.verify(token, 'secret');
	} catch (err) {
		return res.status(500).json({ message: err.message || 'could not decode the token' });
	};
	if (!decodedToken) {
		res.status(401).json({ message: 'unauthorized' });
	} else {
		res.status(200).json({ message: 'here is your resource' });
	};
};

export const refreshToken = async (req:Request, res:Response, next:NextFunction)=>{
	const refreshToken = req.body.refresh_token

	const findRefreshToken = await UserRefreshToken.findOne({
		where: {
			refresh_token: refreshToken
		}
	})

	if(!findRefreshToken) { 
		return res.status(401).send({message: "Refresh token invalid."})
	}

	const { email, sub,userId,userName} = jwt.verify(
		refreshToken,
		process.env.JWT_REFRESH_TOKEN_SECRET
	) as JwtVerifyPayload;

	// const newToken = generateToken(email,userId,userName)

	const refreshTokenExpired = dayjs().isAfter(dayjs.unix(findRefreshToken?.expires_in))

	if(refreshTokenExpired){
		await UserRefreshToken.destroy({
			where: {
				user_id : sub
			}
		})
		const newRefreshToken = await generateRefreshToken(sub,email)
		return res.send({refreshToken:newRefreshToken})
	}

	return res.status(401).send({})
}