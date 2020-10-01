// ---Variables---
var searchedCities = [];

// ---City search---
// Prevents page from refreshing when enter is pressed
$("form").submit(function (e) {
    e.preventDefault();
})
// Check if user pressed enter
$("#city-search").on("keyup", function (e) {
    if (e.key == "Enter" && e.target.value !== "") {
        loadCity(e.target.value);
        addSearchHistory(e.target.value);
    }
});
// check if user pressed search button
$("#search-city-btn").on("click", function (e) {
    if ($("#city-search").val() !== "") {
        loadCity($("#city-search").val());
        addSearchHistory($("#city-search").val());
    }
});

// ---Loads city weather---
function loadCity(cityName) {
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=256b25d2b8a8f2b130f652e84d69f8ee";
    $.ajax({
        url: url,
        success: function (data) {
            console.log(data);
            $("#city-name").text(cityName);
            $("#temp-span").text(data.main.temp + "\u00B0");
            $("#humid-span").text(data.main.humidity);
            $("#wind-span").text(data.wind.speed + "m/sec");
        },
        error: function (e) {
            console.log(e.responseText);
        }
    });
}

// ---Adds to search history---
function addSearchHistory(cityName) {
    // checks if city already exists in list
    if (!searchedCities.includes(cityName)) {
        searchedCities.push(cityName);
        console.log(searchedCities);
        refreshSearchHistory();
        // saves searchedCities array to local storage

    }
}

// ---Refreshes search history list---
function refreshSearchHistory() {
    // clears list
    $("#city-list").html("");
    for (var i = 0; i < searchedCities.length; i++) {
        var newLi = $("<li>");
        newLi.text(searchedCities[i]);
        newLi.addClass("list-group-item list-group-item-action")
        newLi.click(function () {
            loadCity($(this).text());
        });
        // appends city list items to list tag
        $("#city-list").append(newLi);
    }
}

// ---Collapse button for mobile responsiveness---
$("#cityCollapseBtn").on("click", function () {
    $("#cityCollapse").collapse("toggle")
})
