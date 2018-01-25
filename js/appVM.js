function AppViewModel() {
    const self = this;

    // This is an array of all shop objects from foursquare api request.
    self.shops = ko.observableArray([]);

    // This is an array of current displayed shops.
    // An update function receive shop object as an agrument, 
    // then show its marker and push it into the array. 
    self.showingShops = ko.observableArray([]);
    self.updateShowingShops = function(shop) {
        self.showMarker(shop);
        self.showingShops.push(shop);
    }

    // These functions, which are used to create and manipulate markers.

    // This function receive shop object as an agrument,
    // then create marker with its information and set marker as object's property.
    self.createMarker = function(shop) {
        const info = shop.venue;
        const lat = info.location.lat;
        const lng = info.location.lng;
        
        const marker = new google.maps.Marker({
            position: {lat, lng},
            map: map,
            animation: google.maps.Animation.DROP,
            title: info.name
        });
        shop.marker = marker
    }
    // This function receive shop object as an agrument, then set its marker status into visible.
    self.showMarker = function(shop) {
        shop.marker.setMap(map);
    }
    // This function is used to make all markers invisible.
    self.hideAllMarker = function() {
        self.shops().forEach(shop => {
            shop.marker.setMap(null);
        });
    }

    // These functions, which are used to create and manipulate infoWindows.

    // This function receive shop object as an agrument,
    // then create infoWindow with its information and set infoWindow as object's property.
    self.createInfoWindow = function(e) {
        const info = e.venue;
        const name = info.name ? info.name : "No name available.";
        const tips = e.tips ? e.tips[0].text : "No tips available.";
        const phone = info.contact.formattedPhone ? info.contact.formattedPhone : "No phone number available.";
        const address = info.location.formattedAddress ? info.location.formattedAddress.join(",") : "No address available.";

        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${name}</h3>
            <p>${tips}</p>
            <p>
                <strong>tel:</strong> ${phone} <br />
                <strong>address:</strong> ${address} <br />
            </p>
            `
        });
        e.infoWindow = infoWindow
    }
    // This function receive shop object as an agrument. 
    // Close all infoWindows and then open current shop infoWindow.
    self.openInfoWindow = function(shop) {
        self.closeAllInfoWindow();
        shop.infoWindow.open(map, shop.marker);
    }
    // This function is used to close all infoWindows
    self.closeAllInfoWindow = function() {
        self.shops().forEach(e => {
            e.infoWindow.close();
        });
    }

    // This function receive string as an agrument and search for matching objects in self.shops array.
    // Then push matching objects to self.showingShops by self.updateShowingShops function.
    self.filterShops = function(input) {
        self.showingShops.removeAll();
        self.closeAllInfoWindow();
        self.hideAllMarker();

        self.shops().forEach(function(e) {
            const name = e.venue.name;
            const address = e.venue.location.address;
            const category = e.venue.categories[0].name;
            const shopKeyword = `${name} ${address} ${category}`.toLowerCase();

            if (shopKeyword.includes(input)) {
                self.updateShowingShops(e);
            }
        });
    };

    // This function is used to handle search feature.
    self.searchInput = ko.observable();
    self.searchHandler = function() {
        self.filterShops(self.searchInput());
    }

    // This function is used to handle filter feature.
    self.filterCategories = ko.observableArray(['not-selected', 'american', 'sushi', 'chinese', 'mexican', 'cafe']);
    self.chosenCategories = ko.observable();
    self.filterHandler = function() {
        if (self.chosenCategories() === 'not-selected') {
            self.showingShops.removeAll();
            self.closeAllInfoWindow();
            self.hideAllMarker();

            self.shops().forEach(e => {
                self.updateShowingShops(e);
            });
        } else {
            self.filterShops(self.chosenCategories());
        }
    }

    // This function is used to bounce marker and open infoWindow when click at sidebar list.
    self.clickListHandler = function(shop) {
        google.maps.event.trigger(shop.marker, 'click');
    }

    // This function is used to handle random feature which will random a shop from self.shops array
    self.randomShop = function() {
        const ranNum = Math.ceil(( Math.random() * self.showingShops().length ) - 1);
        google.maps.event.trigger(self.showingShops()[ranNum].marker, 'click');
    }
    
    // This function is called once when the googlemap api script is loaded.
    // It setups the main map, get recommended shops array by calling getRecommendedShop function,
    // and then loop to shops array in order to create markers, infoWindows, and set their event's listener.
    let map;      
    self.init = function() {
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.4435904, lng: -79.9447279},
        zoom: 14
        });

        getRecommendedShop()
        .then(function(res) {
            res.forEach(e => {
                self.shops().push(e);
            });
        })
        .then(function() {
            self.shops().forEach(e => {
                self.createMarker(e);
                self.createInfoWindow(e);
                
                e.marker.addListener('click', function() {
                    // Stop bouncing marker and bouce current marker.
                    self.shops().forEach(e => {
                        e.marker.setAnimation(null);
                    });
                    this.setAnimation(google.maps.Animation.BOUNCE);
    
                    self.openInfoWindow(e);
                });
    
                self.updateShowingShops(e);
            });
        })
        .catch(function() {
            alert('cannot create markers or infoWindows');
        });
    }
    AppViewModel.init = self.init;
}

ko.applyBindings(new AppViewModel());

// This function is used to handle when google map api cannot load.
function googleLoadedError() {
    const messege = `google map is unable to load.\n${err}`;
    alert(messege);
}