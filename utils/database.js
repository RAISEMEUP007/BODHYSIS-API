import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('bohdisys_dev', 'bohdisys_dev', 'GkpOdiN4%OAvs8', {
    dialect: 'mysql',
    host: 'bohdisys-dev.cnbsdl0pi4gg.us-east-1.rds.amazonaws.com', 
});

export default sequelize;