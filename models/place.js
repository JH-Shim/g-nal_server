'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class place extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  place.init(
    {
      account: DataTypes.STRING,
      nickname: DataTypes.STRING,
      placeName: DataTypes.STRING,
      placePhoto: DataTypes.STRING,
      placeDescription: DataTypes.STRING,
      lat: DataTypes.DECIMAL(10, 7),
      lng: DataTypes.DECIMAL(10, 7),
    },
    {
      sequelize,
      modelName: 'place',
    },
  );
  return place;
};
