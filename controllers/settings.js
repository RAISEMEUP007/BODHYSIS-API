import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import sequelize from '../utils/database.js';

import SettingsManufactures from '../models/settings/settings_manufactures.js';
import SettingsTags from '../models/settings/settings_tags.js';
import SettingsLocations from '../models/settings/settings_locations.js';
import SettingsCountries from '../models/settings/settings_countries.js';
import SettingsLanguages from '../models/settings/settings_languages.js';

dotenv.config();

export const createManufacture = (req, res, next) => {
  SettingsManufactures.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Manufacture family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateManufacture = (req, res, next) => {
  const updateFields = req.body;

  SettingsManufactures.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Manufacture family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getManufacturesData = (req, res, next) => {
  SettingsManufactures.findAll()
  .then((manufactures) => {
    let manufacturesJSON = [];
    for (let i = 0; i < manufactures.length; i++) {
      manufacturesJSON.push(manufactures[i].dataValues);
    }   
    res.status(200).json(manufacturesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteManufacture = (req, res, next) => {
  SettingsManufactures.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Manufacture deleted successfully" });
      } else {
        res.status(404).json({ error: "Manufacture not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createTag = (req, res, next) => {
  SettingsTags.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Tag family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateTag = (req, res, next) => {
  const updateFields = req.body;

  SettingsTags.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Tag family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getTagsData = (req, res, next) => {
  SettingsTags.findAll()
  .then((tags) => {
    let tagsJSON = [];
    for (let i = 0; i < tags.length; i++) {
      tagsJSON.push(tags[i].dataValues);
    }   
    res.status(200).json(tagsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteTag = (req, res, next) => {
  SettingsTags.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Tag deleted successfully" });
      } else {
        res.status(404).json({ error: "Tag not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createLocation = (req, res, next) => {
  SettingsLocations.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Location family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateLocation = (req, res, next) => {
  const updateFields = req.body;

  SettingsLocations.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Location family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getLocationsData = (req, res, next) => {
  SettingsLocations.findAll()
  .then((locations) => {
    let locationsJSON = [];
    for (let i = 0; i < locations.length; i++) {
      locationsJSON.push(locations[i].dataValues);
    }   
    res.status(200).json(locationsJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteLocation = (req, res, next) => {
  SettingsLocations.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Location deleted successfully" });
      } else {
        res.status(404).json({ error: "Location not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createCountry = (req, res, next) => {
  SettingsCountries.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Country family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateCountry = (req, res, next) => {
  const updateFields = req.body;

  SettingsCountries.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Country family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getCountriesData = (req, res, next) => {
  SettingsCountries.findAll()
  .then((countries) => {
    let countriesJSON = [];
    for (let i = 0; i < countries.length; i++) {
      countriesJSON.push(countries[i].dataValues);
    }   
    res.status(200).json(countriesJSON);
  })
  .catch(err => {
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteCountry = (req, res, next) => {
  SettingsCountries.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Country deleted successfully" });
      } else {
        res.status(404).json({ error: "Country not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};

export const createLanguage = (req, res, next) => {
  SettingsLanguages.create(req.body)
  .then(newfamily => {
    res.status(201).json({ message: 'Language family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const updateLanguage = (req, res, next) => {
  const updateFields = req.body;

  SettingsLanguages.update(updateFields, { where: { id: req.body.id } })
  .then(newfamily => {
    res.status(201).json({ message: 'Language family created successfully', family: newfamily });
  })
  .catch(error => {
    if(error.errors && error.errors[0].validatorKey == 'not_unique'){
      const message = error.errors[0].message;
      const capitalizedMessage = message.charAt(0).toUpperCase() + message.slice(1);
      res.status(409).json({ error: capitalizedMessage});
    }else res.status(500).json({ error: "Internal server error" });
  });
}

export const getLanguagesData = (req, res, next) => {
  SettingsLanguages.findAll()
  .then((languages) => {
    let languagesJSON = [];
    for (let i = 0; i < languages.length; i++) {
      languagesJSON.push(languages[i].dataValues);
    }   
    res.status(200).json(languagesJSON);
  })
  .catch(err => {
    console.log(err);
    res.status(502).json({error: "An error occurred"});
  });
};

export const deleteLanguage = (req, res, next) => {
  SettingsLanguages.destroy({ where: { id: req.body.id } })
    .then((result) => {
      if (result === 1) {
        res.status(200).json({ message: "Language deleted successfully" });
      } else {
        res.status(404).json({ error: "Language not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
};
