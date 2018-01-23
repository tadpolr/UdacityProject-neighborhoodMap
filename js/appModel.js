// These constant are default value of the required fields in foursquare api requests.
const id = "X01ZQHEHKO1O14NOV2K0CNNMZ1YTPDL4M2XSFQXYBLHLTBMT"
const secret = "TCLRD3UZQD3JHYN0FGQFY00YOEABVAOXE2UCH2G0MXDYZYOY"
const v = 20180114
const ll = "40.443520,-79.942936"
const limitRes = 10
const radius = 2500

// This function is a async function that will receieve shop catagory as string and return an array of recommended shops.
function getRecommendShop(data) {
    const catagory = data ? data : "food"
    return fetch(
        `https://api.foursquare.com/v2/venues/explore?client_id=${id}&client_secret=${secret}&ll=${ll}&v=${v}&limit=${limitRes}&radius=${radius}&query=${catagory}`,
        {method: 'GET'}
    )
    .then(function(res) {
        return res.json()
    })
    .then(function(res) {
        let promises = []
        let resArr = []
        res.response.groups[0].items.forEach(e => {
            promises.push(
                getVenueDetail(e.venue.id)
                .then(function(res) {
                    resArr.push(res.response)
                })
            )
        });
        return Promise.all(promises).then(function() {
            return resArr
        })
    })
    .catch(function(err) {
        const messege = `Cannot get recommended shop\n${err}`
        alert(messege)
    })
}

// This function is a async function that will receieve search input as string and return an array of matching shops.
function searchShop(input) {
    return fetch(
        `https://api.foursquare.com/v2/venues/search?client_id=${id}&client_secret=${secret}&ll=${ll}&v=${v}&limit=${limitRes}&radius=${radius}&query=${input}`,
        {method: 'GET'}
    )
    .then(function(res) {
        return res.json()
    })
    .then(function(res) {
        let promises = []
        let resArr = []
        res.response.venues.forEach(e => {
            promises.push(
                getVenueDetail(e.id)
                .then(function(res) {
                    resArr.push(res.response)
                })
            )
        });
        return Promise.all(promises).then(function(){
            return resArr
        })
    })
    .catch(function(err) {
        const messege = `Cannot search shop\n${err}`
        alert(messege)
    })
}

// This function is a async function that will receieve shop's id and return an object that contains information of that shop.
// This function is created to ensure that every shop's object has the same format.
function getVenueDetail(venueId) {
    return fetch(
        `https://api.foursquare.com/v2/venues/${venueId}?client_id=${id}&client_secret=${secret}&v=${v}`,
        {method: 'GET'}
    )
    .then(function(res) {
        return res.json()
    })
    .catch(function(err) {
        const messege = `Cannot get shop's detail\n${err}`
        alert(messege)
    })
}

