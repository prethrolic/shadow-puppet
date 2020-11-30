# Shadow Puppet
A user-friendly interface that provides pronunciation evaluation for people shadowing with movies

## access
In the browser, go to 
```
https://143.248.150.127:8080/score
https://143.248.150.127:3000/
````
Make sure to include `https://` prefix in both cases. If your browser warns you about potential secutiry violation, click `Advanced...` and then something like `Accept risks and continue`. This is inevitable, because for microphone usage we had to enforce https, but trusted SSL certificates are paid.
You may now close the first page and access the prototype functionality in the second one.

## implementation details
`src` directory contains the front-end part of the prototype:

* components - 4 main components of the main page
* pages - the main page
* constants - static information needed stored in the page
* scss - stylesheets

`server` is the back-end directory of the prototype:
* model and model.py - the information about the deep-learning model comparing the audio and the model itself
* score.py - main backend script running the model and returning the data back to the front-end
* app.js - `express` interface between the front-end and the back-end

## replication
1. fork or clone this repository
2. install all the requirements (more specifically in the report)
3. run the node server ```node shadow-puppet/server/app.js```
4. run the front-end server ```HTTPS=true npm start``` (slightly different for Mac OS and Windows)
5. ????
6. PROFIT!