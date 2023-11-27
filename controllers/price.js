import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import PriceGroup from '../models/price_group.js';
import PricePoints from '../models/price_points.js';
import PriceGroupDatas from '../models/price_group_datas.js';

dotenv.config();

export const createPriceGroup = (req, res, next) => {
  console.log(req.body);
	PriceGroup.findOne({ where : {
		price_group: req.body.group,
	}})
	.then(price_group => {
		if (price_group) {
			return res.status(409).json({error: "This group already exists"});
		} else if (req.body.group) {
			return PriceGroup.create(({
				price_group: req.body.group,
			}))
			.then(() => {
				res.status(200).json({message: "Added Successfully"});
			})
			.catch(err => {
				console.log(err);
				res.status(502).json({error: "An error occurred"});
			});
		}
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const addPricePoint = (req, res, next) => {
	PricePoints.findOne({ where : {
		duration: req.body.duration,
		duration_type: req.body.durationType,
	}})
	.then(price_group => {
		if (price_group) {
			return res.status(409).json({error: "This point already exists"});
		} else {
			return PricePoints.create(({
				duration: req.body.duration,
				duration_type: req.body.durationType,
			}))
			.then((point) => {
				console.log('point');
				console.log(point);
				return res.status(200).json({message: "Added Successfully"});
			})
			.catch(err => {
				console.log(err);
				return res.status(502).json({error: "An error occurred"});
			});
		}
	})
	.catch(err => {
		console.log('error', err);
	});
};

export const getHeaderData = (req, res, next) => {
	PricePoints.findAll()
	.then((points) => {
    let pointsJSON = [];
    for (let i = 0; i < points.length; i++) {
      pointsJSON.push({ id: points[i].id, header: points[i].dataValues.duration + " " + points[i].dataValues.duration_type });
    }		
    res.status(200).json(pointsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const getTableData = (req, res, next) => {
	sequelize.query(
	  `
	  SELECT
  		t1.id AS group_id,
  		t1.price_group,
  		t1.is_free,
  		t1.extra_day,
  		t3.id AS point_id,
  		t2.value
	  FROM
  		price_groups AS t1
    		LEFT JOIN price_group_datas AS t2 ON t1.id = t2.group_id
    		LEFT JOIN price_points AS t3 ON t2.point_id = t3.id
  	  ORDER BY group_id, point_id
	  `,
	  { type: sequelize.QueryTypes.SELECT }
	)
	.then(datas => {
		if(datas.length > 0){
			PricePoints.findAll()
			.then((pionts) => {
				const pointsArr = [];
				for (let i = 0; i < pionts.length; i++) {
				  pointsArr.push(pionts[i].dataValues);
				}
				
				var doubleArraiedDatas = {};
				var resData = {};

				datas.map((data, index)=>{
					doubleArraiedDatas[data.price_group] = {};
				});
				datas.map((data, index)=>{
					if(data.point_id) doubleArraiedDatas[data.price_group][data.point_id] = data;
					resData[data.price_group] = {
						group_id: data.group_id,
						is_free: data.is_free,
						extra_day: data.extra_day,
						data: []
					};
				});

				for(var price_group in doubleArraiedDatas){
					var dataFirst = doubleArraiedDatas[price_group];
					pointsArr.map((point, index) => {
						var dataSecond = dataFirst[point.id];
						if(dataSecond) {
							resData[price_group].data.push(dataSecond.value);
						}else{
							resData[price_group].data.push("");
						}
					})
				}
				res.status(200).json(resData);
			})
			.catch(err => {
				res.status(502).json({error: "An error occurred"});
			});
		}else{
			res.status(200).json({});
		}
	})
	.catch(error => {
		res.status(502).json({error: "An error occurred"});
	});
};

export const setFree = (req, res, next) => {
	PriceGroup.update(
	  { is_free: req.body.isFree },
	  { where: { price_group: req.body.group } }
	).then((result) => {
		res.status(200).json({ message: "SetFree Successfully" });
	}).catch((error) => {
		res.status(500).json({ error: "Internal server error" });
	});
};

export const setPriceData = (req, res, next) => {
  const { groupId, pointId, value } = req.body;

  PriceGroupDatas.findOrCreate({
	where: { 
	  group_id: groupId,
	  point_id: pointId
	},
	defaults: {
	  group_id: groupId,
	  point_id: pointId,
	  value: value
	}
  }).then(([result, created]) => {
	if (!created) {
	  PriceGroupDatas.update(
		{ value: value },
		{ 
		  where: { 
			group_id: groupId,
			point_id: pointId
		  } 
		}
	  ).then(() => {
		res.status(200).json({ message: "Updated price Successfully" });
	  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
	  });
	} else {
	  res.status(200).json({ message: "SetPrice Successfully" });
	}
  }).catch((error) => {
	console.log(error);
	res.status(500).json({ error: "Internal server error" });
  });
};

export const setExtraDay = (req, res, next) => {
  PriceGroup.update(
    { extra_day: req.body.extraDay },
    { where: { price_group: req.body.group } }
  ).then((result) => {
    res.status(200).json({ message: "SetFree Successfully" });
  }).catch((error) => {
    res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteGroup = (req, res, next) => {
  PriceGroup.destroy({ where: { price_group: req.body.group } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Group deleted successfully" });
      } else {
        res.status(404).json({ error: "Group not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const deletePricePoint = (req, res, next) => {
  PricePoints.destroy({ where: { id: req.body.pointId } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "PricePoint deleted successfully" });
      } else {
        res.status(404).json({ error: "PricePoint not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};