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
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=256b25d2b8a8f2b130f652e84d69f8ee`;
    $.ajax({
        url: url,
        success: function (data) {
            $("#city-name").text(data.name);
            $("#temp-span").text(Math.floor(data.main.temp) + "\u00B0C");
            $("#humid-span").text(data.main.humidity);
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
            $('#weather-icon').attr('src', `http://openweathermap.org/img/w/${iconcode}.png`);
        },
        error: function (e) {
            console.log(e.responseText);
        }
    });
}

// ---Loads UV index---
function loadUV(lat, lon) {
    var url = `https://api.openweathermap.org/data/2.5/uvi?appid=256b25d2b8a8f2b130f652e84d69f8ee&lat=${lat}&lon=${lon}`;
    $.ajax({
        url: url,
        method: "GET",
    }).then(function (res) {
        var uvI = res.value;
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
    var url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=256b25d2b8a8f2b130f652e84d69f8ee`;
    $.ajax({
        url: url,
        success: function (data) {
            $.each(data.list, function (index, val) {
                var date = new Date(data.list[index].dt * 1000);
                var dateHour = date.getHours();
                var dateDay = date.getDay();
                if (date.getDay() !== 0 && dateHour === 14) {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var dayName = days[dateDay];
                    $(".fd-day-" + dateDay).text(dayName);
                    $(".fd-temp-" + dateDay).text(Math.floor(val.main.temp) + "\u00B0C");
                    $(".fd-humid-" + dateDay).text(Math.floor(val.main.humidity));
                    $('#fd-img-' + dateDay).attr('src', `http://openweathermap.org/img/w/${val.weather[0].icon}.png`);
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