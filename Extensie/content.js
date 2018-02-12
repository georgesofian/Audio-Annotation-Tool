function injectScript(func){
    var code = "(" + func + ")();";
    var script = document.createElement("script");
    script.textContent = code;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}

function timeEvent(){
    var url = document.URL;
    var time = null;
    try{
        if(document.URL.indexOf("facebook")!=-1){
            time = document.querySelectorAll("video")[0].currentTime
        }
        else if(document.querySelectorAll("video")[0].baseURI != "https://www.youtube.com/"){//Pagina principala de youtube contine un player, asa ca il ignoram
            time = document.querySelectorAll("video")[0].getCurrentTime()
        }
    }
    catch(err){
        time = null
    }
    
    var event = new CustomEvent('info', {detail:{
        'url':url,
        'time':time
    }});

    document.dispatchEvent(event);
}

function getTime(functieCallback){
    var parsareEvent = function(data){
        functieCallback(data.detail);
        document.removeEventListener("info", parsareEvent);
    } 

    document.addEventListener("info", parsareEvent);
    injectScript(timeEvent);
}

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){ //Cream un listener pentru mesaje
    if(message == "giveInfo") //Raspundem doar mesajelor "giveInfo" 
        getTime(sendResponse) //Folosesc functia sendResponse ca callback pentru functia getTime
});

var annotationsDiv=document.createElement("div");
annotationsDiv.id = "annotationsDiv";   
annotationsDiv.hidden = true;   
annotationsDiv.style.position= "fixed"; annotationsDiv.style.top = '5px';     annotationsDiv.style.left = '5px';
annotationsDiv.style.width = '400px';     annotationsDiv.style.height = '200px';  annotationsDiv.style.zIndex = '9999';
annotationsDiv.style.background = 'rgba(61,61,61,0.5)'
annotationsDiv.style.textAlign = 'center'
document.body.appendChild(annotationsDiv); 

var annotationsContainer = document.createElement("div");
annotationsContainer.style.width = "90%";
annotationsContainer.style.height = "100%";
annotationsContainer.style.backgroundColor = "#4C4C4C";
annotationsContainer.style.margin= "auto";
annotationsContainer.style.display= "block";
annotationsDiv.appendChild(annotationsContainer);

annotationsContainer.innerHTML = "<br><font size='3' color='white'><b><i>Artists:</i><b></font><br>"
var artistsDiv = document.createElement('div');
artistsDiv.style.fontSize = "150%";
artistsDiv.id = "artistsDiv";
artistsDiv.style.backgroundColor = "white";
artistsDiv.style.width = "90%";
artistsDiv.style.height = "17%";
artistsDiv.style.margin = "auto";
annotationsContainer.appendChild(artistsDiv);

annotationsContainer.innerHTML += "<font size='3' color='white'><b><i>Tags:</i><b></font><br>"
tagsDiv = document.createElement("div");
tagsDiv.id = "tagsDiv";
tagsDiv.style.fontSize = "150%";
tagsDiv.style.backgroundColor = "white";
tagsDiv.style.width = "90%";
tagsDiv.style.height = "17%";
tagsDiv.style.margin = "auto";
annotationsContainer.appendChild(tagsDiv);

annotationsContainer.innerHTML += "<font size='3' color='white'><b><i>Links:</i><b></font><br>"
var linksDiv = document.createElement("div");
linksDiv.id ="linksDiv";
linksDiv.style.fontSize = "100%";
linksDiv.style.backgroundColor = "white";
linksDiv.style.width = "90%";
linksDiv.style.height = "17%";
linksDiv.style.margin = "auto";
annotationsContainer.appendChild(linksDiv);



function updateDiv(){
    chrome.storage.sync.get(["annotationsData"], function(object){
        if(object.annotationsData && object.annotationsData[document.URL]){
            var data = object.annotationsData[document.URL]

            getTime(function(info){
                var currentTime = Math.ceil(info.time)

                var minDiff = 999999 ;
                var minDiffObject = null;

                for(var timeKey in data){
                    var timeValue = parseInt(timeKey);
                    var timeDiff  = Math.abs(currentTime - timeValue)
                    if(timeDiff <=5 && minDiff > timeDiff){
                        minDiff = timeDiff
                        minDiffObject = data[timeKey]
                    }
                }
                
                if(minDiffObject){
                    annotationsDiv.hidden = false;
                    document.getElementById("linksDiv").innerText    = "";
                    document.getElementById("tagsDiv").innerText  = "";
                    document.getElementById("artistsDiv").innerText  = "";
                    for(var intrare in minDiffObject){
                        switch(minDiffObject[intrare].tip){
                            case "tag": {
                                document.getElementById("tagsDiv").innerText  += minDiffObject[intrare].continut+"; ";
                                break;
                            }
                            case "artist": {
                                document.getElementById("artistsDiv").innerText  += minDiffObject[intrare].continut+"; ";
                                break;
                            }
                            case "link": {
                                if(minDiffObject[intrare].continut.indexOf("http")==-1)
                                    document.getElementById("linksDiv").innerHTML  += "<a href=http://" + minDiffObject[intrare].continut +" target='_blank'>"+ minDiffObject[intrare].continut +"</a>;&nbsp;";
                                else
                                    document.getElementById("linksDiv").innerHTML  += "<a href=" + minDiffObject[intrare].continut +" target='_blank'>"+ minDiffObject[intrare].continut +"</a>;&nbsp;";
                            }
                        }
                    }
                }
                else{
                    annotationsDiv.hidden = true;
                    document.getElementById("linksDiv").innerText    = "";
                    document.getElementById("tagsDiv").innerText  = "";
                    document.getElementById("artistsDiv").innerText  = "";
				}
            });
        }
    });
}

setInterval(updateDiv, 1000);
// chrome.storage.sync.get(['annotationsData'], function(object){
//     console.log(object.annotationsData[document.URL]);
// });