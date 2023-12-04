import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import PriceGroup from '../models/price_group.js';
import PricePoints from '../models/price_points.js';
import PriceGroupDatas from '../models/price_group_datas.js';
import PriceSeasons from '../models/price_seasons.js';
import PriceBrands from '../models/price_brands.js';
import PriceTables from '../models/price_tables.js';
import PriceLogic from '../models/price_logic.js';

dotenv.config();

export const createPriceGroup = (req, res, next) => {
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

export const updatePriceGroup = (req, res, next) => {
  PriceGroup.findOne({ where: { price_group: req.body.oldName } })
  .then(result => {
    if (result) {
      return PriceGroup.update(
        { price_group: req.body.newName },
        { where: { price_group: req.body.oldName } }
      )
      .then(() => {
        res.status(200).json({ message: "Updated Successfully" });
      })
      .catch(err => {
        console.log(err);
        res.status(502).json({ error: "An error occurred" });
      });
    } else {
      return res.status(404).json({ error: "This group is not found" });
    }
  })
  .catch(err => {
    console.log('error', err);
    res.status(500).json({ error: "Internal server error" });
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
	let tableId = req.params.tableId;
	if(tableId == 0) tableId = null;

	const query = `
	  SELECT
  		t1.id AS group_id,
  		t1.price_group,
  		t1.is_free,
  		t1.extra_day,
  		t3.id AS point_id,
  		t2.value
	  FROM
  		price_groups AS t1
    		LEFT JOIN price_group_datas AS t2 
    			ON t1.id = t2.group_id
    				AND ${tableId ? 'table_id = ' + tableId : 'table_id IS NULL'}
    		LEFT JOIN price_points AS t3 ON t2.point_id = t3.id
  	  ORDER BY group_id, point_id
	  `;
	  console.log(query);
	sequelize.query(
	  query,
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

export const priceValidation = (req, res, next) => {
  const { groupId, pointId, value } = req.body;
  let tableId = null;
  if(req.body.tableId) tableId = req.body.tableId;

  PriceGroupDatas.findOne({	where: { 
	  group_id: groupId,
	  table_id: tableId,
	  value: value
	}}).then((result) => {
		if (result) {
		  res.status(404).json({ message: "Conflict price" });
		} else {
		  res.status(200).json({ message: "No confliction" });
		}
  }).catch((error) => {
		console.log(error);
		res.status(500).json({ error: "Internal server error" });
  });
};

export const setPriceData = (req, res, next) => {
  const { groupId, pointId, value } = req.body;
  let tableId = null;
  if(req.body.tableId) tableId = req.body.tableId;

  PriceGroupDatas.findOne({	where: { 
	  group_id: groupId,
	  table_id: tableId,
	  value: value
	}}).then((result) => {
		if(value && result){
			return res.status(409).json({error: "Price already exists"});
		}
	  PriceGroupDatas.findOrCreate({
			where: { 
			  group_id: groupId,
			  table_id: tableId,
			  point_id: pointId
			},
			defaults: {
			  group_id: groupId,
			  table_id: tableId,
			  point_id: pointId,
			  value: value
			}}).then(([result, created]) => {
				if (!created) {
				  PriceGroupDatas.update(
					{ value: value },
					{ where: { 
							group_id: groupId,
							table_id: tableId,
							point_id: pointId
					}}).then(() => {
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

export const getSeasonsData = (req, res, next) => {
	PriceSeasons.findAll()
	.then((seasons) => {
    let seasonsJSON = [];
    for (let i = 0; i < seasons.length; i++) {
      seasonsJSON.push(seasons[i].dataValues);
    }		
    res.status(200).json(seasonsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const saveSeasonCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceSeasons.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceSeasons.update(
				{ [column]: value },
				{ where: { id: id, } }
		  ).then(() => {
				res.status(200).json({ message: "Updated price Successfully" });
		  }).catch((error) => {
				if(error.errors[0].validatorKey == 'not_unique'){
					const message = error.errors[0].message;
					const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
					res.status(409).json({ error: capitalizedMessage});
				}else	res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "SetSeason Successfully" });
		}
  }).catch((error) => {
		if(error.errors[0].validatorKey == 'not_unique'){
			const message = error.errors[0].message;
			const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
			res.status(409).json({ error: capitalizedMessage});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteSeason = (req, res, next) => {
  PriceSeasons.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Season deleted successfully" });
      } else {
        res.status(404).json({ error: "Season not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const getBrandsData = (req, res, next) => {
	PriceBrands.findAll()
	.then((brands) => {
    let brandsJSON = [];
    for (let i = 0; i < brands.length; i++) {
      brandsJSON.push(brands[i].dataValues);
    }		
    res.status(200).json(brandsJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const saveBrandCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceBrands.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		console.log(result);
		if (!created) {
		  PriceBrands.update(
				{ [column]: value },
				{ where: { id: id, } }
		  ).then(() => {
				res.status(200).json({ message: "Updated price Successfully" });
		  }).catch((error) => {
				if(error.errors[0].validatorKey == 'not_unique'){
					const message = error.errors[0].message;
					const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
					res.status(409).json({ error: capitalizedMessage});
				}else	res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors[0].validatorKey == 'not_unique'){
			const message = error.errors[0].message;
			const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
			res.status(409).json({ error: capitalizedMessage});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deleteBrand = (req, res, next) => {
  PriceBrands.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Brand deleted successfully" });
      } else {
        res.status(404).json({ error: "Brand not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const getPriceTablesData = (req, res, next) => {
	PriceTables.findAll()
	.then((brands) => {
    let priceTablesJSON = [];
    for (let i = 0; i < brands.length; i++) {
      priceTablesJSON.push(brands[i].dataValues);
    }		
    res.status(200).json(priceTablesJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const savePriceTableCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceTables.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceTables.update(
				{ [column]: value },
				{ where: { id: id, } }
		  ).then(() => {
				res.status(200).json({ message: "Updated price Successfully" });
		  }).catch((error) => {
				if(error.errors[0].validatorKey == 'not_unique'){
					const message = error.errors[0].message;
					const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
					res.status(409).json({ error: capitalizedMessage});
				}else	res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors[0].validatorKey == 'not_unique'){
			let originalString = error.errors[0].message;
			let formattedString = originalString.replace(/_/g, " ");
			formattedString = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
			res.status(409).json({ error: formattedString});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deletePriceTable = (req, res, next) => {
  PriceTables.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Brand deleted successfully" });
    } else {
      res.status(404).json({ error: "Brand not found" });
    }
  })
  .catch((error) => {
    res.status(500).json({ error: "Internal server error" });
  });
};

export const getPriceLogicData = (req, res, next) => {
	PriceLogic.findAll({
	  include: [
	    { model: PriceBrands, as: 'brand'},
	    { model: PriceSeasons, as: 'season'},
	    { model: PriceTables, as: 'priceTable'}
	  ]
	}).then((results) => {
		console.log(results);
    let priceLogicJSON = [];
    for (let i = 0; i < results.length; i++) {
      priceLogicJSON.push(results[i].dataValues);
    }		
    res.status(200).json(priceLogicJSON);
	})
	.catch(err => {
		console.log(err);
		res.status(502).json({error: "An error occurred"});
	});
};

export const createPriceLogic = (req, res, next) => {
	PriceLogic.findOne({ where : {
		brand_id: req.body.brandId,
		season_id: req.body.seasonId,
		table_id: req.body.tableId,
	}})
	.then(result => {
		if (result) {
			return res.status(409).json({error: "This logic already exists"});
		} {
			return PriceLogic.create(({
				brand_id: req.body.brandId,
				season_id: req.body.seasonId,
				table_id: req.body.tableId,
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

export const savePriceLogicCell = (req, res, next) => {
  const { id, column, value } = req.body;
  PriceLogic.findOrCreate({
	where: { id: id, },
	defaults: {
	  [column]: value,
	}}).then(([result, created]) => {
		if (!created) {
		  PriceLogic.update(
				{ [column]: value },
				{ where: { id: id, } }
		  ).then(() => {
				res.status(200).json({ message: "Updated price Successfully" });
		  }).catch((error) => {
				if(error.errors[0].validatorKey == 'not_unique'){
					const message = error.errors[0].message;
					const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
					res.status(409).json({ error: capitalizedMessage});
				}else	res.status(500).json({ error: "Internal server error" });
		  });
		} else {
		  res.status(200).json({ message: "SetBrand Successfully" });
		}
  }).catch((error) => {
		if(error.errors[0].validatorKey == 'not_unique'){
			let originalString = error.errors[0].message;
			let formattedString = originalString.replace(/_/g, " ");
			formattedString = formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
			res.status(409).json({ error: formattedString});
		}else	res.status(500).json({ error: "Internal server error" });
  });
};

export const deletePriceLogic = (req, res, next) => {
  PriceLogic.destroy({ where: { id: req.body.id } })
  .then((result) => {
    if (result === 1) {
      res.status(200).json({ message: "Brand deleted successfully" });
    } else {
      res.status(404).json({ error: "Brand not found" });
    }
  })
  .catch((error) => {
    res.status(500).json({ error: "Internal server error" });
  });
};

