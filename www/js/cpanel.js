$(function () {
    loadListData("artists", "", "user", "albums")
})

$("li[data-action=artists]").live("click", function () {
    loadListData("artists", "", "user", "albums")
})

$("li[data-action=albums]").live("click", function () {
    loadListData("albums", $(this).attr("data-id"), "music", "tracks", "artists")
    lastartist = $(this).attr("data-id")
})

$("li[data-action=tracks]").live("click", function () {
    loadListData("tracks", $(this).attr("data-id"), "plus", "play", "albums")
})

$("li[data-action=play]").live("click", function () {
    $.ajax("/do/playtrack/"+$(this).attr("data-id"))
})

$("a[href=#]").live("click", function (e) {
    e.preventDefault()
})

var lastartist = 0
function loadListData(action, id, icon, next, prev) {
    $("#browselist > li").fadeOut(200, function () {
        $(this).remove()
    })
    setTimeout(function () {
        $("#browselist").append(
            $("<li />").addClass("nav-header").text(action)
        )
        $.getJSON("/do/get"+action+"/"+id, function (data) {
            $.each(data, function (k,v) {
                $("#browselist").append(
                    $("<li />").append(
                        $("<a />").text(" "+v).prepend(
                            $("<i />").addClass("icon-"+icon)
                        ).attr("href", "#")
                    ).attr({
                        "data-id": k,
                        "data-action": next
                    }).hide().fadeIn(200)
                )
            })
            if(prev) {
                var id = null
                if(prev == "albums") {
                    id = lastartist
                }
                $("#browselist").append(
                    $("<li />").addClass("divider")
                ).append(
                    $("<li />").append(
                        $("<a />").text(" Back").prepend(
                            $("<i />").addClass("icon-arrow-left")
                        ).attr("href", "#").addClass("text-success")
                    ).attr({
                        "data-id": id,
                        "data-action": prev
                    }).hide().fadeIn(200)
                )
            }
        })
    }, 200)
}