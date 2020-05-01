var date = new Date();
var email;

//Check if user is logged in
if(getCookie("email") == "")
{
    window.location.href = "/";
}
else
{
    email = getCookie("email");
}

$(document).ready(function()
{
    /******************************************* SETUP ************************************************/
    //Variables
    var backgroundColorHEX = "#EAEDED";
    var color1 = "#009FE3";
    var substancesInfo;
    var substancesUsage;

    //Materialize
    $('.collapsible').collapsible();

    //Hide Elements - New Substance
    $('#newSubstance, #newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth').hide();

    //Hide Elements - Dashboard Nav Bar
    $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);

    //Hide Elements - Wikipedia
    $('#wikipedia, #wikipediaSubstanceInfo').hide();

    //Timers
    var updateNewSubstances;

    //Sizing/Position - Footer
    $('#footerNewSubstanceBtn').width($('#footerNewSubstanceBtn').height());
    $('#footerCalendarBtn').width($('#footerCalendarBtn').height());
    $('#footerBurgerBtn').width($('#footerBurgerBtn').height());
    $('#footerNewSubstanceBtnBorder').css
    ({
        width: $('#footerNewSubstanceBtn').width() + 10,
        height: $('#footerNewSubstanceBtn').height() + 10
    })
    $('#footerNewSubstanceBtnBorder').css('top', $('#footerNewSubstanceBtn').position().top - 5);
    
    //Sizing/Position - Dashboard Nav Bar
    $('#dashboardNavBar > div:first-child > div').css('width', $('#dashboardNavBar > div:first-child > p').width()/1.5);
    $('#dashboardNavBar > div:last-child > div').css('width', $('#dashboardNavBar > div:last-child > p').width()/1.5);

    //Initialize materialize items
    $('.timepicker').timepicker();
    $('.datepicker').datepicker();

    //Processing calendar
    $('#dashboardMiniCalendarMonth').text(date.toLocaleString('default', { month: 'long' }));
    var days = [];

    //Get first date of the month number
    var firstDayMonthNumber = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    var daysLength = 34;

    //If the month starts on a Sunday, add an extra week to the calendar
    if(firstDayMonthNumber == 7)
    {
        daysLength = 41;
    }
    
    //If it's not monday
    if(firstDayMonthNumber != 1)
    {
        for(var i = -Math.abs(firstDayMonthNumber - 2); i <= 0; i++)
        {
            days.push(new Date(date.getFullYear(), date.getMonth(), i).getDate())
            if(i+1 >= 1)
            {
                for(var j = 1; j <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); j++)
                {
                    days.push(j);
                    if(j+1 > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
                    {
                        var counterDays = 1;
                        if(days.length <= daysLength)
                        {
                            for(var k = 0; k <= daysLength; k++)
                            {
                                days.push(counterDays);
                                counterDays++;
                                if(k == daysLength)
                                {
                                    for(var r = 0; r < days.length; r++)
                                    {
                                        $('#dashboardMiniCalendar > div:last-child').append("<p>" + days[r] + "</p>");
                                    }
                                }
                            }
                        }
                        else
                        {
                            for(var r = 0; r < days.length; r++)
                            {
                                $('#dashboardMiniCalendar > div:last-child').append("<p>" + days[r] + "</p>");
                            }
                        }
                    }
                }
            }
        }
    }
    else
    {
        for(var i = 1; i <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); i++)
        {
            days.push(i);
            if(i+1 > new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate())
            {
                var counterDays = 1;
                for(var j = days.length; j <= daysLength; j++)
                {
                    days.push(counterDays);
                    counterDays++;
                    if(j == daysLength)
                    {
                        for(var k = 0; k < days.length; k++)
                        {
                            $('#dashboardMiniCalendar > div:last-child').append("<p>" + days[k] + "</p>");
                        }
                    }
                }
            }
        }
    }

    //Get data.json
    $.get('/getSubstanceData', function(data, status)
    {
        substancesInfo = data["Substances"];
    })

    $.get('/getSubstanceUsage',
    {
        email: email
    },
    function(data, status)
    {
        console.log(data);
        if(data["code"] == "200")
        {
            substancesUsage = data["data"];
            populateDashboardSubstances();
        }
        else if(data["code"] == "204")
        {
            $('#displayEntriesLoading').hide();
            $('#dashboardSubstances').append("<h5>No substances used! Yay! 🥳</h5>");
        }
    })

    footerResetImages("social");

    /******************************************* DASHBOARD ************************************************/
    $('#footerDashboardBtn').click(function()
    {
        cancelTimers();
        clearSubstanceInputs();
        footerResetImages("social");
        $('#dashboard').show();
        $('#newSubstance').hide();
    })

    $("#calendarBtn").click(function()
    {
        $('#dashboardNavBar > div:first-child > div').css('background-color', backgroundColorHEX);
        $('#dashboardNavBar > div:last-child > div').css('background-color', color1);
    })

    $("#dashboardBtn").click(function()
    {
        $('#dashboardNavBar > div:last-child > div').css('background-color', backgroundColorHEX);
        $('#dashboardNavBar > div:first-child > div').css('background-color', color1);
    })

    function populateDashboardSubstances()
    {
        $('#displayEntriesLoading').hide();
        $('#dashboardSubstances').css('margin-top', '15');
        $('#dashboardSubstances').empty();

        var recentTimestamp = {};
        var weekTimestamps = [];

        for(var i = 0; i < Object.keys(substancesUsage).length; i++)
        {
            recentTimestamp[Object.keys(substancesUsage)[i]] = [];
            for(var j = 0; j < substancesUsage[Object.keys(substancesUsage)[i]].length; j++)
            {
                recentTimestamp[Object.keys(substancesUsage)[i]].push(substancesUsage[Object.keys(substancesUsage)[i]][j]["timestamp"]);

                weekTimestamps[lessThanAWeek(+ new Date(), substancesUsage[Object.keys(substancesUsage)[i]][j]["timestamp"] * 1000)] = true;

                if(j+1 >= substancesUsage[Object.keys(substancesUsage)[i]].length)
                {
                    recentTimestamp[Object.keys(substancesUsage)[i]] = Math.max(...recentTimestamp[Object.keys(substancesUsage)[i]]);
                    
                }
            }
            if(i+1 >= Object.keys(substancesUsage).length)
            {
                if(weekTimestamps[0] || weekTimestamps[1])
                {
                    weekTimestamps.shift();
                    weekTimestamps[0] = true;
                }
            }
        }

        for(var i = 0; i < Object.keys(substancesUsage).length; i++)
        {
            $('#dashboardSubstances').append("<div class='dashboardSubstancesGroups'><h5>" + Object.keys(substancesUsage)[i] + "</h5><p>Last consumed - " + timeDifference(+ new Date(), recentTimestamp[Object.keys(substancesUsage)[i]]*1000) + "</p><div class='dashboardSubstancesGroupsStatus'></div>");

            if(i+1 >= Object.keys(substancesUsage).length)
            {
                for(var j = 0; j < 7; j++)
                {
                    $('.dashboardSubstancesGroupsStatus').append("<div class='dashboardSubstancesGroupsStatus" + j + "'></div>");

                    if(weekTimestamps[j])
                    {
                        $('.dashboardSubstancesGroupsStatus:last-child > div:last-child').css('background-color', 'red');
                    }

                    if(j+1 >= 7)
                    {
                        $('.dashboardSubstancesGroups > .dashboardSubstancesGroupsStatus').css('margin-bottom', $('.dashboardSubstancesGroups > h5').css('marginBottom'));
                    }
                }
            }
        }
    }

    /******************************************* NEW SUBSTANCE ************************************************/
    var moods, substanceInputData;

    $('#footerNewSubstanceBtn').click(function()
    {
        if(!$("#newSubstanceFirst, #newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth").is(":visible"))
        {
            moods = ["f", "f", "f"];
            substanceInputData = [];

            footerResetImages("add");
            cancelTimers();
            
            $('#dashboard').hide();
            $('#displaySubstancesLoading, #newSubstance, #newSubstanceFirst').show();
            $('#newSubstance').height($(document).height() - $('footer').height());

            if(substancesInfo)
            {
                $('#displaySubstances').empty();

                $('#displaySubstancesLoading').hide();

                if(Object.keys(substancesInfo).length >= 3)
                {
                    $('#displaySubstances').css('grid-template-columns', 'repeat(3, 1fr)');
                }
                else
                {
                    $('#displaySubstances').css('grid-template-columns', 'repeat(' + Object.keys(substancesInfo).length + ', 1fr)   ')  ;
                }

                $('#displaySubstancesLoading')
                for(var i = 0; i < Object.keys(substancesInfo).length; i++)
                {
                    $('#displaySubstances').append("<div class='substanceCard z-depth-4'><div class='substanceCardImage'><img   src='./img/substances/" + Object.keys(substancesInfo)[i].toLowerCase() + ".png'></div><div class='substanceCardName'><p class='center'>" + Object.keys(substancesInfo)[i] + "</p></div></div");
                }
            }
            else
            {
                updateNewSubstances = setTimeout(function()
                {
                    $('#footerNewSubstanceBtn').click();
                }, 500);
            }
        }
    })

    //On first page selection, open second page
    $('body').delegate('.substanceCard', 'click', function(e)
    {
        substanceInputData.push($(e.currentTarget).children()[1].innerText);
        $('#newSubstanceFirst').hide();
        $('#newSubstanceSecond').show();
        $('#inputDoseScale').css('margin-bottom', $('#inputDose').css('marginBottom'));
        $('#inputDoseScale').text(substancesInfo[$(e.currentTarget).children()[1].innerText]["dosages"]["scale"]);
    })

    $('body').delegate('#submitDosage', 'click', function(e)
    {
        if($('#inputDose').hasClass("valid"))
        {
            substanceInputData.push($('#inputDose').val());
            $('#newSubstanceSecond').hide();
            $('#newSubstanceThird').show();
        }
    })

    $('#submitDoseTime').click(function()
    {
        if($('#inputDoseTime').val() != "" && $('#inputDoseDate').val() != "")
        {
            var timeChosen = $('#inputDoseTime').val();
            var dateChosen = $('#inputDoseDate').val();
            //Parse Time
            timeChosen = timeChosen.split(" ");
            var timeChosenSplit = timeChosen[0].split(":");
            var timeChosenHour = parseInt(timeChosenSplit[0]);
            var timeChosenMin = timeChosenSplit[1];
            //Convert from 12 hour clock to 24 hour clock
            if(timeChosen[1] == "AM")
            {
                if(timeChosenHour == 12)
                {
                    timeChosenHour = 0;
                }
            }
            else
            {
                if(timeChosenHour != 12)
                {
                    timeChosenHour += 12;
                }
            }
            //Parse Date
            dateChosen = dateChosen.replace(',', "");
            dateChosen = dateChosen.split(" ");
            [dateChosen[0], dateChosen[1]] = [dateChosen[1], dateChosen[0]];
            dateChosen = dateChosen.join(" ");
            //Detect timezone
            var timeChosenTimezone = new Date().getTimezoneOffset();
            if(timeChosenTimezone < 0)
            {
                timeChosenTimezone = "+" + Math.abs(timeChosenTimezone/60);
            }
            else
            {
                timeChosenTimezone = "-" + Math.abs(timeChosenTimezone/60);
            }
            //Put it all together and create timestamp
            var timeChosenTimestamp = Date.parse(dateChosen + " " + timeChosenHour + ":" + timeChosenMin + ":" + new Date().getSeconds() + " GMT"+ timeChosenTimezone);

            substanceInputData.push(timeChosenTimestamp/1000);

            $('#newSubstanceThird').hide();

            var timeDifference = (Math.round((timeChosenTimestamp - Math.round(new Date().getTime()))/1000))/3600;
            var chosenSubstanceTimes = substancesInfo[substanceInputData[0]]["duration"]["vars"];

            $('#uploadingInputsLoading').hide();
            $('#moodInputBefore > h6').show();

            if(timeDifference >= -Math.abs(chosenSubstanceTimes["kick_in"]) && timeDifference < 4)
            {
                //About to take the substance
                $('#newSubstanceFourth > h5').text("How do you feel");
                $('#moodInputBefore').show();
                $('#moodInputDuring, #moodInputAfter, #moodInputBefore > h6').hide();
                displayMoodsTab();
            }
            else if(timeDifference < -Math.abs(chosenSubstanceTimes["maximum_duration"]))
            {
                //Substance effects have worn off
                $('#newSubstanceFourth > h5').text("How did you felt");
                $('#moodInputBefore, #moodInputDuring, #moodInputAfter').show();
                displayMoodsTab();
            }
            else if(timeDifference < -Math.abs(chosenSubstanceTimes["kick_in"]))
            {
                //On the effects of the susbtance at the moment
                $('#newSubstanceFourth > h5').text("How did/do you feel");
                $('#moodInputBefore, #moodInputDuring').show();
                $('#moodInputAfter').hide();
                displayMoodsTab();
            }
            else
            {
                //Taking the substance in the future
                substanceInputData.push(moods);
                submitMoods(substanceInputData);
            }
        }
    })

    $('#skipMoodsInput').click(function()
    {
        moods[0] = "f";
        moods[1] = "f";
        moods[2] = "f";
        $('#submitMoods').click();
    })

    $('#submitMoods').click(function()
    {
        if(moods[0] && moods[1] && moods[2])
        {
            substanceInputData.push(moods);
            $('#submitMoods, #skipMoodsInput').hide();
            $('#uploadingInputsLoading').show();
            submitMoods(substanceInputData);
        }
    })

    //Go back on second page
    $('#newSubstanceSecondBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceSecond').hide();
        $('#newSubstanceFirst').show();
    })

    $('#newSubstanceThirdBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceThird').hide();
        $('#newSubstanceSecond').show();
    })

    $('#newSubstanceFourthBack').click(function(e)
    {
        substanceInputData.pop();
        $('#newSubstanceFourth').hide();
        $('#newSubstanceThird').show();
        $('#newSubstance').height($(document).height() - $('footer').height());
    })

    function displayMoodsTab()
    {
        $('#newSubstance').height("auto");
        $('#newSubstanceFourth').show();

        $('.moods > img').click(function(e)
        {
            var moodInputVar = ["moodInputBefore", "moodInputDuring", "moodInputAfter"];
            for(var i = 0; i < moodInputVar.length; i++)
            {
                if($(e.target).parent().parent().attr('id') == moodInputVar[i])
                {
                    if(moods[i])
                    {
                        $('#' + moodInputVar[i] + " > .moods").children('img').each(function()
                        {
                            $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
                        })
                    }
                    moods[i] = $(e.target).attr('class');
                }
            }
            $(e.target).attr('src', './img/moods/' + $(e.target).attr('class') + 'Clicked.png');
        })
    }

    function submitMoods(inputs)
    {
        $.post('/addDose',
        {
            data: inputs,
            email: email
        }, 
        function(data, status)
        {
            $('.moods').children('img').each(function()
            {
                $(this).attr('src', './img/moods/' + $(this).attr('class') + '.png');
            })
            if(data == "200")
            {
                substancesUsage[inputs[0]].push({dosage: inputs[1], timestamp: inputs[2], moods: inputs[3]});
                
                $('#submitMoods, #skipMoodsInput, #dashboard').show();
                $('#uploadingInputsLoading, #newSubstanceFourth, #newSubstance').hide();

                populateDashboardSubstances();
                footerResetImages("social");
                clearSubstanceInputs();
            }
        })
    }

    /******************************************* GENERAL ************************************************/

    function footerResetImages(target)
    {
        for(var i = 0; i < $('#footerNavBar').children('img').length; i++)
        {
            if($('#footerNavBar').children('img')[i].name == target)
            {
                $($('#footerNavBar').children('img')[i]).attr('src', './img/icons/' + $('#footerNavBar').children('img')[i].name + "Clicked.png");
            }
            else
            {
                $($('#footerNavBar').children('img')[i]).attr('src', './img/icons/' + $('#footerNavBar').children('img')[i].name + ".png");
            }
        }
    }

    function cancelTimers()
    {
        clearTimeout(updateNewSubstances);
    }

    function clearSubstanceInputs()
    {
        $('#newSubstanceSecond, #newSubstanceThird, #newSubstanceFourth').hide();
        $('#inputDose, #inputDoseTime, #inputDoseDate').val("");
        $('#inputDose, #inputDoseTime, #inputDoseDate').removeClass("valid");
    }
})

function getCookie(cname) 
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) 
    {
        var c = ca[i];
        while (c.charAt(0) == ' ') 
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) 
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function timeDifference(current, previous) 
{

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) 
    {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }
    else if (elapsed < msPerHour) 
    {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }
    else if (elapsed < msPerDay ) 
    {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }
    else if (elapsed < msPerMonth) 
    {
        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
    }
    else if (elapsed < msPerYear) 
    {
        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }
    else 
    {
        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function lessThanAWeek(current, previous)
{
    var elapsed = current - previous;

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;

    if (elapsed < msPerMonth) 
    {
        if(Math.round(elapsed/msPerDay) <= 7)
        {
            return Math.round(elapsed/msPerDay);
        }   
    }
}