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
        else if(document.querySelectorAll("video")[0].baseURI != "https://www.youtube.com/"){
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

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    if(message == "giveInfo")
        getTime(sendResponse)
});

var annotationsDiv=document.createElement("div");
annotationsDiv.id = "annotationsDiv";   annotationsDiv.hidden = true;   
annotationsDiv.style.position= "fixed"; annotationsDiv.style.top = '25%';     annotationsDiv.style.left = '25%';
annotationsDiv.style.width = '40%';     annotationsDiv.style.height = '40%';  annotationsDiv.style.zIndex = '5000';
annotationsDiv.style.background = 'rgba(61,61,61,0.5)'
annotationsDiv.style.textAlign = 'center'
document.body.appendChild(annotationsDiv); 

var annotationsContainer = document.createElement("div");
annotationsContainer.style.width = "80%";
annotationsContainer.style.height = "100%";
annotationsContainer.style.backgroundColor = "#4C4C4C";
annotationsContainer.style.margin= "auto";
annotationsContainer.style.display= "block";
annotationsDiv.appendChild(annotationsContainer);

var tagsContainer = document.createElement("div");
tagsContainer.style.height = "25%";
tagsContainer.style.width  = "100%";
tagsContainer.style.backgroundColor = "#3D3D3D";
tagsContainer.style.textAlign = 'left';
tagsContainer.style.color= "#FFFFFF";
tagsContainer.style.display= "block";
tagsContainer.innerHTML = "<font size='4'><b>Tags:</b></font><br>";
annotationsContainer.appendChild(tagsContainer);

var tagsDiv = document.createElement("textarea");
tagsDiv.innerText = "tags";
tagsDiv.style.width = "95%";
tagsDiv.style.margin ="auto"
tagsDiv.style.padding = "0px";
tagsDiv.style.textAlign = 'center';
tagsDiv.style.color = "##000000";
tagsContainer.appendChild(tagsDiv);

var artistsContainer = document.createElement("div");
artistsContainer.style.height = "25%";
artistsContainer.style.width  = "100%";
artistsContainer.style.backgroundColor = "#3D3D3D";
artistsContainer.style.textAlign = 'left';
artistsContainer.style.color= "#FFFFFF";
artistsContainer.style.display= "block";
artistsContainer.innerHTML = "<font size='4'><b>Artists:</b></font><br>";
annotationsContainer.appendChild(artistsContainer);

var artistsDiv = document.createElement("textarea");
artistsDiv.innerText = "artisti";
artistsDiv.style.width = "95%";
artistsDiv.style.padding = "0px";
artistsDiv.style.textAlign = 'center';
artistsDiv.style.color = "#000000";
artistsContainer.appendChild(artistsDiv);

var linksContainer = document.createElement("div");
linksContainer.style.height = "25%";
linksContainer.style.width  = "100%";
linksContainer.style.backgroundColor = "#3D3D3D";
linksContainer.style.textAlign = 'left';
linksContainer.style.color= "#FFFFFF";
linksContainer.style.display= "block";
linksContainer.innerHTML = "<font size='4'><b>Links:</b></font><br>";
annotationsContainer.appendChild(linksContainer);

var linksDiv = document.createElement("textarea");
linksDiv.innerText = "links";
linksDiv.style.width = "95%";
linksDiv.style.textAlign = 'center';
linksDiv.style.padding = "0px";
linksDiv.style.color = "#000000";
linksContainer.appendChild(linksDiv);



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
                    if(timeDiff <=3 && minDiff > timeDiff){
                        minDiff = timeDiff
                        minDiffObject = data[timeKey]
                    }
                }
                
                if(minDiffObject){
                    annotationsDiv.hidden = false;
                }
                else
                    annotationsDiv.hidden = true;
					for (var Key in minDiffObject){
					tagsDiv.innerText = tagsDiv.innerText + minDiffObject[Key]["continut"];
					}
            });
        }
    });
}

setInterval(updateDiv, 1000);
chrome.storage.sync.get(['annotationsData'], function(object){
    console.log(object.annotationsData[document.URL]);
});