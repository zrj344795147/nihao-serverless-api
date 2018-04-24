// Packages
const AWS = require('aws-sdk');
const yelp = require('yelp-fusion');
const fs = require('fs');
// Configs
const yelpApiKey = 'RS5xFR5EjvEsNEhAyN5sxFG0FnzmFdsJ6TyZoV6tXUpRI-FEJXxRouwTq54K_0a-DJCxag8L7wpjahFxz-GR1iSxYMfpv6oM3cVZoz9J-upyiP8ztxQ26g3B8n69WnYx';

AWS.config.update({region: 'us-east-1'});
const DB = new AWS.DynamoDB.DocumentClient();



// DB.put(putParams, function(err, data) {
//     if (err) {
//         console.log("Error", err);
//     } else {
//         console.log("Success", data);
//     }
// });
//


const cuisines = ['Chinese', 'Mexican', 'American', 'Japanese', 'Indian'];
// const cuisines = ['Chinese'];




// yelpClient.search(searchRequest)
//     .then(res => {
//         console.log(res.body);
//     })
//     .catch(err => {
//         console.log("Error", err);
//     });

async function  getYelpRestaurants(cuisine) {
    const yelpClient = yelp.client(yelpApiKey);

    console.log(cuisine);

    for(let i = 0; i < 1200; i += 50) {
        let searchRequest = {
            term: cuisine + ' Food',
            location: 'Manhattan',
            offset: i,
            limit:50
        };
        await yelpClient.search(searchRequest)
            .then(res => {
                console.log(res.body);
                let body = JSON.parse(res.body);
                if(body.businesses.length === 0) {
                    return;
                }
                for(let business of body.businesses) {
                    let putParams = {
                        TableName:'yelp-restaurants',
                        Item: {
                            'id': business.id || 'empty',
                            'name': business.name || 'empty',
                            'rating': business.rating || 'empty',
                            'categories': cuisine || 'empty',
                            'review_count': business.review_count || -1,
                            'latitude': business.coordinates.latitude || 0.0,
                            'longitude': business.coordinates.longitude || 0.0,
                            'address': (business.location.display_address[0] + ' ' + business.location.display_address[1]) || 'empty',
                            'zip_code': business.location.zip_code || 'empty',
                            'phone': business.phone|| 'empty',
                        }
                    };
                    setTimeout(() => {
                        DB.put(putParams, function(err, data) {
                            if (err) {
                                console.log("Put Error", err);
                            } else {
                                console.log("Success: ", putParams.Item.id);
                            }
                            });
                        }, 100);
                }
            })
            .catch(err => {
                console.log("Yelp Error", err);
            });
    }
}

function addIndex(src, dst) {
    const file = fs.readFileSync(src);
    const content = JSON.parse(file);

    console.log(content.length);
    let res = '';
    for(let i = 0; i < content.length; i++) {
        res += '{ "index" : { "_index": "predictions", "_type" : "prediction", "_id" : "' + (i+1) + '" } } \n';
        res += JSON.stringify(content[i]) + '\n';
    }

    fs.writeFile(dst, res, (err) => {
        console.log(err);
    });
}

// aws dynamodb scan --table-name yelp-restaurants --output json > result.json
// node dynamodb-dump.js -t yelp-restaurants -f result.csv
// aws dynamodb scan --table-name yelp-restaurants --select "COUNT"
// https://search-es-restaurants-hvqltrqb43grnxpwbome7o4eci.us-east-1.es.amazonaws.com/predictions/_search?q=categories:Chinese&sort=score:desc&pretty&size=10
//curl -XPOST https://search-es-restaurants-hvqltrqb43grnxpwbome7o4eci.us-east-1.es.amazonaws.com/_bulk --data-binary @esData.json -H "Content-Type: application/json"

// main

// getYelpRestaurants(cuisines[0]);
// getYelpRestaurants(cuisines[1]);
// getYelpRestaurants(cuisines[2]);
// getYelpRestaurants(cuisines[3]);
// getYelpRestaurants(cuisines[4]);

addIndex('../prediction.json', '../esData.json');