const axios = require('axios'); 
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
exports.lambdaHandler = async (event, context) => {
  const dataUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';

  const response = await axios.get(dataUrl);
  const dataCsv = response.data;
  const dataJson = parseCsv(dataCsv);

  const bucketName = 'make-json-sam-app-goto-20210615';

  const params = {
    Body: JSON.stringify(dataJson), 
    Bucket: bucketName,
    Key: "coronadata.json"
   };

  await s3.putObject(params).promise();

  return {
    'statusCode': 200,
    'body': JSON.stringify(dataJson)
  }

};

function parseCsv(dataCsv) {

  let data = [];
  let header = [];
  let japan = [];

  const row = dataCsv.split('\n');

  for(let i = 0, l = row.length; i < l; i++){
    const rowArray = row[i].split(',');
    if(i === 0 ) {
      header = rowArray;
    }
    if(rowArray[1] === 'Japan'){
      japan = rowArray;
    }
  }

  for(let i = 0, l = header.length; i < l; i++){
    if(i < 4) {
      continue;
    }
    data.push([
      header[i],
      +japan[i],
    ])
  }


  return data;
}
