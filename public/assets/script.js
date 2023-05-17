function MobileToggle() {
    console.log("success");
    var Menu = document.getElementById("Menu");
    var Icon = document.getElementById("Icon");
    if (Menu.className == "overlay_closed") {
        Menu.className = "overlay_open";
        Icon.className = "fa-solid fa-xmark";
    } else {
        Menu.className = "overlay_closed";
        Icon.className = "fa-solid fa-bars";
    }
}

// For Json Modules //
// fetch("modules.json")
// .then(response => response.json())
// .then(modules => {
//     let output = "";
//     modules.forEach(module => {
//         output += "<p>Name: " + module.name + ", leader: " + module.leader + "</p>";
//     });

//     document.getElementById("result").innerHTML = output;
// });

// let exampleDiv = document.createElement("div") - Create new search results //
// document.getElementById("id_goes_here").appendChild(exampleDiv); - Append new search results to div //