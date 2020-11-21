// ---Variables---
var searchedCities = [];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---City search---
// Prevents page from refreshing when enter is pressed
$("form").submit(function (e) {
    e.preventDefault();
})
// Check if user pressed enter
$("#city-search").on("keyup", function (e) {
    if (e.key == "Enter" && e.target.value !== "") {
        loadCity(e.target.value, 1);
    }
});
// Check if user pressed search button
$("#search-city-btn").on("click", function (e) {
    if ($("#city-search").val() !== "") {
        loadCity($("#city-search").val(), 1);
    }
});

// ---Loads city weather---
function loadCity(cityName, AddHistory) {
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=db9bd5c5afe7227752152fd60b6e4d77`;
    $.ajax({
        url: url,
        success: function (data) {
            $("#city-name").text(data.name);
            $("#temp-span").text(Math.floor(data.main.temp) + "\u00B0C");
            $("#humid-span").text(data.main.humidity + "%");
            $("#wind-span").text(data.wind.speed + "m/sec");
            //loads UV index
            loadUV(data.coord.lat, data.coord.lon);
            //gets 5-day forecast
            loadFDay(data.name);
            if (AddHistory === 1) {
                addSearchHistory(data.name);
            }
            //gets icon image
            var iconcode = data.weather[0].icon;
            $('#weather-icon').attr('src', `https://openweathermap.org/img/w/${iconcode}.png`);
        },
        error: function (e) {
            console.log(e.responseText);
        }
    });
}

// ---Loads UV index---
function loadUV(lat, lon) {
    var url = `https://api.openweathermap.org/data/2.5/uvi?appid=db9bd5c5afe7227752152fd60b6e4d77&lat=${lat}&lon=${lon}`;
    $.ajax({
        url: url,
        method: "GET",
    }).then(function (res) {
        var uvI = Math.round(res.value * 10) / 10
        $("#uv-span").text(uvI);
        // UV color
        if (uvI <= 2.4) {
            //lime green
            $("#uv-span").css({ backgroundColor: "limegreen" });
            $("#uv-span").css({ color: "black" });
        }
        else if (uvI >= 2.5 && uvI <= 5.4) {
            //yellow
            $("#uv-span").css({ backgroundColor: "yellow" });
            $("#uv-span").css({ color: "black" });
        }
        else if (uvI >= 5.5 && uvI <= 7.4) {
            //orange
            $("#uv-span").css({ backgroundColor: "orange" });
            $("#uv-span").css({ color: "black" });
        }
        else if (uvI >= 7.5 && uvI <= 10.4) {
            //red
            $("#uv-span").css({ backgroundColor: "red" });
            $("#uv-span").css({ color: "white" });
        }
        else if (uvI > 10.5) {
            //dark violet
            $("#uv-span").css({ backgroundColor: "darkviolet" });
            $("#uv-span").css({ color: "white" });
        }
    });
}

// ---Loads 5-day forecast---
function loadFDay(cityName) {
    var url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=db9bd5c5afe7227752152fd60b6e4d77`;
    $.ajax({
        url: url,
        success: function (data) {
            // reset variables
            var tempArray = [];
            var hourCounter = 0;
            var dayCounter = moment(data.list[0].dt_txt).day();
            //if (dayCounter > 6) {
                // loops back to 0
              //  dayCounter = 0;
            //}
            var counter = 0;
            // search all weather list items
            $.each(data.list, function (index, val) {
                var date = moment(data.list[index].dt_txt);
                var day = date.day();
                // check what day we are currently in
                if (day === dayCounter) {
                    // adds all temps from that day to tempArray[]
                    tempArray.push(val.main.temp);
                }
                else {
                    // WHEN day has changed
                    // THEN find the index of highest temp in the day
                    var iMax = indexOfMax(tempArray);
                    var realIndex = hourCounter + iMax;
                    var dayName = days[dayCounter];
                    // added weather data to html elements
                    $(".fd-day-" + counter).text(dayName);
                    $(".fd-temp-" + counter).text(Math.floor(data.list[realIndex].main.temp) + "\u00B0C");
                    $(".fd-humid-" + counter).text(Math.floor(data.list[realIndex].main.humidity) + "%");
                    $('#fd-img-' + counter).attr('src', `https://openweathermap.org/img/w/${data.list[realIndex].weather[0].icon}.png`);
                    counter++;
                    // checks if the day has exceeded the week count
                    if (dayCounter <= 6) {
                        dayCounter++;
                    }
                    else {
                        // loops back to 0
                        dayCounter = 0;
                    }
                    hourCounter += tempArray.length;
                    tempArray = [];
                    tempArray.push(val.main.temp);
                }
            })
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
        refreshSearchHistory();
        // saves searchedCities array to local storage
        localStorage.setItem("userCities", JSON.stringify(searchedCities));
    }
}

// ---Refreshes search history list---
function refreshSearchHistory() {
    // clears list
    $("#city-list").html("");
    for (var i = 0; i < searchedCities.length; i++) {
        var newLi = $("<li id=list-id-" + searchedCities[i] + ">");
        newLi.text(searchedCities[i]);
        newLi.addClass("list-group-item list-group-item-action");
        newLi.click(function () {
            loadCity($(this).text());
            //$(this).addClass("active");
        });
        // appends city list items to list tag
        $("#city-list").append(newLi);
    }
}

// --IndexOfMax used in 5-day forecast
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var max = arr[0];
    var maxIndex = 0;
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }
    return maxIndex;
}

// ---Checks for user history in local storage---
if (localStorage.getItem("userCities") !== null) {
    searchedCities = JSON.parse(localStorage.getItem("userCities"));
    loadCity(searchedCities[0], 0);
    refreshSearchHistory();
}
else {
    //load Perth as default weather
    loadCity("Perth", 0);
}

// ---Collapse button for mobile responsiveness---
$("#cityCollapseBtn").on("click", function () {
    $("#cityCollapse").collapse("toggle");
})
