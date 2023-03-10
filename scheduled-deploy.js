// const fetch = require('node-fetch')
import axios from 'axios';
import schedule from '@netlify/functions';

console.log(schedule)

// This is sample build hook
const BUILD_HOOK = 'https://api.netlify.com/build_hooks/640b704a08f2c01534bbf55c'

const handler = schedule('* * * * *', async () => {
  await axios(BUILD_HOOK, {
    method: 'POST'
  }).then((response) => {
    console.log('Build hook response:', response.data)
  })

  return {
    statusCode: 200
  }
})

export { handler }