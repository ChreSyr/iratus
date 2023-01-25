
function setStyle(num) {
    var maintheme = document.getElementById('maincss');
    var customtheme = document.getElementById('customcss');
    if (num === 'no') {
        maintheme.setAttribute('href', null)
    } else {
        maintheme.setAttribute('href', 'sharedstyle.css')
    }
    customtheme.setAttribute('href', 'stylesheet' + num + '.css')
}