const StandardError = require('standard-error')
const TextIndex = require('../search/index/Text')
const { clone } = require('lodash')

class MedicamentsService {

  constructor(options) {
    this.medicaments = options.medicaments
    this.nameIndex = new TextIndex('nom', {ref: 'cis'})
    const medicamentsAsArray = Object.keys(this.medicaments)
                                  .map((key) =>  this.medicaments[key])
    this.nameIndex.load(medicamentsAsArray)
  }

  getByCis(cis) {
    const med = this.medicaments[cis]
    if(med) return Promise.resolve(med)
    else return Promise.reject(new StandardError("Le medicament n'a pas été trouvé", {code: 404}))
  }

  getByName(name, limit = '0', get = 'tous'){
	const _limit = (limit.split(',').length == 1 && limit.split(',')[0] != "0") ? limit:(limit.split(',').length == 2 && limit.split(',')[0] != "0") ? parseInt(limit.split(',')[0]) + parseInt(limit.split(',')[1]):undefined;
	const _max = (limit.split(',').length == 2) ? limit.split(',')[1]:0;
    const results = this.nameIndex
            .find(name)
			.slice(parseInt(_max), (typeof(_limit) == "string") ? parseInt(_limit):undefined)
            .map((item) => {
				if(get == 'tous'){
					const result = clone(this.medicaments[item.ref])
					result._score = item.score
					return result
				}
				if(get != 'tous')return clone(this.medicaments[item.ref][get])
            })

    return Promise.resolve(results)
  }
}


module.exports = MedicamentsService
