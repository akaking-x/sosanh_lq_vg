/**
 * Models Index / Xuất tất cả các mô hình
 * Tập hợp tất cả các model để dễ dàng import
 */

const Hero = require('./Hero');
const Item = require('./Item');
const Rune = require('./Rune');
const SummonerSkill = require('./SummonerSkill');
const HeroMapping = require('./HeroMapping');
const Admin = require('./Admin');

module.exports = {
  Hero,
  Item,
  Rune,
  SummonerSkill,
  HeroMapping,
  Admin,
};
