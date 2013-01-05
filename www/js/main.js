function formatTime(seconds) {
    seconds = Math.round(seconds)
    var minutes = Math.floor(seconds / 60)
    seconds = seconds - minutes * 60
    if(seconds < 10) seconds = "0" + seconds
    if(minutes >= 60) {
        var hours = Math.floor(minutes / 60)
        minutes = minutes - hours * 60
        if(minutes < 10) minutes = "0" + minutes

        return hours + ":" + minutes + ":" + seconds
    }
    return minutes + ":" + seconds
}

var prevsongid = -1
var prevnextsongid = -1
function update() {
    $.getJSON("/do/update", function (data) {
        if(data.error) {
            $("#alert").text(data.error)
        } else {
            $("#alert:visible").hide()
        }

        $("#musicprogress .bar").width(((data.elapsed*1+(data.state == "play" ? 1 : 0)) / data.songdata.time * 100) + "%")
            .text(formatTime(data.elapsed) + " / " + formatTime(data.songdata.time))
        $("#volume").text(data.volume)

        if(data.songid != prevsongid) {
            prevsongid != data.songid
            if(data.songdata.artist && data.songdata.title) {
                $("#nowplaying").text(data.songdata.artist + " - " + data.songdata.title)
            } else if(data.songdata.title) {
                $("#nowplaying").text(data_songdata.artist + " - " + data.songdata.title)
            } else {
                $("#nowplaying").text(data.songdata.file)
            }

            $("#song-artist").text(data.songdata.artist || "-")
            $("#song-album").text(data.songdata.album || "-")
            $("#song-title").text(data.songdata.title || "-")
            $("#song-length").text(formatTime(data.songdata.time))
            $("#song-genre").text(data.songdata.genre)
            $("#song-filename").text(data.songdata.file)

            $("#playlist tr").removeClass("info")
            $("#playlist tr[data-id=" + data.songid + "]").addClass("info")
        }

        if(data.nextsongid != prevnextsongid) {
            prevnextsongid != data.nextsongid
            $("#nextsong-artist").text(data.nextsongdata.artist || "-")
            $("#nextsong-album").text(data.nextsongdata.album || "-")
            $("#nextsong-title").text(data.nextsongdata.title || "-")
            $("#nextsong-length").text(formatTime(data.nextsongdata.time))
            $("#nextsong-genre").text(data.nextsongdata.genre)
            $("#nextsong-filename").text(data.nextsongdata.file)
        }

        if(data.state == "play") {
            $("#playpause.play").removeClass("play").addClass("pause")
            .find("i").removeClass("icon-play").addClass("icon-pause")
        } else {
            $("#playpause.pause").removeClass("pause").addClass("play")
            .find("i").removeClass("icon-pause").addClass("icon-play")
        }
    })
}

setInterval(update, 1000)

$("[data-href], [href]").click(function (e) {
    $.ajax($(this).attr("data-href") || $(this).attr("href"))
    update()
    e.preventDefault()
})

$("#playpause").click(function () {
    $.ajax("/do/pause")
    update()
})

$("#musicprogress").click(function (e) {
    $.ajax("/do/seekpercent/" + Math.round(e.offsetX / $(this).width() * 100, 0))
    update()
})

var playlistsearchdata
var trackssearchdata

$.getJSON("/do/getalltracks", function (data) {
    var tracks = 0, seconds = 0
    trackssearchdata = []

    $.each(data, function (k, v) {
        console.log(v)
        tracks++
        seconds += v.time*1

        var row = $("<tr />").attr("data-filename", v.file).attr("data-nr", tracks)
        if(v.artist && v.title) {
            row.append($("<td />").text(v.artist))
            row.append($("<td />").text(v.album || "-"))
            row.append($("<td />").text(v.title))
            trackssearchdata[tracks] = (v.artist + " - " + (v.album ? v.album + " - " : "") + v.title).toLowerCase()
        } else if(v.title) {
            row.append($("<td />").text(v.title).attr("col-span", "3"))
            trackssearchdata[tracks] = (v.title).toLowerCase()
        } else {
            row.append($("<td />").text(v.file).attr("col-span", "3"))
            trackssearchdata[tracks] = (v.file).toLowerCase()
        }
        row.append($("<td />").text(formatTime(v.time)))
        $("#alltrackslist").append(row)
    })

    $("#totaltracks").text(tracks)
    $("#totaltime").text(formatTime(seconds))

    update()
})

$.getJSON("/do/getplaylist", function (data) {
    var tracks = 0, seconds = 0
    playlistsearchdata = []

    $.each(data, function (k, v) {
        tracks++
        seconds += v.time*1

        var row = $("<tr />").attr("data-id", v.id)
        row.append($("<td />").text(v.pos*1+1))
        if(v.artist && v.title) {
            row.append($("<td />").text(v.artist))
            row.append($("<td />").text(v.album || "-"))
            row.append($("<td />").text(v.title))
            playlistsearchdata[tracks] = (v.artist + " - " + (v.album ? v.album + " - " : "") + v.title).toLowerCase()
        } else if(v.title) {
            row.append($("<td />").text(v.title).attr("col-span", "3"))
            playlistsearchdata[tracks] = (v.title).toLowerCase()
        } else {
            row.append($("<td />").text(v.file).attr("col-span", "3"))
            playlistsearchdata[tracks] = (v.file).toLowerCase()
        }
        row.append($("<td />").text(formatTime(v.time)))
        $("#playlist").append(row)
    })

    $("#playlisttracks").text(tracks)
    $("#playlisttime").text(formatTime(seconds))

    update()
})

$("#playlistsearch").keyup(function (e) {
    if($(this).val() == "") {
        $("#playlist").removeClass("searching")
    } else {
        $("#playlist").addClass("searching")
        $("#playlist tr").removeClass("result")
        for(k in playlistsearchdata) {
            var v = playlistsearchdata[k]
            if(v.indexOf($(this).val().toLowerCase()) > -1) {
                $("#playlist tr:nth-child("+k+")").addClass("result")
            }
        }
    }
})
$("#trackssearch").keyup(function (e) {
    if($(this).val() == "") {
        $("#alltracks").removeClass("searching")
    } else {
        $("#alltracks").addClass("searching")
        $("#alltracks tr").removeClass("result")
        for(k in trackssearchdata) {
            var v = trackssearchdata[k]
            if(v.indexOf($(this).val().toLowerCase()) > -1) {
                $("#alltracks tr:nth-child("+k+")").addClass("result")
            }
        }
    }
})

$("#playlist tr").live("click", function () {
    $.ajax("/do/changetrack/"+$(this).attr("data-id"))
})
