function AppViewModel() {
    const self = this

    // These arrays are used to store markers and infoWindows that are created by createMarker function.
    let markers = ko.observableArray();
    let infoWindows = ko.observableArray();

    // This function is used to create markers and infoWindows by passing an array of shops.
    // It also bind each marker with related infoWindows by click event.
    self.createMarker = function(shops) {
        // Remove all existing markers
        markers().forEach(e => {
            e.setMap(null)
        });
        markers.removeAll()

        // This function is used to stop all markers animation and start bouncing selected marker. 
        function toggleBounce(marker) {
            markers().forEach(e => {
                e.setAnimation(null)
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }

        // Create markers by looping on shops array
        for (let i = 0; i < shops.length; i++) {
            const shop = shops[i]
            const shopInfo = shop.venue
            const lat = shopInfo.location.lat
            const lng = shopInfo.location.lng
            
            const marker = new google.maps.Marker({
                position: {lat, lng},
                map: map,
                animation: google.maps.Animation.DROP,
                title: shopInfo.name
            })
            markers.push(marker)
            
            // Create an infoWindow containing shop's information.
            const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${shopInfo.name}</h3>
                <p>${shopInfo.description}</p>
                <p>
                    <strong>tel:</strong> ${shopInfo.contact.formattedPhone} <br />
                    <strong>address:</strong> ${shopInfo.location.formattedAddress.join(",")}
                </p>
                `
            });
            infoWindows.push(infoWindow)
            
            // Set event's listener for clicking marker.
            marker.addListener('click', function() {
                
                // Make clicked marker bounce
                toggleBounce(marker)

                // Hidden all showing infoWindows and open current shop infoWindow.
                infoWindows().forEach(e => {
                    e.close()
                });
                infoWindow.open(map, marker);
            });
        }
    }

    // This array store shopLists that are created by createShopList function.
    self.shopList = ko.observableArray()
    self.createShopList = function(shops) {
        self.shopList.removeAll()
        shops.forEach(e => {
            self.shopList.push(e.venue)
        })
    }

    // This function is used to automatically click marker when user click the shopList with the same shop's information.
    self.clickListHandler= function(data) {
        markers().forEach(function(e) {
            if (data.name === e.title) {
                google.maps.event.trigger(e, 'click');
            }
        })
    }

    // This variable bind with input DOM element and its value will be used to search for shops. 
    self.searchInput = ko.observable()
    // This function will search for shops that match the input value by sending a foursquare's api request to foursquare api.
    self.searchShop = function(){
        const input = self.searchInput()

        searchShop(input)
        .then(function(res) {
            self.createMarker(res)
            self.createShopList(res)
        })
    }

    // This function is binded with filter button. It will get new array of shops by sending a foursquare's api request, 
    // and then create markers, infoWindows and shopList with that array.
    self.filterHandler = function(data, event) {
        getRecommendShop(event.target.id)
        .then(function(res) {
            self.createMarker(res)
            self.createShopList(res)
        })
    };

    // This function will pick one shop randomly from markers.
    self.randomShop = function() {
        const ranNum = Math.round(( Math.random() * markers().length ) - 1)
        google.maps.event.trigger(markers()[ranNum], 'click');
    }

    // This function is called once when starting the app in order to create a map using google map apis,
    // and then create markers, infoWindows and shopList from list of shops gotten by sending by 
    // sending an api request to foursquare explore venue api.
    let map;      
    function init() {
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.4435904, lng: -79.9447279},
        zoom: 14
        });
        getRecommendShop()
        .then(function(res) {
            self.createMarker(res)
            self.createShopList(res)
        })
    }
    init()
}

ko.applyBindings(new AppViewModel());