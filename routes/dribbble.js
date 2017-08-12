const express = require('express');
const request = require('request');

const router = express.Router();

const apiUrl = 'https://api.dribbble.com/v1';
const accessToken = '';

const baseRequest = request.defaults({
  headers: {
    'content-type': 'application/json'
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/shots', function(req, res, next) {
  baseRequest(apiUrl + '/shots/?date=2017-08-01&access_token=' + accessToken, function (error, response, body) {
    const shots = JSON.parse(body);
    // console.log(shots);
    if (error) {
      console.log(error);
      res.send(error);
      return;
    }
    if (shots.message) {
      console.log(shots);
      return;
    }
    uploadShotImages(shots.slice(0, 10), res); 
  });
});

function uploadShotImages(shots, res) {
  const imagesArr = [];
  // console.log(shots);
  for (const shot of shots) {
    console.log(shot.user.id);
    baseRequest(apiUrl + '/users/' + shot.user.id + '/shots/?access_token=' + accessToken, function (error, response, body) {
      if (error) {
	console.log(error);
	return;
      }
      // console.log(body);
      const userShots = JSON.parse(body);
      for (const userShot of userShots.slice(0, 10)) {
        // console.log(userShot.id);
	// console.log(userShot.tags);
        handleShot(userShot.id, userShot.tags, (images, tags) => {
	  if (images && tags) {
	    console.log('----------------------------------------------');
	    console.log(images);
	    console.log(tags);
	    if (images && images.normal) {
              imagesArr.push('<img src="' + images.normal + '" />');
	    }
	    console.log('----------------------------------------------');
          }
        });
      }
    });
  }
  console.log(imagesArr);
  res.send(imagesArr.join(''));
}

function handleShot(id, tags, callback) {
  baseRequest(apiUrl + '/shots/' + id + '?access_token=' + accessToken, function (error, response, body) {
    if (error) {
      console.log('error:', error); // Print the error if one occurred
      return;
    }
    // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body);
    const jsonBody = JSON.parse(body);
    // console.log('normal', jsonBody.images.normal);
    callback(jsonBody.images, tags);
  });
}

router.get('/shots/:id', function(req, res, next) {
  const id = req.params.id;
  handleShot(id, null, (images, tags) => {
    if (images.normal) {
      res.send('<img src="' + images.normal + '" />');
    }
  });
  // res.send('search works!');
});

module.exports = router;
