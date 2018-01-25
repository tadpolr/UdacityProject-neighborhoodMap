// These constant are default value of the required fields in foursquare api requests.
const id = "LSBXWNV1MELUFVDXJAL5H0YMLM1ODQBBJIHOFN2MNAGMINI0";
const secret = "GHFZ2SFD2UVD1JDPCMEEF3PRNZSHK143NYQBPY0PGXV0YZBF";
const v = 20180124;
const ll = "40.443520,-79.942936";
const limitRes = 50;
const radius = 2000;

// This function is a async function that will receieve shop catagory as string and 
// return an array of recommended shops.
function getRecommendedShop(data) {
    return fetch(
        `https://api.foursquare.com/v2/venues/explore?client_id=${id}&client_secret=${secret}&ll=${ll}&v=${v}&limit=${limitRes}&radius=${radius}&query=food`,
        {method: 'GET'}
    )
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {
        return res.response.groups[0].items;
    })
    .catch(function(err) {
        const messege = `Cannot get recommended shop\n${err}`;
        alert(messege);
    });
}
