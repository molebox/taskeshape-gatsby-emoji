const fs = require('fs')
const superagent = require('superagent')

// Setting up the sample code.
// Make sure we have an API_TOKEN and a PROJECT_ID from TakeShape.
const PROJECT_ID = 'XXXX'
const API_TOKEN = 'XXXX'
// Make sure we have some binary image data to upload
const image = fs.readFileSync(`${process.cwd()}/image.jpg`);

// This helper method submits arbitrary queries to TakeShape and returns the response
async function queryTakeShape(query) {
  const res = await superagent
    .post(`https://api.takeshape.io/project/${PROJECT_ID}/graphql`)
    .set('Authorization', `Bearer ${API_TOKEN}`)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({query}))
  if (!res.ok) throw Error(res.status + ' ' + res.statusText)
  return res.body
}

// This helper method uploads binary file data to an arbitrary URL
async function uploadFileToUrl(file, url) {
  const res = await superagent.put(url).send(file)
  if (!res.ok) throw Error(res.status + ' ' + res.statusText)
  return res.body
}

const uploadAssetsQuery = `mutation {
  uploadAssets(files: [
    {
      name: "image.jpg",
      type: "image/jpeg"
    }
  ]) {
    uploadUrl
    asset {
      path
      filename
    }
  }
}`

async function main() {
  const queryRes = await queryTakeShape(uploadAssetsQuery)
  for (const uploadedAsset of queryRes.data.uploadAssets) {
    const res = await uploadFileToUrl(image, uploadedAsset.uploadUrl)
    console.log(res)
  }
}