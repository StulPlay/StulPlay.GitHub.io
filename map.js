ymaps.ready(init);

function init() {

    var moscowBounds = [
        [54.792811, 36.786548],
        [56.843558, 39.195491]
    ];


    var myMap = new ymaps.Map('map', {
        bounds: moscowBounds,
        zoom: 13,
        controls: []
    });

    window.searchAddress = function () {
        var address = document.getElementById('address').value;
        ymaps.geocode(address, {
                boundedBy: moscowBounds,
                strictBounds: true
            }).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);

            myMap.geoObjects.add(firstGeoObject);
            myMap.setBounds(firstGeoObject.properties.get('boundedBy'), {
                checkZoomRange: true
            });
        });
    };
}