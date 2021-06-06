
const dir = require('node-dir');
const d3time = require('d3-time-format');

const csv = require("csv-parse/lib/sync");
const request = require('request');
const aq = require('arquero')
const op = require('arquero')
const {writeJSON, writeCSV} = require('./utils/write');
const fetch = require("node-fetch");
const https = require('https')

const dest = '../app/public/'

//TODO 
// ---> RENAME columns



const main = async () => {
  let url ='https://cnecovid.isciii.es/covid19/resources/casos_hosp_uci_def_sexo_edad_provres.csv'
    const data = aq.fromCSV(await fetch(url).then(res => res.text()))
        .derive({ccaa: d => { 
          const provToCcaa = { 
            A :'Com. Valenciana', AB: 'Castilla-La Mancha', AL:	'Andalucía', AV: 'Castilla y León', B : 'Cataluña',
            BA:	'Extremadura', BI:	'País Vasco', BU:	'Castilla y León', C : 'Galicia', CA:	'Andalucía', CE:	'Ceuta',
            CC:	'Extremadura', CO: 'Andalucía', CR:	'Castilla-La Mancha', CS: 'Com. Valenciana', CU:	'Castilla-La Mancha',
            GC:	'Canarias', GI:	'Cataluña', GR: 'Andalucía', GU:	'Castilla-La Mancha', H :'Andalucía', HU:	'Aragón', J : 'Andalucía',
            L :	'Cataluña', LE:	'Castilla y León', LO: 'La Rioja', LU:	'Galicia', M :	'Madrid', MA:	'Andalucía', ML: 'Melilla',
            MU:	'Murcia', NA:	'Navarra', O : 'Asturias', OR:	'Galicia', P : 'Castilla y León', PM: 'Baleares',
            PO: 'Galicia', S : 'Cantabria', SA: 'Castilla y León', SE: 'Andalucía', SG: 'Castilla y León', SO: 'Castilla y León',
            SS: 'País Vasco', T : 'Cataluña', TE: 'Aragón', TF:	'Canarias', TO: 'Castilla-La Mancha', V :	'Com. Valenciana', VA: 'Castilla y León',
            VI: 'País Vasco', Z : 'Aragón', ZA:	'Castilla y León'
          };
          return provToCcaa[d.provincia_iso]||"no_ccaa";
        }})
        .groupby('ccaa','fecha')
        .pivot('grupo_edad', { value: d => ({cases:op.sum(d.num_casos),hosp:op.sum(d.num_hosp), uci:op.sum(d.num_uci), deaths:op.sum(d.num_def) })})
        .derive({cases_under50: d=> d['0-9'].cases+ d['10-19'].cases+ d['20-29'].cases+ d['30-39'].cases+ d['40-49'].cases })
        .derive({cases_50to59: d=> d['50-59'].cases})
        .derive({cases_60to69: d=> d['60-69'].cases})
        .derive({cases_70to79: d=> d['70-79'].cases})
        .derive({cases_above80: d=> d['80+'].cases})
        .derive({deaths_under50: d=> d['0-9'].deaths+ d['10-19'].deaths+ d['20-29'].deaths+ d['30-39'].deaths+ d['40-49'].deaths })
        .derive({deaths_50to59: d=> d['50-59'].deaths})
        .derive({deaths_60to69: d=> d['60-69'].deaths})
        .derive({deaths_70to79: d=> d['70-79'].deaths})
        .derive({deaths_above80: d=> d['80+'].deaths})
        .derive({hosp_under50: d=> d['0-9'].hosp+ d['10-19'].hosp+ d['20-29'].hosp+ d['30-39'].hosp+ d['40-49'].hosp })
        .derive({hosp_50to59: d=> d['50-59'].hosp})
        .derive({hosp_60to69: d=> d['60-69'].hosp})
        .derive({hosp_70to79: d=> d['70-79'].hosp})
        .derive({hosp_above80: d=> d['80+'].hosp})
        .derive({uci_under50: d=> d['0-9'].uci+ d['10-19'].uci+ d['20-29'].uci+ d['30-39'].uci+ d['40-49'].uci })
        .derive({uci_50to59: d=> d['50-59'].uci})
        .derive({uci_60to69: d=> d['60-69'].uci})
        .derive({uci_70to79: d=> d['70-79'].uci})
        .derive({uci_above80: d=> d['80+'].uci})
        .select(aq.not('0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80+','NC'))
        //.print({ offset: 5000 })
        .objects();
        
  // console.log(data)
  writeJSON(data, 'data_covid_indices', dest) 
  writeCSV(data, 'data_covid_indices', dest) 
}


 
main();
