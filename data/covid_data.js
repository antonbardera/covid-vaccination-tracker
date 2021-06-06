
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
    aq.fromCSV(await fetch(url).then(res => res.text()))
        .groupby('grupo_edad','fecha')
        .pivot('grupo_edad', { value: d => op.sum(d.num_casos) })
        .select(aq.not('grupo_edad'))
        .print()
        // .filter(d => d.fecha > '2020-02-01').print()
        // .derive({ under50: d=> d['0-9']+ d['10-19']+ d['20-29']+ d['30-39']+ d['40-49'] }).select('under50').objects()




    // console.log(data)
    // let pivot = data.
    //     // .derive({under50: d=> op.sum(aq.range(['0-9','40-49']))})
}
    // .rollup({
        //   under50: d => aq.op.sum(d.cases),
        // })
    
    
  /* const weekly = aq.fromCSV(
    await unzip('https://dadescovid.cat/static/csv/catalunya_setmanal.zip', 'catalunya_setmanal.csv'),
    {delimiter: ';'}
  )
    .select({RESIDENCIA:'residencia',DATA_FI:'data',IA14:'ia14',TAXA_CASOS_CONFIRMAT:'taxa_confirmats',CASOS_CONFIRMAT:'confirmats',INGRESSOS_TOTAL:'ingressos', EXITUS:'exitus'}, )

  const daily = aq.fromCSV(
    await unzip('https://dadescovid.cat/static/csv/catalunya_diari.zip', 'catalunya_diari.csv'),
    {delimiter: ';'}
  )
  .groupby('DATA', 'RESIDENCIA')
  .rollup({
    VACUNATS: d => aq.op.sum(d.VACUNATS_DOSI_1),
    VACUNATS2: d => aq.op.sum(d.VACUNATS_DOSI_2)
  })

  const rename = [{DATA:'data'},{CUM_VACUNATS:'vacunats'}, {CUM_VACUNATS2: 'pauta_completa'},'ia14','taxa_confirmats','confirmats','ingressos','exitus'];
  const derive = {
    CUM_VACUNATS: aq.rolling(d => aq.op.sum(d.VACUNATS)),
    CUM_VACUNATS2: aq.rolling(d => aq.op.sum(d.VACUNATS2))
  }

  const res_si = daily
    .filter(d => d.RESIDENCIA === 'Si')
    .join(weekly.filter(d=> d.residencia === 'Si'), ['DATA', 'data'])
    .orderby('DATA')
    .derive(derive)
    .select(rename)

  const res_no = daily
    .filter(d => d.RESIDENCIA === 'No')
    .join(weekly.filter(d=> d.residencia === 'No'), ['DATA', 'data'])
    .orderby('DATA')
    .derive(derive)
    .select(rename);

  const res_indef = daily
    .filter(d => d.RESIDENCIA === '--')
    .join(weekly.filter(d=> d.residencia === '--'), ['DATA', 'data'])
    .orderby('DATA')
    .derive(derive)
    .select(rename)

  const data = {
    si:res_si.objects().filter(d => d.data >= filterDate),
    no:res_no.objects().filter(d => d.data >= filterDate),
    indefinit:res_indef.objects().filter(d => d.data >= filterDate),
  }

  writeJSON(data, 'data_residence', dest) 
}*/


 
main();
