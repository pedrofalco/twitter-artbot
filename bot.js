// // BOT.js
console.log('--Bot is live');

const dotenv = require('dotenv').config();
const Twit = require('twit');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const b64 = require('fetch-base64');
const T = new Twit({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET_KEY,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


const artblocks_contract = '0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270';
const superrare_contract = '0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0';

const SUPERRARE_TOKEN = [12303, 12489, 12725, 13027, 13423, 13663, 13892, 14228, 14476, 14817, 15319, 15973, 16745, 17371, 19291, 26906];

let token_id;
let platform;
let collection;
let keyword;

const job = schedule.scheduleJob({
    hour: 11,
    minute: 30
}, () => {

    buildTweet();
});


async function buildTweet() {
    randomCollection();
    let artwork;

    if (platform === 'Artblocks') {
        artwork = await getArtblocks();
    } else {
        artwork = await getSuperRare()
    };

    await tweetArtwork(artwork.image, artwork.name, artwork.output, artwork.dimension, artwork.url, artwork.os_url, artwork.year);
};

async function getArtblocks() {
    const options = {
        method: 'GET',
        withCredentials: true,
        headers: {
            "X-API-Key": process.env.MORALIS_API_KEY,
            "Content-Type": "application/json"
        }
    };

    const url = `https://deep-index.moralis.io/api/v2/nft/${artblocks_contract}/${token_id}?chain=eth&format=decimal`;

    const response = await fetch(url, options);
    const data = await response.json();

    const uri = await fetch(data.token_uri);
    const artwork = await uri.json();

    const toTwitter = {
        image: artwork.image,
        name: artwork.name,
        artist: artwork.artist,
        dimension: 'Variable',
        url: `https://artblocks.io/token/${token_id}`,
        os_url: `https://opensea.io/assets/${artblocks_contract}/${token_id}`
    };

    if (collection === 'Asterisms') {
        toTwitter.year = 2021;
        toTwitter.output = 'Interactive Experience';
    } else {
        toTwitter.year = 2022;
        toTwitter.output = 'Digital Image';
    };

    return toTwitter;
};

async function getSuperRare() {
    const options = {
        method: 'GET',
        withCredentials: true,
        headers: {
            "X-API-Key": process.env.MORALIS_API_KEY,
            "Content-Type": "application/json"
        }
    };

    const url = `https://deep-index.moralis.io/api/v2/nft/search?chain=eth&format=decimal&q=%5C%22createdBy%5C%22%3A%5C%22${token_id}%5C%22`;

    const response = await fetch(url, options);
    const data = await response.json();


    const index = randomRange(0, data.result.length - 1);

    const uri = await fetch(data.result[index].token_uri);
    const artwork = await uri.json();
    const id = data.result[index].token_id;

    let name_dash = artwork.name;
    name_dash = name_dash.replace(/\s+/g, '-').toLowerCase();

    if (artwork.name === 'Dubious Coincidences') {
        artwork.image = 'media/dubious-coincidences.png';
    } else if (artwork.name === 'Gray Matter') {
        artwork.image = 'media/gray-matter.jpg';
    };

    const toTwitter = {
        image: artwork.image,
        name: artwork.name,
        artist: 'Falko',
        dimension: artwork.media.dimensions + 'px',
        year: artwork.yearCreated,
        url: `https://superrare.com/artwork-v2/${name_dash}-${id}`,
        os_url: `https://opensea.io/assets/${superrare_contract}/${id}`
    };

    if (artwork.media.mimeType == 'artwork video/mp4') {
        toTwitter.output = 'Digital Video';
    } else {
        toTwitter.output = 'Digital Image';
    };
    return toTwitter;
};

function tweetArtwork(img, title, type, dimensions, url, os_url, year) {
    let tweet_text;
    if (title === 'Dubious Coincidences') {
        tweet_text = `${title}, ${year}, ${type}, Dimensions: ${dimensions}, Stored on the Ethereum Blockchain\n\ncollab with @okytomo1\n\n📌 ${url}\n\n📌 ${os_url}`;
    } else {
        tweet_text = `${title}, ${year}, ${type}, Dimensions: ${dimensions}, Stored on the Ethereum Blockchain\n\n📌 ${url}\n\n📌 ${os_url}`;
    };

    b64.auto(img).then((jpg) => {
        console.log('Encoded!');

        T.post('media/upload', {
            media_data: jpg[0]
        }, function(err, data, response) {
            var mediaIdStr = data.media_id_string
                // var altText = "Small flowers in a planter on a sunny balcony, blossoming."
            var meta_params = {
                media_id: mediaIdStr,
                // alt_text: {
                //     text: altText
                // }
            }

            T.post('media/metadata/create', meta_params, function(err, data, response) {
                if (!err) {
                    var params = {
                        status: tweet_text,
                        media_ids: [mediaIdStr]
                    }

                    T.post('statuses/update', params, function(err, data, response) {
                        // console.log(data);
                        console.log('Tweeted it!');
                    })
                    console.log('Succeded!');
                    console.log(params.status)
                }
            })
        })
    }).catch((reason) => {
        console.log(reason)
    });
};

function randomCollection() {
    platform = weightedRandom({
        'Artblocks': 0.93,
        'SuperRare': 0.07
    })
    const FOLIAGE = {
        min_token: 270000000,
        // max_token: 270000625
        max_token: 270000083
    };

    const ASTERISMS = {
        min_token: 47000000,
        max_token: 47000100
    };

    if (platform === 'Artblocks') {
        collection = weightedRandom({
            'Asterisms': 0.3,
            'Foliage': 0.7
        })
        if (collection === 'Asterisms') {
            token_id = randomRange(ASTERISMS.min_token, ASTERISMS.max_token);
        } else {
            token_id = randomRange(FOLIAGE.min_token, FOLIAGE.max_token);
        }
    } else {
        token_id = weightedRandom({
            'falko': 0.3,
            'falco': 0.7
        });
    };

}

function weightedRandom(prob) {
    let i, sum = 0,
        r = Math.random();

    for (i in prob) {
        sum += prob[i];
        if (r <= sum) return i;
    }
};

function randomRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
};