var url = null;
var time = null;

chrome.storage.sync.set({"annotationsData":{}});

function setInfo(){
    chrome.tabs.query({'active': true,'currentWindow':true},function(tab){//Obtinem tab-urile active ale ferestrei
        chrome.tabs.sendMessage(tab[0].id,"giveInfo", function(response){//Trimitem mesaj "giveInfo" catre tab-ul activ si primim ca raspuns informatiile necesare
            if(response){
                url = response.url;
                document.getElementById("time").innerText = "00:00"
                document.getElementById("urldiv").innerText = "No video found"
                time = null;
                if(response.time){
                    time = Math.ceil(response.time)
                    document.getElementById("time").innerText = time;
                    document.getElementById("urldiv").innerText = url
                }
            }
            else{
                document.getElementById("urldiv").innerText = 'No video found'
            }
        });
    });
}

function _save(notes){
    chrome.storage.sync.get(["annotationsData"], function(object){
        if(object.annotationsData){
            var annotationsData = object.annotationsData;

            if(!annotationsData[url])
                annotationsData[url] = {}                
            annotationsData[url][time] = notes;

            chrome.storage.sync.set({"annotationsData":annotationsData});
        }
        else{
            chrome.storage.sync.set({"annotationsData": {url: { time : notes }}})
        }
    });
}

function saveData(){
    if(url && time!=null){
        var notes = [];
        var tags = document.getElementById("tags").value.split(';');
        var artists = document.getElementById("artists").value.split(';');
        var links = document.getElementById("links").value.split(';');

        for( var index in tags)
            if(tags[index]!='')
                notes.push({tip:"tag", continut: tags[index]});

        for( var index in artists)
            if(artists[index]!='')
                notes.push({tip:"artist", continut: artists[index]});
        
        for( var index in links)
            if(links[index]!='')
                notes.push({tip:"link", continut: links[index]});

        if(notes.length>0){
            _save(notes);
        }

    }
}

function reset(){
    if(url){
        chrome.storage.sync.get(["annotationsData"], function(object){
            if(object.annotationsData){
                annotationsData = object.annotationsData;
                delete annotationsData[url]
                chrome.storage.sync.set({"annotationsData": annotationsData});
            }
        }); 
    }
}

chrome.tabs.query({'active': true,'currentWindow':true},function(tab){//Obtinem tab-urile active ale ferestrei
    chrome.tabs.sendMessage(tab[0].id,"giveInfo", function(response){//Trimitem mesaj "giveInfo" catre tab-ul activ si primim ca raspuns informatiile necesare
        if(response){
            document.getElementById("urldiv").innerText = response.url;
            url = response.url;
            if(response.time){
                document.getElementById("time").innerText = Math.ceil(response.time)
                time = Math.ceil(response.time)
            }
            else{
                document.getElementById("time").innerText = "00:00";
                time = null;
                document.getElementById("urldiv").innerText = "No video found";
            }
        }
        else{
            document.getElementById("urldiv").innerText = "No video found";
        }
    });
});

function exportData(){
    chrome.storage.sync.get(['annotationsData'], function(object){
        if(object.annotationsData){
            data = JSON.stringify(object.annotationsData);
            exportWindow = window.open(null);
            exportWindow.document.write(data);
        }
    });
}

document.getElementById("saveButton").onclick = saveData;
document.getElementById("getInfoButton").onclick = setInfo;
document.getElementById("reset").onclick = reset;
document.getElementById("export").onclick = exportData;