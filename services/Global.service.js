const path = require('path')
const fs = require('fs');
// const CyrillicToTranslit = require('cyrillic-to-translit-js')

// const cyrillicToTranslit = new CyrillicToTranslit();

const GLOBAL_INIT = async () => {
  const cities = await CITIES_LIST();
  const categories = await CATEGORY_LIST();
  const main = await MAIN_DATA();
  return {
    cities,
    categories,
    main
  }
}

const CITIES_LIST = async () => {
  const data = await fs.readFileSync(path.join(__dirname, '..', 'global', 'cities.json'));
  const res = JSON.parse(data.toString());
  return res
}

const CATEGORY_LIST = async () => {
  const data = await fs.readFileSync(path.join(__dirname, '..', 'global', 'categories.json'));
  const res = JSON.parse(data.toString());
  return res
}

const MAIN_DATA = async () => {
  const data = await fs.readFileSync(path.join(__dirname, '..', 'global', 'main.json'));
  const res = JSON.parse(data.toString());
  return res
}

const getCityByValue = async (city) => {
  if(!city) return { status: 200, json: [] }
  try {
    const list = await CITIES_LIST();
    const result = list.filter(el => el.name.toLowerCase().includes(city.toLowerCase()))
    return { status: 200, json: result }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on search city' }
  }
}

module.exports = {
  GLOBAL_INIT,
  getCityByValue
}